-- Mevcut antrenman programı satırları. Tekrar çalıştırılırsa kopya oluşturmaz.

insert into training_schedules (age_group, days, start_time, end_time, is_active, sort_order)
select 'U11 Grubu', 'Cumartesi ve Pazar', '09:00', '10:00', true, 1
where not exists (select 1 from training_schedules where age_group = 'U11 Grubu');

insert into training_schedules (age_group, days, start_time, end_time, is_active, sort_order)
select 'U7 Grubu', 'Cumartesi ve Pazar', '10:00', '11:00', true, 2
where not exists (select 1 from training_schedules where age_group = 'U7 Grubu');

insert into training_schedules (age_group, days, start_time, end_time, is_active, sort_order)
select 'U9 Grubu', 'Cumartesi ve Pazar', '11:00', '12:00', true, 3
where not exists (select 1 from training_schedules where age_group = 'U9 Grubu');
