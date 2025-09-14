-- Detect legacy coach_availability references

select 'legacy table exists' as check, count(*) as found
from information_schema.tables
where table_schema='public' and table_name='coach_availability';

select routine_name
from information_schema.routines
where specific_schema not in ('pg_catalog','information_schema')
  and routine_definition ilike '%coach_availability%';
