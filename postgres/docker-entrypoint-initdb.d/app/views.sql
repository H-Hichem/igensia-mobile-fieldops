
-- closest sessions geo query - return type :
-- NB. rather than a view that wouldn't allow GraphQL introspection :
--CREATE OR REPLACE VIEW session_distance AS
--select 0::float as distance, c.* from session c;
CREATE TABLE session_distance (
--id VARCHAR(36) NOT NULL, -- bigserial -- required for a table, even only used as a type in views
session_id VARCHAR(36) NOT NULL, -- clearer
distance float,
FOREIGN KEY (session_id) REFERENCES session(id)
);
CREATE TABLE observation_distance (
--id VARCHAR(36) NOT NULL, -- bigserial -- required for a table, even only used as a type in views
observation_id VARCHAR(36) NOT NULL, -- clearer
distance float,
FOREIGN KEY (observation_id) REFERENCES observation(id)
);

-- closest sessions geo query :
-- returns both session and distance to provided center,
-- using bounding box for performance.
-- Details :
-- - allows graphql introspection by using custom return type session_distance
-- (which requires defining it by creatings it as an SQL table)
-- ex. visually list closest sessions AND max distance param
-- - inspired by https://blog.hasura.io/graphql-and-geo-location-on-postgres-using-hasura-562e7bd47a2f/
-- EPSG 3857 is spherical Mercator projection
CREATE OR REPLACE FUNCTION public.search_closest_session(center_location Geometry, distance_m integer)
 RETURNS SETOF session_distance -- session -- session_with_distance NO then can't introspect result using GraphQL ;_;
 LANGUAGE sql
 STABLE
AS $$
select
--OP.id as id,
OP.id as session_id,
ST_Distance(OP.location::Geometry, center_location) as distance
--, OP.*
from session OP where
OP.status <> 'deleted' and
ST_Transform(OP.location::Geometry, 3857) && ST_Expand(ST_Transform(center_location, 3857), distance_m) -- within box is more efficient https://postgis.net/workshops/postgis-intro/knn.html
--and
--E.id in (select E.id from report B
--WHERE B.is_operator_report and B.emergency_id = E.id and
--     ST_Transform(B.location::Geometry, 3857) && ST_Expand(ST_Transform(center_location, 3857), distance_m)
--     and ST_Distance(
--       ST_Transform(B.location::Geometry, 3857),
--       ST_Transform(center_location, 3857)
--     ) < distance_m
--)
ORDER BY distance ASC -- no need to ST_Transform because order is the same in degree as in meters, applied only after box criteria successful
$$ ;

CREATE OR REPLACE FUNCTION public.search_closest_observation(center_location Geometry, distance_m integer)
 RETURNS SETOF observation_distance -- observation -- observation_with_distance NO then can't introspect result using GraphQL ;_;
 LANGUAGE sql
 STABLE
AS $$
select
--OP.id as id,
OP.id as observation_id,
ST_Distance(OP.location::Geometry, center_location) as distance
--, OP.*
from observation OP where
OP.status <> 'deleted' and
ST_Transform(OP.location::Geometry, 3857) && ST_Expand(ST_Transform(center_location, 3857), distance_m) -- within box is more efficient https://postgis.net/workshops/postgis-intro/knn.html
--and
--E.id in (select E.id from report B
--WHERE B.is_operator_report and B.emergency_id = E.id and
--     ST_Transform(B.location::Geometry, 3857) && ST_Expand(ST_Transform(center_location, 3857), distance_m)
--     and ST_Distance(
--       ST_Transform(B.location::Geometry, 3857),
--       ST_Transform(center_location, 3857)
--     ) < distance_m
--)
ORDER BY distance ASC -- no need to ST_Transform because order is the same in degree as in meters, applied only after box criteria successful
$$ ;


-- dev test help - introspect Hasura session variables :
-- return type :
CREATE TABLE hasura_session_type (
hasura_session JSON
);
-- conf : in hasura console, track > add as root field (No need to Session Argument > Edit : hasura_session, because already default) 
CREATE OR REPLACE FUNCTION public.get_hasura_session(hasura_session json)
 RETURNS SETOF hasura_session_type
 LANGUAGE sql
 STABLE
AS $$
select hasura_session
$$ ;