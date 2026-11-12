-- ΠΡΙΜΕ portfolio: store transaccional et bucket d'avatars privé.
create table if not exists public.prime_store (
  id text primary key check (id = 'main'),
  store jsonb not null check (jsonb_typeof(store) = 'object'),
  version bigint not null default 0 check (version >= 0),
  updated_at timestamptz not null default now()
);

alter table public.prime_store enable row level security;
revoke all on table public.prime_store from anon, authenticated;
grant select, insert on table public.prime_store to service_role;

create or replace function public.prime_store_compare_and_swap(
  p_expected_version bigint,
  p_next_store jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_catalog.jsonb_typeof(p_next_store) is distinct from 'object' then
    raise exception 'store must be a JSON object';
  end if;
  update public.prime_store
    set store = p_next_store,
        version = version + 1,
        updated_at = pg_catalog.now()
    where id = 'main' and version = p_expected_version;
  return found;
end;
$$;

revoke all on function public.prime_store_compare_and_swap(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.prime_store_compare_and_swap(bigint, jsonb) to service_role;

-- API routes use the server-only secret key and enforce the portfolio's own admin/public checks.
-- Keep the bucket private; do not add anonymous Storage policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('prime-avatars', 'prime-avatars', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
