# Contrato da API

## Melhorias — contrato atual

As rotas de autenticação e catálogo existentes permanecem. Escritas no catálogo exigem Admin; operações pessoais exigem somente JWT válido e propriedade do registro.

| Método e rota                                    | Acesso / contrato                                                                                                                      |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| GET /api/categorias                              | Público; categorias ativas do MySQL com nome, descrição e tipo                                                                         |
| GET /api/medicamentos?busca=texto&categorias=1,2 | Público; texto em nome OU princípio ativo, combinado com qualquer categoria (OR). Sem duplicatas; arquivados omitidos                  |
| POST/PUT /api/medicamentos[/:id]                 | Admin; aceita também categorias: array de IDs e classificacao_evidencia: texto obrigatório quando houver categorias                    |
| DELETE /api/medicamentos/:id                     | Admin; data.action = excluido ou arquivado, data.message explica o resultado                                                           |
| GET /api/meus-medicamentos                       | Autenticado; lista exclusivamente do usuário                                                                                           |
| POST /api/meus-medicamentos                      | medicamento_id, observacoes opcional, data_inicio/data_fim opcionais, ativo booleano; retorna 201                                      |
| GET /api/meus-medicamentos/:id                   | Proprietário; inclui medicamento completo mesmo arquivado                                                                              |
| PUT /api/meus-medicamentos/:id                   | Proprietário; substitui observacoes/datas/ativo, sem trocar proprietário ou medicamento                                                |
| DELETE /api/meus-medicamentos/:id                | Proprietário; remove vínculo e seus lembretes, preserva catálogo                                                                       |
| GET /api/lembretes                               | Autenticado; lista pessoal incluindo nome, estado e limites de datas do vínculo                                                        |
| POST /api/lembretes                              | usuario_medicamento_id, horario HH:MM, dias_semana: array 0–6, data_inicio obrigatória, data_fim opcional, ativo booleano; retorna 201 |
| PUT /api/lembretes/:id                           | Proprietário; substitui os mesmos campos do POST                                                                                       |
| DELETE /api/lembretes/:id                        | Proprietário; remove lembrete                                                                                                          |

Datas: AAAA-MM-DD, 2000–2100, limites inclusivos e fim >= início. Observações até 5000 caracteres; evidência até 2000; categorias até 30 IDs. Sem token: 401; catálogo sem Admin: 403; registro alheio/ausente: 404; duplicata: 409; validação: 400. usuario_id do corpo nunca determina propriedade. UNIQUE por usuário/medicamento. Lembretes com mesmo vínculo/horário/dias/datas são rejeitados como duplicata. IDs locais de notificações não fazem parte da API. [Detalhes e limitações](melhorias-pilldex.md).

O contrato abaixo preserva o histórico anterior.

Versão atual: Entrega 3. Consulte a tabela “Entrega 3 — rotas atuais” ao final deste documento e [o relatório](entrega-3.md). Escritas exigem Bearer Token de administrador; apenas consultas são públicas. A seção seguinte é o contrato histórico da Entrega 2.

Base local: http://127.0.0.1:3000/api. Content-Type: application/json. Historicamente, na Entrega 2, GET e POST eram públicos; na Entrega 3, POST/PUT/DELETE são protegidos.

| Método | Rota                      | Resposta                                                     |
| ------ | ------------------------- | ------------------------------------------------------------ |
| GET    | /health                   | 200 servidor/banco online; 503 servidor online/banco offline |
| GET    | /medicamentos             | 200 lista, inclusive vazia                                   |
| GET    | /medicamentos?busca=termo | 200 busca por nome ou princípio ativo, máximo 150 caracteres |
| GET    | /medicamentos/:id         | 200 objeto; 400 ID inválido; 404 ausente                     |
| POST   | /medicamentos             | 201 objeto persistido + Location; 400 validação              |

POST aceita nome, principio_ativo, descricao, indicacoes, efeitos_colaterais, contraindicacoes, precaucoes, fonte, url_bula. Nome é obrigatório até 150 caracteres; princípio até 150; fonte até 255; demais campos até 10000. Campos opcionais vazios viram NULL. Informações descritivas/clínicas exigem fonte. URLs devem ser HTTP/HTTPS, sem credenciais. Campos desconhecidos são ignorados; id e timestamps vêm do banco.

Sucesso: {"success":true,"data":[]}. Erro: {"success":false,"error":{"message":"Revise os campos informados.","fields":{"nome":"O nome é obrigatório."}}}. Falhas de conexão conhecidas retornam 503; falhas internas 500; origem Web não autorizada 403; rota ausente 404; corpo acima de 128kb 413. Health usa data separado mesmo quando success=false.

Queries parametrizadas tratam valores como dados. Caracteres % e _ na pesquisa são literais. CORS permite somente origens configuradas e clientes sem Origin (como Android); não protege contra escrita externa. Não existe PUT/DELETE nesta entrega.

# Entrega 3 — rotas atuais

| Método e rota                     | Acesso                        | Dados                                    |
| --------------------------------- | ----------------------------- | ---------------------------------------- |
| POST /api/auth/cadastro           | Público, limite de tentativas | nome, email, senha; nível sempre usuario |
| POST /api/auth/login              | Público, limite de tentativas | email, senha                             |
| GET /api/auth/me                  | Bearer válido                 | usuário sem hash                         |
| GET /api/medicamentos?busca=texto | Público                       | busca por nome ou princípio ativo        |
| GET /api/medicamentos/:id         | Público                       | detalhes                                 |
| POST /api/medicamentos            | Admin                         | nove campos do medicamento               |
| PUT /api/medicamentos/:id         | Admin                         | substituição dos nove campos editáveis   |
| DELETE /api/medicamentos/:id      | Admin                         | exclusão confirmada na interface         |

Cadastro retorna 201; login e me 200. Cadastro/login retornam `data:{token,expiresAt,usuario}`; expiresAt é timestamp em milissegundos. Respostas de erro usam `{success:false,error:{message,fields?}}`. Validação retorna 400, credenciais/token inválido 401, permissão insuficiente 403, registro ausente 404, cadastro duplicado 409 e limite de tentativas 429. Cadastro duplicado usa mensagem genérica. Campos clínicos exigem fonte; nenhuma rota produz recomendação de tratamento. GET /api/health continua público (200 ou 503). Veja [Entrega 3](entrega-3.md).

O conteúdo abaixo preserva a documentação histórica da Entrega 2; rotas de escrita agora exigem administrador.
