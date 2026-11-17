-- Allow the admin API to permanently remove rejected visitor reviews only.
-- Returns NULL when the id is missing or the review is not rejected.
create or replace function public.prime_reviews_delete_rejected(p_review_id uuid)
returns uuid
language sql
security definer
set search_path = ''
as $$
  delete from public.prime_reviews
   where id = p_review_id
     and status = 'rejected'
  returning id;
$$;

revoke all on function public.prime_reviews_delete_rejected(uuid) from public, anon, authenticated;
grant execute on function public.prime_reviews_delete_rejected(uuid) to service_role;
