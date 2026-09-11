BEGIN;

-- définition en premier des entités référencées par les autres
-- TODO still :
-- more indexes ? according to slow logs after EXPLAIN


-- users that can log in (to app or web)
-- BEWARE refer to it using "public.user", else it is PostgreSQL's own user table !
CREATE TABLE public.user(
id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(), -- TODO ? also stored in device once known

-- audit fields : (for data analysis & specific features)
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(), -- set by actions (TODO OR auto by DB trigger ?)
--deletion_requested_at timestamp with time zone, -- no need esp. since delete = emptying, updated_at and status are enough

status VARCHAR(10) DEFAULT 'enabled', -- deleted (empty nominative fields) (disabled ?)

-- user info :
lastname text, -- optional for auth code step
firstname text, -- optional for auth code step
phone VARCHAR(50),
email text NOT NULL, -- required for auth
--birthdate DATE, -- no need, email enough to deduplicate
preferences JSONB DEFAULT '{}'::json -- with keys ex. : current_session
-- fcm_token: null,
-- ?is_notification(_x)_enabled: true, TODO LATER is_email_notification(_x)_enabled
);

CREATE TABLE session(
id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
created_at timestamp with time zone DEFAULT now(), -- to sort by most recent created
updated_at timestamp with time zone DEFAULT now(), -- ex. to trigger change notifs to responsables ??
owner_id VARCHAR(36) NOT NULL DEFAULT '', -- allows to define insert permission in Hasura !
-- NB. no creator, oldest user_session might play a similar role, same for modifier
status VARCHAR(50) DEFAULT 'created', -- closed, deleted ?
name TEXT NOT NULL, 
notes TEXT, -- TODO LATER separate message table ?
location GEOGRAPHY(Point),
address_name TEXT,
address_streetno TEXT,
address_complement TEXT,
address_city TEXT,
address_zipcode TEXT,
sync_status VARCHAR(36) DEFAULT 'SYNCED', -- Etat de synchronisation (mobile only ?) : PENDING, SYNCED, ERROR (ou davantage avec LOCAL, SYNCING/SYNCED)
--sync_message NON utile QUE côté mobile...
FOREIGN KEY (owner_id) REFERENCES public.user(id)
);

-- TODO LATER which users can manage which sessions, n-n relationship :
CREATE TABLE user_session( -- user session ?
id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
user_id VARCHAR(36) NOT NULL,
session_id VARCHAR(36) NOT NULL,
created_at timestamp with time zone DEFAULT now(), -- to sort by most recent added to user
updated_at timestamp with time zone DEFAULT now(), -- ex. to trigger change notifs to responsables ??
-- NB. no creator, oldest user_session might play a similar role ; no need for modifier if no other field ex. tole
--status VARCHAR(50) NOT NULL, -- asked/invited?, refused??, removed/deleted??
--role VARCHAR(50) DEFAULT 'user', -- user, admin TODO or boolean ?

-- linked objects - delete alongside them : (harder in graphql, for tests mostly)
FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE,
FOREIGN KEY (session_id) REFERENCES session(id) ON DELETE CASCADE
);


CREATE TABLE observation(
id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
session_id VARCHAR(36) NOT NULL,
user_id VARCHAR(36) NOT NULL, -- TODO TODO Q owner user ??

created_at timestamp with time zone DEFAULT now(), -- Horodatage & for analysis
updated_at timestamp with time zone DEFAULT now(), -- ex. to trigger change notifs OR not allowed ??

-- NB. no creator, oldest user_seance might play a similar role, same for modifier
status VARCHAR(50) NOT NULL DEFAULT 'created', -- draft, deleted ?
status_changed_at timestamp with time zone DEFAULT now(), -- permet avec un critère sur status la plupart des besoins ; s'il faut tracer le processus il faudrait un champ status_<value>_changed par valeur énumérée, ou s'il faut tracer tous les allers-retours dans le processus (ex. après une observation échouée, se rappeler la date de sa réalisation initiale PLUS la date de réalisation de la suivante qui réussira, sauf si la seconde est différente i.e. une copie), il faudrait un champ JSON (si pas besoin de critère de query dessus) ou une table supplémentaire -- created, control, en_traitement, en_attente_de_paiement, a_preparer, a_recuperer, a_renouveller, delivered, cancelled, ?
--status/delivery_message TEXT, -- TODO LATER ? le dernier status_message de tous les packages, utile surtout en cas de problème

location GEOGRAPHY(Point), -- GPS if any
-- Photo
category VARCHAR(36), -- Catégorie (alternative valeur embarquée)
--category_id VARCHAR(36), -- Catégorie (alternative valeur dans table de référence)
nombre smallint DEFAULT 1, -- Quantité (nombre)
poids_g numeric(9, 3), -- Poids en grammes
--quantite_unit VARCHAR(36) DEFAULT 'décompte', -- Quantité NOOOO rajouter champs poids, longueur...
notes TEXT,
sync_status VARCHAR(36) DEFAULT 'SYNCED', -- Etat de synchronisation (mobile only ?) : PENDING, SYNCED, ERROR (ou davantage avec LOCAL, SYNCING/SYNCED)
--sync_message NON utile QUE côté mobile...

FOREIGN KEY (session_id) REFERENCES session(id),
--FOREIGN KEY (category_id) REFERENCES category(id),
FOREIGN KEY (user_id) REFERENCES public.user(id)
);

CREATE TABLE photo (
id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
created_at timestamp with time zone DEFAULT now(), -- to sort by most recent created
updated_at timestamp with time zone DEFAULT now(),
observation_id VARCHAR(36) NOT NULL,
data bytea NOT NULL,
mime_type VARCHAR(50) NOT NULL,
FOREIGN KEY (observation_id) REFERENCES observation(id)
);


COMMIT;