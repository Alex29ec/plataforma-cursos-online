ALTER TABLE curso ADD estado VARCHAR(20);
ALTER TABLE curso ADD resumen VARCHAR(200);
ALTER TABLE curso ADD imagen VARCHAR(100);
ALTER TABLE curso ADD orden INTEGER NOT NULL DEFAULT 100;

UPDATE curso SET estado = CASE WHEN activo THEN 'PUBLICADO' ELSE 'BORRADOR' END,
    resumen = 'Obtén tu certificado de manipulador de alimentos 100 % online, a tu ritmo.';

ALTER TABLE curso ALTER COLUMN estado SET NOT NULL;
ALTER TABLE curso DROP COLUMN activo;

ALTER TABLE pregunta ADD activa BOOLEAN NOT NULL DEFAULT TRUE;
