


create or replace function update_updated_at() returns trigger as $$
begin
  RAISE NOTICE 'trigger % on % : TG_OP=%, new=%, old=%', TG_NAME, TG_TABLE_NAME, TG_OP, new, old; -- NB. if TG_OP = 'INSERT', old AND even are old.status NULL (no error)

  new.updated_at = NOW();
  return new;
end;
$$ language plpgsql;

DROP TRIGGER IF EXISTS user_updated_at_trigger on "public"."user";
create trigger user_updated_at_trigger before update on public.user -- after insert or update
   for each row --when (new.operation_type = 'dispatch' and new.status='requested' and new.executor = 'DbTriggerMock')
   execute procedure update_updated_at();

DROP TRIGGER IF EXISTS session_updated_at_trigger on "public"."session";
create trigger session_updated_at_trigger before update on session -- after insert or update
   for each row
   execute procedure update_updated_at();

DROP TRIGGER IF EXISTS user_session_updated_at_trigger on "public"."user_session";
create trigger user_session_updated_at_trigger before update on user_session -- after insert or update
   for each row
   execute procedure update_updated_at();

DROP TRIGGER IF EXISTS observation_updated_at_trigger on "public"."observation";
create trigger observation_updated_at_trigger before update on observation -- after insert or update
   for each row
   execute procedure update_updated_at();

DROP TRIGGER IF EXISTS photo_updated_at_trigger on "public"."photo";
create trigger photo_updated_at_trigger before update on photo -- after insert or update
   for each row
   execute procedure update_updated_at();
   