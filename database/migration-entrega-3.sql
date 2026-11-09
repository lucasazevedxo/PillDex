-- Executar uma vez em banco existente; preferir npm run db:migrate (idempotente).
ALTER TABLE usuarios ADD COLUMN atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
