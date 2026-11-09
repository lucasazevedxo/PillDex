# Contrato da API

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
