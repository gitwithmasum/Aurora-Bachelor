begin;
create temporary table aurora_invite_regression_result (scenario text, passed boolean) on commit drop;
do $test$
declare
  recipient uuid; owner_user uuid; house uuid; invitation uuid; email_address text;
  new_token text; new_invitation uuid; token text := 'aurora-regression-' || gen_random_uuid()::text;
  blocked boolean := false; n integer;
begin
  select i.accepted_by,h.owner_id,i.household_id,i.id,u.email
  into recipient,owner_user,house,invitation,email_address
  from public.invitations i
  join public.house_members hm on hm.household_id=i.household_id and hm.user_id=i.accepted_by
  join public.households h on h.id=i.household_id
  join auth.users u on u.id=i.accepted_by
  where i.status='accepted' and i.accepted_by<>h.owner_id
  and exists(select 1 from auth.identities ai where ai.user_id=i.accepted_by and ai.provider='google')
  limit 1;
  if recipient is null then raise exception 'No test fixture'; end if;

  update public.invitations set token_hash=encode(sha256(convert_to(token,'UTF8')),'hex') where id=invitation;
  perform set_config('request.jwt.claim.sub',recipient::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',recipient,'role','authenticated')::text,true);
  select count(*) into n from public.aurora_accept_invitation(token);
  if n<>1 then raise exception 'Accepted invitation retry failed'; end if;
  insert into aurora_invite_regression_result values ('Accepted link resumes existing membership',true);

  perform set_config('request.jwt.claim.sub',owner_user::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',owner_user,'role','authenticated')::text,true);
  begin
    perform public.aurora_accept_invitation(token);
  exception when others then
    if sqlerrm like '%different Google account%' then blocked:=true; else raise; end if;
  end;
  if not blocked then raise exception 'Wrong account unexpectedly accepted'; end if;
  insert into aurora_invite_regression_result values ('Wrong account rejected',true);

  perform public.aurora_remove_member(house,recipient);
  perform set_config('request.jwt.claim.sub',recipient::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',recipient,'role','authenticated')::text,true);
  blocked:=false;
  begin
    perform public.aurora_accept_invitation(token);
  exception when others then
    if sqlerrm like '%access was removed%' then blocked:=true; else raise; end if;
  end;
  if not blocked then raise exception 'Removed member regained access from old link'; end if;
  insert into aurora_invite_regression_result values ('Removed member old link rejected',true);

  perform set_config('request.jwt.claim.sub',owner_user::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',owner_user,'role','authenticated')::text,true);
  select c.invitation_id,c.invite_token into new_invitation,new_token
  from public.aurora_create_invitation(house,email_address,'Aurora rollback test','','') c;
  perform set_config('request.jwt.claim.sub',recipient::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',recipient,'role','authenticated')::text,true);
  select count(*) into n from public.aurora_accept_invitation(new_token);
  if n<>1 or not exists(select 1 from public.house_members where household_id=house and user_id=recipient) then
    raise exception 'Reinvitation did not restore membership';
  end if;
  insert into aurora_invite_regression_result values ('Remove then new invite then accept restores membership',true);
  select count(*) into n from public.aurora_accept_invitation(new_token);
  if n<>1 then raise exception 'New invitation repeat failed'; end if;
  insert into aurora_invite_regression_result values ('New acceptance repeat succeeds',true);
end $test$;
select * from aurora_invite_regression_result;
rollback;
