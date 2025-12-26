-- Domain tables for EIH Digital
-- Requires setup.sql to be applied first (roles, profiles, helper functions).

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles on delete restrict,
  clinic_id uuid,
  mrn text,
  full_name text not null,
  dob date,
  sex text,
  phone text,
  national_id text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encounters (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients on delete cascade,
  doctor_id uuid not null references public.profiles on delete restrict,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  language_patient text,
  language_doctor text,
  encounter_transcript text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encounter_artifacts (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters on delete cascade,
  type text not null,
  storage_path text,
  text_content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint encounter_artifacts_type_check
    check (type in ('image_id', 'audio_id', 'transcript', 'dictation', 'summary'))
);

create index if not exists patients_created_by_idx on public.patients (created_by);
create index if not exists encounters_patient_id_idx on public.encounters (patient_id);
create index if not exists encounters_doctor_id_idx on public.encounters (doctor_id);
create index if not exists encounter_artifacts_encounter_id_idx on public.encounter_artifacts (encounter_id);

drop trigger if exists set_patients_updated_at on public.patients;
create trigger set_patients_updated_at
before update on public.patients
for each row execute procedure public.set_updated_at();

drop trigger if exists set_encounters_updated_at on public.encounters;
create trigger set_encounters_updated_at
before update on public.encounters
for each row execute procedure public.set_updated_at();

drop trigger if exists set_encounter_artifacts_updated_at on public.encounter_artifacts;
create trigger set_encounter_artifacts_updated_at
before update on public.encounter_artifacts
for each row execute procedure public.set_updated_at();

alter table public.patients enable row level security;
alter table public.encounters enable row level security;
alter table public.encounter_artifacts enable row level security;

create policy "Patients: admin manage"
  on public.patients
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Patients: staff read"
  on public.patients
  for select
  using (public.has_any_role(array['admin', 'doctor', 'assistant', 'nurse', 'allied']));

create policy "Patients: doctor insert"
  on public.patients
  for insert
  with check (public.has_role('doctor') and created_by = auth.uid());

create policy "Patients: doctor update"
  on public.patients
  for update
  using (public.has_role('doctor') and created_by = auth.uid())
  with check (public.has_role('doctor') and created_by = auth.uid());

create policy "Patients: doctor delete"
  on public.patients
  for delete
  using (public.has_role('doctor') and created_by = auth.uid());

create policy "Encounters: admin manage"
  on public.encounters
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Encounters: staff read"
  on public.encounters
  for select
  using (public.has_any_role(array['admin', 'doctor', 'assistant', 'nurse', 'allied']));

create policy "Encounters: doctor insert"
  on public.encounters
  for insert
  with check (public.has_role('doctor') and doctor_id = auth.uid());

create policy "Encounters: doctor update"
  on public.encounters
  for update
  using (public.has_role('doctor') and doctor_id = auth.uid())
  with check (public.has_role('doctor') and doctor_id = auth.uid());

create policy "Encounters: doctor delete"
  on public.encounters
  for delete
  using (public.has_role('doctor') and doctor_id = auth.uid());

create policy "Encounter artifacts: admin manage"
  on public.encounter_artifacts
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Encounter artifacts: staff read"
  on public.encounter_artifacts
  for select
  using (public.has_any_role(array['admin', 'doctor', 'assistant', 'nurse', 'allied']));

create policy "Encounter artifacts: doctor insert"
  on public.encounter_artifacts
  for insert
  with check (
    public.has_role('doctor') and exists (
      select 1
      from public.encounters e
      where e.id = encounter_id
        and e.doctor_id = auth.uid()
    )
  );

create policy "Encounter artifacts: doctor update"
  on public.encounter_artifacts
  for update
  using (
    public.has_role('doctor') and exists (
      select 1
      from public.encounters e
      where e.id = encounter_id
        and e.doctor_id = auth.uid()
    )
  )
  with check (
    public.has_role('doctor') and exists (
      select 1
      from public.encounters e
      where e.id = encounter_id
        and e.doctor_id = auth.uid()
    )
  );

create policy "Encounter artifacts: doctor delete"
  on public.encounter_artifacts
  for delete
  using (
    public.has_role('doctor') and exists (
      select 1
      from public.encounters e
      where e.id = encounter_id
        and e.doctor_id = auth.uid()
    )
  );
