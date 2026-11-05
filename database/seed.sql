USE pilldex_db;
-- Catálogo de demonstração. Nenhum conteúdo clínico foi validado.
-- Fonte oficial para futura consulta: https://www.gov.br/anvisa/pt-br/sistemas/bulario-eletronico
-- Não aponta o portal geral como se fosse uma bula específica.
INSERT INTO medicamentos (nome, descricao, fonte)
SELECT 'Paracetamol', 'Registro de demonstração. Informações farmacêuticas pendentes de validação.', 'Anvisa — Bulário Eletrônico; conteúdo clínico pendente de validação'
WHERE NOT EXISTS (SELECT 1 FROM medicamentos WHERE nome = 'Paracetamol');
INSERT INTO medicamentos (nome, descricao, fonte)
SELECT 'Dipirona', 'Registro de demonstração. Informações farmacêuticas pendentes de validação.', 'Anvisa — Bulário Eletrônico; conteúdo clínico pendente de validação'
WHERE NOT EXISTS (SELECT 1 FROM medicamentos WHERE nome = 'Dipirona');
INSERT INTO medicamentos (nome, descricao, fonte)
SELECT 'Ibuprofeno', 'Registro de demonstração. Informações farmacêuticas pendentes de validação.', 'Anvisa — Bulário Eletrônico; conteúdo clínico pendente de validação'
WHERE NOT EXISTS (SELECT 1 FROM medicamentos WHERE nome = 'Ibuprofeno');
