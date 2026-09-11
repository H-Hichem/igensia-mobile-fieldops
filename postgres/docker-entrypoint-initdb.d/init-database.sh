#!/bin/bash
set -e

echo "** Creating DB users";

PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 <<-EOSQL
    -- also about all SQL scripts below :
    -- still using passwords in case ending up using pgadmin
	-- using psql env vars instead of CLI params because these end up empty
	CREATE USER $DB_USER with password '$DB_PASSWORD' CREATEDB;
	ALTER ROLE $DB_USER superuser;
	-- about this : Hasura DB user must be superuser. And not using its own user
	-- because would have to add several privileges because since v15
	-- when not owner of the DB, all privileges on the 'public' schema
	-- are removed (which is why below all DBs are created by their own users)
	-- see https://stackoverflow.com/questions/74110708/postgres-15-permission-denied-for-schema-public
EOSQL

echo "** Creating DB";

PGDATABASE=postgres PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 <<-EOSQL
	CREATE DATABASE $DB encoding 'UTF8';
EOSQL

echo "** Creating DB extensions";

PGDATABASE="$DB" PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 <<-EOSQL
	CREATE EXTENSION IF NOT EXISTS postgis;
	-- NB. uuids : v13 brought gen_random_uuid() so no need for the uuid-ossp extension;
	-- see https://stackoverflow.com/questions/67293538/generate-a-uuid-in-postgres
EOSQL

# TODO LATER migrations...
echo "** Loading schema";

PGDATABASE="$DB" PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 < /docker-entrypoint-initdb.d/app/schema.sql

echo "** Loading views";

PGDATABASE="$DB" PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 < /docker-entrypoint-initdb.d/app/views.sql

echo "** Loading triggers";

PGDATABASE="$DB" PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 < /docker-entrypoint-initdb.d/app/triggers.sql

# NOT IN PROD
echo "** Loading test data";

PGDATABASE="$DB" PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" psql -v ON_ERROR_STOP=1 < /docker-entrypoint-initdb.d/app/test_data.sql

echo "** Finished DB setup (you still have to load manually in Hasura console its metadata)";

