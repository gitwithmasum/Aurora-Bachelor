CREATE OR REPLACE FUNCTION public.aurora_accept_invitation(p_token text)
 RETURNS TABLE(household_id uuid, house_name text, member_role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_token text;
  v_token_hash text;

  v_invitation_id uuid;
  v_household_id uuid;
  v_house_name text;

  v_invited_email text;
  v_status text;
  v_expires_at timestamptz;

  v_current_email text;
  v_member_role text;

begin

  /* ==========================================================
     LOGIN REQUIRED
  ========================================================== */

  if auth.uid() is null then

    raise exception
      'Aurora: Google login is required.';

  end if;


  /* ==========================================================
     GOOGLE IDENTITY REQUIRED
  ========================================================== */

  if not exists (

    select 1

    from auth.identities ai

    where ai.user_id = auth.uid()
      and ai.provider = 'google'

  ) then

    raise exception
      'Aurora: please sign in using Google.';

  end if;


  /* ==========================================================
     CURRENT GOOGLE EMAIL
  ========================================================== */

  select
    pg_catalog.lower(u.email)

  into
    v_current_email

  from auth.users u

  where u.id = auth.uid();


  if
    v_current_email is null
    or v_current_email = ''
  then

    raise exception
      'Aurora: Google account email could not be verified.';

  end if;


  /* ==========================================================
     TOKEN
  ========================================================== */

  v_token :=
    pg_catalog.btrim(
      p_token
    );


  if
    v_token is null
    or v_token = ''
  then

    raise exception
      'Aurora: invitation token is missing.';

  end if;


  v_token_hash :=

    pg_catalog.encode(

      pg_catalog.sha256(

        pg_catalog.convert_to(
          v_token,
          'UTF8'
        )

      ),

      'hex'

    );


  /* ==========================================================
     FIND INVITATION
  ========================================================== */

  select

    i.id,
    i.household_id,
    h.name,
    pg_catalog.lower(i.email),
    i.status,
    i.expires_at

  into

    v_invitation_id,
    v_household_id,
    v_house_name,
    v_invited_email,
    v_status,
    v_expires_at

  from public.invitations i

  join public.households h
    on h.id = i.household_id

  where i.token_hash =
        v_token_hash

  limit 1

  for update of i;


  if not found then

    raise exception
      'Aurora: invalid invitation link.';

  end if;


  /* ==========================================================
     STATUS CHECK
  ========================================================== */

  -- A repeated acceptance is safe only for the original recipient
  -- while their household membership still exists. Never recreate access
  -- from an accepted link after the owner removes the member.
  if v_status = 'accepted' then
    if v_current_email = v_invited_email
       and exists (
         select 1 from public.invitations i
         where i.id = v_invitation_id and i.accepted_by = auth.uid()
       ) then
      select hm.role into v_member_role
      from public.house_members hm
      where hm.household_id = v_household_id and hm.user_id = auth.uid();

      if v_member_role is not null then
        return query select v_household_id, v_house_name, v_member_role;
        return;
      end if;

      raise exception 'Aurora: your household access was removed. Ask the owner for a new invitation.';
    end if;

    raise exception 'Aurora: this invitation belongs to a different Google account.';
  end if;

  if v_status <> 'pending' then

    raise exception
      'Aurora: this invitation is no longer active.';

  end if;


  /* ==========================================================
     EXPIRY CHECK
  ========================================================== */

  if
    v_expires_at is null
    or v_expires_at < pg_catalog.now()
  then

    update public.invitations i

    set
      status = 'expired',
      updated_at = pg_catalog.now()

    where i.id =
          v_invitation_id;


    raise exception
      'Aurora: this invitation has expired.';

  end if;


  /* ==========================================================
     INVITED EMAIL MUST MATCH GOOGLE LOGIN
  ========================================================== */

  if
    v_current_email <>
    v_invited_email
  then

    raise exception
      'Aurora: this invitation belongs to a different Google account.';

  end if;


  /* ==========================================================
     USER CANNOT BELONG TO ANOTHER HOUSE
  ========================================================== */

  if exists (

    select 1

    from public.house_members hm

    where hm.user_id =
          auth.uid()

      and hm.household_id <>
          v_household_id

  ) then

    raise exception
      'Aurora: this Google account already belongs to another household.';

  end if;


  /* ==========================================================
     ADD TO HOUSE

     No ambiguous ON CONFLICT reference.
  ========================================================== */

  if not exists (

    select 1

    from public.house_members hm

    where hm.household_id =
          v_household_id

      and hm.user_id =
          auth.uid()

  ) then

    begin

      insert into public.house_members (

        household_id,
        house_name,
        user_id,
        role

      )

      values (

        v_household_id,
        v_house_name,
        auth.uid(),
        'member'

      );

    exception

      when unique_violation then
        null;

    end;

  end if;


  /* ==========================================================
     READ ACTUAL ROLE
  ========================================================== */

  select
    hm.role

  into
    v_member_role

  from public.house_members hm

  where hm.household_id =
        v_household_id

    and hm.user_id =
        auth.uid()

  limit 1;


  if v_member_role is null then

    raise exception
      'Aurora: household membership could not be created.';

  end if;


  /* ==========================================================
     UPDATE PROFILE MIRROR
  ========================================================== */

  update public.profiles p

  set

    household_id =
      v_household_id,

    house_name =
      v_house_name,

    role =
      v_member_role

  where p.id =
        auth.uid();


  /* ==========================================================
     ACCEPT INVITATION
  ========================================================== */

  update public.invitations i

  set

    status =
      'accepted',

    accepted_by =
      auth.uid(),

    accepted_at =
      pg_catalog.now(),

    updated_at =
      pg_catalog.now()

  where i.id =
        v_invitation_id;


  /* ==========================================================
     RETURN
  ========================================================== */

  return query

  select

    v_household_id,

    v_house_name,

    v_member_role;

end;

$function$
;
revoke execute on function public.aurora_accept_invitation(text) from public, anon;
grant execute on function public.aurora_accept_invitation(text) to authenticated, service_role;
