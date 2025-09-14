-- Detect mutually-referential RLS policy conditions across public tables
with policy_check as (
  select schemaname, tablename, policyname, coalesce(qual,'') as qual
  from pg_policies
  where schemaname='public'
)
select p1.tablename as table1, p1.policyname as policy1,
       p2.tablename as table2, p2.policyname as policy2
from policy_check p1
join policy_check p2 on p1.tablename <> p2.tablename
where p1.qual ilike '%'||p2.tablename||'%'
  and p2.qual ilike '%'||p1.tablename||'%'
order by 1,2;
