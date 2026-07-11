delete from healthrecord;

alter table healthrecord drop column created_at;  -- replaced with hour blocks
alter table healthrecord drop column sleep_hours;  -- dropped to avoid too many null values
alter table healthrecord drop column water_cups;  -- dropped as it won't be fetched by Google Health API

alter table healthrecord change resting_heart_rate average_heart_rate int;  -- average heart rate more meaningful as it changes throughout the day

alter table healthrecord add column hour_block datetime; -- store health data for each hour
alter table healthrecord modify hour_block datetime not null; 
alter table healthrecord add unique (patient_id, hour_block); -- ensures health data is recorded only once each hour for each patient