BEGIN;

-- NB. adding limit 1 to ALL relation inserts, to allow to re insert all this data several times

-- source : wireframe & internet (see schema comments)
INSERT INTO public.user (lastname, firstname, phone, email, updated_at) VALUES
  ('Dupond', 'Jean', '0612345601', 'marc.dutoo+jean.dupond@gmail.com', now()),
  ('Petit', 'Anne', '0612345610', 'marc.dutoo+anne.petit@gmail.com', now()),
  ('Maury', 'Claude', '0612345611', 'marc.dutoo+claude.maury@gmail.com', now());

INSERT INTO session (name, address_name, address_streetno, address_complement, address_city, address_zipcode, location, updated_at, owner_id) VALUES
  ('Observation de la faune', 'Parc de la Tête d''Or', 'Boulevard des Belges', NULL, 'Lyon', '69006', ST_SetSRID(ST_MakePoint(4.8471805, 45.7706118), 4326), now(), (select id from public.user where lastname = 'Dupond' limit 1)),
  ('Collecte déchets', 'place Jean Monnet', '22 Av. René Cassin', 'coté nord', 'Lyon', '69009', ST_SetSRID(ST_MakePoint(4.8048585, 45.7696557), 4326), now(), (select id from public.user where lastname = 'Petit' limit 1)),
  ('Observation de la flore', 'Parc Du Lac De La Madone', NULL, NULL, 'Mornant', '69440', ST_SetSRID(ST_MakePoint(4.653953, 45.6110466), 4326), now(),  (select id from public.user where lastname = 'Petit' limit 1));

INSERT INTO user_session (user_id, session_id, updated_at) VALUES
  ((select id from public.user where lastname = 'Dupond' limit 1), (select id from session where name = 'Observation de la faune' limit 1), now()),
  ((select id from public.user where lastname = 'Petit' limit 1), (select id from session where name = 'Collecte déchets' limit 1), now()),
  ((select id from public.user where lastname = 'Petit' limit 1), (select id from session where name = 'Observation de la flore' limit 1), now());

INSERT INTO observation (session_id, user_id, created_at, location, category, nombre, notes, sync_status, updated_at) VALUES
  ((select id from session where name = 'Observation de la faune' limit 1),
    (select id from public.user where lastname = 'Dupond' limit 1),
    '2025-12-29 15:24:13.170699+01'::timestamp, ST_SetSRID(ST_MakePoint(4.8541807, 45.7781497), 4326),
    'Espèce invasive', 1, 'chenille processionnaire', 'SYNCED', now()),
  ((select id from session where name = 'Collecte déchets' limit 1),
    (select id from public.user where lastname = 'Petit' limit 1),
    '2026-01-28 16:24:13.170699+01'::timestamp, ST_SetSRID(ST_MakePoint(4.8067673, 45.770202), 4326),
    'Mégot de cigarette', 3, 'mégot', 'SYNCED', now()),
  ((select id from session where name = 'Collecte déchets' limit 1),
    (select id from public.user where lastname = 'Petit' limit 1),
    '2026-12-29 17:14:13.170699+01'::timestamp, ST_SetSRID(ST_MakePoint(4.8070193, 45.770327), 4326),
    'Déchet métallique', 1, 'canette', 'ERROR', now());

COMMIT;