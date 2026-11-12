# Melhorias atuais

Migração: `backend/scripts/migrate.js` e `database/migration-melhorias.sql`. Acrescenta em medicamentos: arquivado (BOOLEAN), classificacao_status (pendente por padrão) e classificacao_evidencia (TEXT).

| Tabela                 | Campos e regras                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| categorias             | id, nome UNIQUE, descricao, tipo ENUM(indicacao,classe,organizacao), ativo                                                                |
| medicamento_categorias | PK composta medicamento_id/categoria_id, índice de categoria; relação N:N                                                                 |
| usuario_medicamentos   | id, usuario_id, medicamento_id, observacoes, data_inicio/data_fim DATE, ativo, criado_em/atualizado_em; UNIQUE(usuario_id,medicamento_id) |
| lembretes              | id, usuario_medicamento_id, horario HH:MM, dias_semana JSON (0–6), data_inicio obrigatória, data_fim opcional, ativo, timestamps          |

Todas as FKs usam RESTRICT. Um usuário tem N vínculos pessoais; cada vínculo tem N lembretes. IDs de notificações pertencem ao dispositivo e não são armazenados no servidor. Datas finais anteriores às iniciais são rejeitadas. DATE retorna como texto para evitar conversão de fuso.

DELETE administrativo usa transação: com referência pessoal arquiva, sem referência remove categorias e medicamento. DELETE pessoal apaga explicitamente os próprios lembretes e vínculo, preservando catálogo. [Relatório e auditoria editorial](melhorias-pilldex.md).

# Evolução Entrega 3

A tabela usuarios agora inclui atualizado_em (TIMESTAMP com atualização automática). A migração aditiva e idempotente é executada com `npm.cmd run db:migrate` no backend. Email continua único; nivel é admin/usuario; senhas são gravadas exclusivamente como hash bcrypt. Não houve exclusão de tabelas ou registros existentes. Veja [Entrega 3](entrega-3.md). O texto abaixo preserva a modelagem anterior.

# Modelagem MySQL

Banco pilldex_db, MySQL 8.0, InnoDB, utf8mb4 e collation utf8mb4_0900_ai_ci (busca sem distinção de acento/maiúscula).

| Campo medicamentos                                                      | Tipo / regra                                              |
| ----------------------------------------------------------------------- | --------------------------------------------------------- |
| id                                                                      | INT UNSIGNED, PK, auto incremento                         |
| nome                                                                    | VARCHAR(150), NOT NULL, CHECK não vazio, índice           |
| principio_ativo                                                         | VARCHAR(150), opcional, índice                            |
| descricao, indicacoes, efeitos_colaterais, contraindicacoes, precaucoes | TEXT, opcionais                                           |
| fonte                                                                   | VARCHAR(255), opcional no schema; API exige para conteúdo |
| url_bula                                                                | TEXT, opcional; API valida HTTP/HTTPS                     |
| criado_em                                                               | TIMESTAMP, CURRENT_TIMESTAMP                              |
| atualizado_em                                                           | TIMESTAMP, atualizado automaticamente                     |

usuarios: id INT UNSIGNED PK auto incremento; nome VARCHAR(150) NOT NULL; email VARCHAR(254) NOT NULL UNIQUE; senha_hash VARCHAR(255) NOT NULL; nivel ENUM(admin,usuario) NOT NULL DEFAULT usuario; criado_em TIMESTAMP automático. Nenhum usuário é criado pelo seed. Hash não é senha em texto puro.

Não há relacionamento necessário nesta etapa. Futuro: um usuário admin poderá ser associado a vários cadastros/auditorias por chave estrangeira; essa coluna/relação ainda não existe. Índices de nome e princípio auxiliam ordenação/consultas por prefixo, mas busca com %termo% pode varrer tabela; paginação e full-text ficam para evolução.

schema.sql é não destrutivo e não altera tabelas já existentes. seed.sql insere apenas nomes ausentes. Conteúdo clínico e URL específica ficam NULL por falta de verificação individual.
