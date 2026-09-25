-- Applied to Aurora Bachelor Supabase on 2026-09-25.
-- The revoke RPC and invitation audit trigger use the 'revoked' state.
alter table public.invitations drop constraint invitations_status_check;

alter table public.invitations
  add constraint invitations_status_check
  check (status in ('pending', 'accepted', 'expired', 'cancelled', 'revoked'));
