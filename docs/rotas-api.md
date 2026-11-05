# Contrato da API

Base local: http://127.0.0.1:3000/api. Content-Type: application/json. GET sem autenticação; POST também aberto nesta entrega, somente desenvolvimento local.

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
