insert into "user" (first_name, last_name, role) values ('John', 'Smith', 'patient');
insert into patient (user_id) values (1)
insert into healthrecord (patient_id, created_at, step_count, resting_heart_rate, water_cups) values (1, NOW(), 3500, 60, 2)

select * from users;

-- the table's name was changed as user is a reserved key work in PostgreSQL.  
ALTER TABLE "user" RENAME TO users;

select * from healthrecord
