-- Visitor reviews are stored separately from the portfolio JSON store.
-- Public submissions are accepted only by the server API and remain pending until moderated.
create table if not exists public.prime_reviews (
  id uuid primary key default gen_random_uuid(),
  visitor_name text not null check (char_length(btrim(visitor_name)) between 2 and 60),
  review_text text not null check (char_length(btrim(review_text)) between 15 and 700),
  rating smallint not null check (rating between 1 and 5),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists prime_reviews_status_created_at_idx
  on public.prime_reviews (status, created_at desc);

alter table public.prime_reviews enable row level security;
revoke all on table public.prime_reviews from anon, authenticated;
grant select, insert, update on table public.prime_reviews to service_role;

-- Store only a keyed HMAC of the requester's IP, never the raw address; stale entries are
-- removed on submission. The server key is used to make the fingerprint non-reversible.
create table if not exists public.prime_review_rate_limits (
  fingerprint text primary key check (fingerprint ~ '^[0-9a-f]{64}$'),
  last_submission_at timestamptz not null default now()
);
alter table public.prime_review_rate_limits enable row level security;
revoke all on table public.prime_review_rate_limits from anon, authenticated, service_role;

create or replace function public.prime_reviews_submit(
  p_fingerprint text,
  p_visitor_name text,
  p_review_text text,
  p_rating smallint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
  new_review_id uuid;
begin
  if pg_catalog.char_length(pg_catalog.btrim(p_visitor_name)) not between 2 and 60
     or pg_catalog.char_length(pg_catalog.btrim(p_review_text)) not between 15 and 700
     or p_rating not between 1 and 5 then
    raise exception 'Invalid review submission';
  end if;

  if p_fingerprint is not null then
    if p_fingerprint !~ '^[0-9a-f]{64}$' then
      return null;
    end if;

    delete from public.prime_review_rate_limits
      where last_submission_at < pg_catalog.now() - interval '24 hours';

    insert into public.prime_review_rate_limits as existing (fingerprint, last_submission_at)
      values (p_fingerprint, pg_catalog.now())
      on conflict (fingerprint) do update
        set last_submission_at = excluded.last_submission_at
        where existing.last_submission_at < pg_catalog.now() - interval '2 minutes'
      returning true into allowed;

    if not COALESCE(allowed, false) then
      return null;
    end if;
  end if;

  insert into public.prime_reviews (visitor_name, review_text, rating, status)
    values (pg_catalog.btrim(p_visitor_name), pg_catalog.btrim(p_review_text), p_rating, 'pending')
    returning id into new_review_id;

  return new_review_id;
end;
$$;

revoke all on function public.prime_reviews_submit(text, text, text, smallint) from public, anon, authenticated;
grant execute on function public.prime_reviews_submit(text, text, text, smallint) to service_role;
