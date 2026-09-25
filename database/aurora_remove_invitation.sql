-- Applied to Aurora Bachelor Supabase on 2026-09-25.
-- Only a signed-in household owner or admin can permanently delete
-- an invitation that is still pending. Accepted invitations are preserved.
create or replace function public.aurora_remove_invitation(
  p_household_id uuid,
  p_invitation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (select auth.uid()) is null
     or not public.aurora_is_house_manager(p_household_id) then
    raise exception 'Aurora: owner or admin access required.';
  end if;

  delete from public.invitations as invitation
  where invitation.id = p_invitation_id
    and invitation.household_id = p_household_id
    and invitation.status = 'pending';

  if not found then
    raise exception 'Aurora: pending invitation not found.';
  end if;
end;
$function$;

revoke all on function public.aurora_remove_invitation(uuid, uuid) from public;
revoke all on function public.aurora_remove_invitation(uuid, uuid) from anon;
grant execute on function public.aurora_remove_invitation(uuid, uuid) to authenticated;
