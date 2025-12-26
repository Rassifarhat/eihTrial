-- One-time bootstrap for the initial admin user.
-- Run setup.sql first so roles/profiles exist.
-- Replace the admin_email/admin_password values below before running.

create extension if not exists pgcrypto;

do $$
declare
  admin_email text := 'admin@example.com';
  admin_password text := 'ChangeMe123!';
  admin_user_id uuid;
  auth_instance uuid;
  instance_default_expr text;
  created_new_user boolean := false;
begin
  select id into admin_user_id from auth.users where email = admin_email;

  if admin_user_id is null then
    select id into auth_instance from auth.instances limit 1;
    if auth_instance is null then
      select column_default
        into instance_default_expr
        from information_schema.columns
        where table_schema = 'auth'
          and table_name = 'users'
          and column_name = 'instance_id';

      if instance_default_expr is not null then
        execute format('select %s', instance_default_expr) into auth_instance;
        if auth_instance is not null then
          begin
            insert into auth.instances (id)
            values (auth_instance)
            on conflict (id) do nothing;
          exception when others then
            auth_instance := null;
          end;
        end if;
      end if;

      if auth_instance is null then
        begin
          insert into auth.instances default values returning id into auth_instance;
        exception when others then
          raise exception 'auth.instances is empty and could not be initialized. Create a user in the dashboard first, then rerun.';
        end;
      end if;
    end if;

    if auth_instance is null then
      select id into auth_instance from auth.instances limit 1;
    end if;

    if auth_instance is null then
      raise exception 'auth.instances is empty';
    end if;

    admin_user_id := gen_random_uuid();
    created_new_user := true;

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      auth_instance,
      admin_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now()
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      admin_user_id,
      jsonb_build_object('sub', admin_user_id::text, 'email', admin_email),
      'email',
      admin_email,
      now(),
      now(),
      now()
    );
  end if;

  insert into public.profiles (id, email, must_change_password)
  values (admin_user_id, admin_email, false)
  on conflict (id) do update
    set email = excluded.email,
        must_change_password = false;

  insert into public.user_roles (user_id, role_id)
  select admin_user_id, r.id
  from public.roles r
  where r.name = 'admin'
  on conflict (user_id, role_id) do nothing;
end $$;
