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
