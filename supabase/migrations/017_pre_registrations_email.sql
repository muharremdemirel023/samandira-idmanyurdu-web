-- On kayit basvurularina veli e-posta adresi. Idempotent; eski kayitlar korunur.
alter table public.pre_registrations add column if not exists email text;

-- Eski kayitlarda email NULL kalabilir, bu yuzden NOT NULL yapilmaz. Bicim
-- kontrolu NOT VALID eklenir: mevcut satirlar dogrulanmaz, yeni ve guncellenen
-- satirlarda kural uygulanir. Zorunluluk web basvurulari icin server action'da.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pre_registrations_email_format') then
    alter table public.pre_registrations
      add constraint pre_registrations_email_format check (
        email is null
        or (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@.]+(\.[^[:space:]@.]+)+$')
      ) not valid;
  end if;
end
$$;

-- Kolon bazli update yetkileri korunur: authenticated rolu email kolonunu
-- guncelleyemez, yalnizca service_role yazar. Ek grant verilmez.
