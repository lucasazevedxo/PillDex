# Auditoria da Entrega 2 — PillDex

Data: 06/11/2026 (America/Sao_Paulo). Ambiente: Windows, Node.js 24.13.1, MySQL 8.0.46, Expo SDK 58 e Edge headless.

## Escopo, critérios e limites

Auditoria dos quatro indicadores informados pelo solicitante. Não foi localizado enunciado institucional independente ou rubrica oficial com pontuação no projeto. Portanto, a conformidade é avaliada pelos requisitos apresentados na solicitação; a aderência a critérios oficiais adicionais fica NÃO VERIFICADA. Não se presume que o checklist produzido pelo próprio projeto seja uma rubrica oficial.

Foram inspecionados os arquivos autorais do backend, frontend, SQL, scripts e documentação, manifests, configuração, arquivos de exemplo, regras Git, histórico e metadados dos três lockfiles. Assets PNG e licença foram inventariados; não são evidência de funcionamento. Dependências de terceiros, caches, bundles e diretório Git interno não foram tratados como código autoral. Configurações locais foram utilizadas sem imprimir credenciais. Não foi realizada análise exaustiva de vulnerabilidades ou revisão farmacológica.

Nenhuma correção, instalação, migração, seed, UPDATE, DELETE, commit ou push foi executado. A única gravação autoral solicitada é este relatório. A execução do Expo/lint pode atualizar caches ignorados. API e Expo, inicialmente desligados, foram iniciados para os testes e encerrados ao final. Não foram cadastrados medicamentos nesta auditoria.

Classificações: APROVADO = implementado e comprovado no alcance descrito; PARCIAL = implementado, mas incompleto ou não testado integralmente; REPROVADO = ausente ou incorreto; NÃO VERIFICADO = evidência insuficiente.

## 1. Tabela dos indicadores

| Indicador | Classificação | Conclusão |
| --- | --- | --- |
| 1 — Modelagem dos dados | APROVADO | MySQL real acessível; banco, tabelas, campos, PKs, índices, UNIQUE e CHECK conferidos com SHOW CREATE TABLE. Modelo coerente com consulta e cadastro. |
| 2 — Estrutura da API | APROVADO | Express executado, camadas organizadas, conexão real e rotas de leitura comprovadas; 11 testes HTTP aprovados com banco substituído. Alcance de escrita real consta no indicador 3. |
| 3 — Integração aplicativo/API/banco | PARCIAL | Fluxo de leitura completo comprovado pelo navegador, HTTP e SQL; cinco telas acessadas. POST válido e nova persistência real não executados para preservar o banco. |
| 4 — Evolução, documentação e versionamento | PARCIAL | Documentação ampla e Git local existentes; inconsistências documentais, alterações não commitadas, apenas um commit e nenhum remoto configurado. |

Não há comprovação suficiente para aprovação integral da entrega.

## 2. Verificação por requisito e arquivos de evidência

### Indicador 1 — Modelagem

| Requisito | Classificação | Evidência e verificação |
| --- | --- | --- |
| Banco MySQL existente e acessível | APROVADO | backend/src/config/db.js; consulta real SELECT VERSION(), DATABASE(): 8.0.46 e pilldex_db. |
| Tabela medicamentos e campos adequados | APROVADO | database/schema.sql, docs/modelagem-banco.md; SHOW CREATE TABLE confirmou id, nome, principio_ativo, descricao, indicacoes, efeitos_colaterais, contraindicacoes, precaucoes, fonte, url_bula e timestamps. |
| Chaves, integridade e índices | APROVADO | PK INT UNSIGNED AUTO_INCREMENT nas duas tabelas; CHECK de nome não vazio; índices de nome/princípio; UNIQUE em email de usuarios. Estrutura real confere com SQL. Restrições não foram provocadas por INSERT direto. |
| Usuários e níveis previstos | APROVADO | database/schema.sql e docs/requisitos-funcionais.md: usuarios com nome, email, senha_hash e nivel admin/usuario; estrutura confirmada no MySQL, sem divulgar registros. |
| Relacionamentos | APROVADO | Não existem FKs; docs/modelagem-banco.md justifica entidades independentes nesta etapa e associação futura de autoria. O fluxo atual não exige relação artificial entre usuários e medicamentos. |
| Scripts SQL disponíveis | APROVADO | database/schema.sql e database/seed.sql; backend/scripts/setup-db.js carrega os dois. Leitura confirma criação conservadora e seed por nome ausente. |
| Reexecução do setup/seed e instalação do zero | PARCIAL | Não executadas: alterariam o banco. A correspondência do esquema atual não prova instalação limpa nem idempotência executada nesta auditoria. |
| Conteúdo farmacêutico do catálogo | PARCIAL | SELECT agregado: 8 medicamentos, 1 com indicacoes não NULL e 1 com url_bula não NULL; isso não prova conteúdo válido. Seed possui três registros de demonstração sem campos clínicos completos. Validade e completude editorial não comprovadas. |

Os dois últimos limites não invalidam a estrutura de dados comprovada. Não se exige autenticação para aprovar a modelagem da Entrega 2.

### Indicador 2 — API

| Requisito | Classificação | Evidência e verificação |
| --- | --- | --- |
| Node.js e Express funcionais | APROVADO | backend/package.json, backend/src/server.js, backend/src/app.js; npm.cmd start iniciou API em 127.0.0.1:3000. |
| Organização em camadas | APROVADO | backend/src/routes/medicamentos.js, controllers/medicamentos.js, models/medicamentos.js, config/db.js e middlewares/{validation,errors}.js. Fluxo exercitado por HTTP. |
| Pool e conexão MySQL | APROVADO | config/db.js usa mysql2/promise; health real 200 com database online; consultas SQL diretas e leituras HTTP bem-sucedidas. |
| GET de lista, busca e ID | APROVADO | routes, controllers e models; HTTP real 200 para lista, pesquisa e detalhes; registro da API coincide com SELECT parametrizado. |
| POST e contrato 201/Location | PARCIAL | Controller/model existentes; 201 e Location aprovados apenas com fake em backend/tests/api.test.js. POST real inválido retorna 400. INSERT real pela API não executado. |
| Validação e erros | APROVADO | HTTP real: ID inválido 400, ausente 404, rota inexistente 404, POST vazio 400 e JSON malformado 400. Testes com fake cobrem campos, fonte, URL, indisponibilidade e sigilo dos erros. |
| CORS e preflight | APROVADO | app.js e testes HTTP: quatro origens locais, OPTIONS GET/POST, origem rejeitada e preflight sem banco. Navegador em 8081 acessou API real sem impedimento de CORS. |
| SQL parametrizado e busca literal | APROVADO | models/medicamentos.js e teste HTTP; buscas reais por apóstrofo/expressão de injeção, % e _ retornaram listas vazias neste catálogo, sem erro. Isso não equivale a pentest completo. |
| Banco indisponível | PARCIAL | Health 503 e erro de acesso aprovados com banco substituído. MySQL real não foi desligado nem suas credenciais alteradas para provocar indisponibilidade. |

### Indicador 3 — Integração e telas

| Requisito | Classificação | Evidência e verificação |
| --- | --- | --- |
| React Native → fetch → Express → MySQL | APROVADO para leitura | frontend/src/services/api.js e useMedicines.js, App.js e navegação; Edge registrou GETs reais com HTTP 200 em 127.0.0.1:3000. Dados conferidos diretamente no MySQL. Sem fallback local de catálogo no código analisado. |
| Pesquisa por nome e princípio ativo | APROVADO | API real encontrou Paracetamol e um princípio ativo já cadastrado. Pela interface, pesquisa de Paracetamol abriu detalhes e pesquisa inexistente mostrou estado vazio. |
| Detalhes por ID | APROVADO | frontend/src/screens/DetailsScreen.js; navegador consultou /api/medicamentos/1 com 200 e exibiu seção de bula. Nome retornado confere com SQL. |
| Pelo menos três telas com React Navigation | APROVADO em Expo Web | frontend/src/navigation/AppNavigator.js e cinco arquivos em screens: Início, Pesquisa, Resultados, Detalhes e Administração acessados no Edge. Não se confundiu viewport móvel com Android. |
| Cadastro e persistência de novo medicamento | PARCIAL | AdminScreen.js, api.js, controller/model e scripts integrados existentes. Validação de nome vazio comprovada na interface. POST de sucesso e persistência nova apenas descritos em relatórios anteriores e simulados nos testes; não comprovados novamente em MySQL real. |
| Loading, erro, vazio e nova tentativa | PARCIAL | Loading presente no código; vazio e falha de rede/retry comprovados no Edge. Não houve asserção específica de duração/visibilidade do loading. Sucesso real de cadastro não reexecutado. |
| Responsividade básica | APROVADO no alcance testado | Viewport 390×844 sem overflow horizontal na tela inicial; sem pageerror no fluxo. Não equivale a auditoria completa de acessibilidade ou de todos os tamanhos. |
| Bula externa específica | PARCIAL | DetailsScreen.js usa Linking.openURL e tratamento de erro. Abertura e validade de bula específica não testadas. |
| Execução Android/iOS | NÃO VERIFICADO | frontend/app.json e bibliotecas presentes; nenhum aparelho/emulador utilizado. Não é prova de falha nem requisito adicional presumido. |
| Atualização após cadastro/retorno | PARCIAL | useFocusEffect em useMedicines.js implementa recarga; sem cadastro nesta auditoria, a atualização após escrita não foi comprovada. |

### Indicador 4 — Documentação e Git

| Requisito | Classificação | Evidência e verificação |
| --- | --- | --- |
| README com instalação e execução | APROVADO | README.md cobre backend, frontend, MySQL, variáveis, Android/rede e testes; inicialização dos serviços funcionou. Instalação limpa não repetida. |
| Requisitos, público, objetivos e escopo | APROVADO | docs/requisitos-funcionais.md e docs/documentacao-tecnica.md; RF01–RF08, limites e tecnologia explicitados. |
| Telas e fluxos | APROVADO | docs/fluxo-navegacao.md corresponde ao stack e ao fluxo exercitado. |
| Entidades, campos e API documentados | APROVADO | docs/modelagem-banco.md e docs/rotas-api.md correspondem à estrutura real e aos contratos exercitados. |
| Níveis e permissões previstas | APROVADO como planejamento | docs/requisitos-funcionais.md distingue consulta do usuário e futura escrita pelo admin; README e Administração informam ausência de proteção atual. |
| Atualidade e consistência das evidências | PARCIAL | docs/checklist-entrega-2.md e docs/relatorio-final.md ainda mencionam 9 testes e conclusão integral, embora hoje existam 11 testes HTTP e pendências de remoto/escrita desta auditoria. Relatório final usa localhost; README atual recomenda 127.0.0.1. |
| Git local existente | APROVADO | master em 955de5e; git log e git rev-list --count HEAD: 1 commit, de 05/11/2026. |
| Evolução por histórico e estado consolidado | PARCIAL | Commit único não comprova evolução incremental. Dez arquivos rastreados modificados e quatro não rastreados antes deste relatório. |
| Remoto configurado | REPROVADO | git remote e git remote -v sem saída. Nenhuma URL de repositório configurada. |
| GitHub acessível e sincronizado | NÃO VERIFICADO | Sem remoto/URL identificada para consulta. Não há base para afirmar atualizado, push realizado ou divergência de commits remotos. |
| Credenciais locais fora do Git | APROVADO no alcance verificado | .gitignore; git check-ignore confirmou backend/.env e frontend/.env; git ls-files --error-unmatch confirmou que ambos não estão rastreados. Não representa varredura forense completa de segredos. |

## 3. Testes executados e resultados

| Comando/procedimento | Resultado e alcance |
| --- | --- |
| backend/: npm.cmd test | 11 aprovados, 0 falhas. Banco fake; não comprova persistência real. Log ER_ACCESS_DENIED_ERROR é induzido pelo teste. |
| node --test scripts/test-api-client.cjs | 6 aprovados, 0 falhas. Fetch substituído: URL, JSON, erros HTTP, rede e AbortError; não esperou timeout real de 12 segundos. |
| frontend/: npm.cmd run lint | Exit 0, sem erros reportados. |
| frontend/: npm.cmd run typecheck | Exit 0; checkJs=false, sem garantia de tipagem estrita dos arquivos JavaScript. |
| frontend/: npx.cmd expo install --check | Exit 0; Dependencies are up to date. |
| SELECT VERSION(), DATABASE(); SHOW CREATE TABLE nas duas tabelas | MySQL 8.0.46; estrutura compatível com schema; nenhum DDL executado. |
| SELECT agregado de medicamentos | 8 registros; 1 com indicacoes não NULL e 1 com url_bula não NULL. Não houve leitura/exposição de usuários. |
| Inicialização npm.cmd start no backend e no frontend com --web --port 8081 | Serviços iniciados; bundle Web compilado e consumido pelo navegador. |
| Roteiro HTTP temporário, via stdin, sem arquivo gravado | Health 200; lista 200/8 itens; nome e princípio encontrados; busca vazia de resultado e caracteres especiais; detalhe 200; erros 400/404; comparação API/SQL aprovada. |
| Roteiro Edge/Playwright temporário, via stdin | Cinco telas, busca/detalhes, nome obrigatório, estado vazio, falha/retry e viewport móvel aprovados; lista de pageerror vazia; GETs reais registrados. Não realizou cadastro. |
| git diff --check | Exit 0. Avisos de LF/CRLF não constituem falha funcional. |
| Git: status, remote, branch -vv, log --all, rev-list, ls-files e check-ignore | Um commit, sem remoto/upstream, mudanças locais e .env não rastreados. |

Ocorrências do procedimento: duas primeiras sondagens node -e falharam por aspas removidas pelo PowerShell e foram repetidas com sucesso. O primeiro roteiro Edge falhou por acento corrompido no seletor; repetição com seletor independente de acento passou. São falhas do procedimento de auditoria, não defeitos comprovados do aplicativo.

Uma execução inicial conjunta incluiu scripts/test-cors-metro.cjs; com serviços inicialmente desligados, não fornece aprovação de integração. O roteiro completo de Metro nas duas portas não foi aprovado nesta auditoria. A porta 8082 não foi iniciada posteriormente.

Não executados: db:setup, repair-seed-encoding.js, test:integration e test:web completos. Os dois últimos fazem INSERT persistente; não respeitariam a preservação do banco. O rollback em backend/scripts/verify-integration.js ocorre em conexão diferente daquela usada pelo pool da API e NÃO desfaz o POST; o próprio script documenta que deixa registro. Não houve tentativa de usar esse rollback como garantia de ausência de mudanças.

Não foram executados npm ci, exportação adicional, npm audit atualizado ou validação em aparelho. Registros e capturas anteriores em artifacts/ não foram promovidos a prova atual.

## 4. Requisitos aprovados

Modelagem real e coerente; estrutura Express em camadas; conexão MySQL comprovada; listagem, busca por nome/princípio e detalhes reais; SQL parametrizado; contratos de erro nos casos exercitados; cinco telas navegáveis em Expo Web; cliente Fetch; validação de cadastro vazio; estado vazio e recuperação de rede; documentação de requisitos, fluxos, campos, rotas e papéis futuros; Git local e exclusão dos .env.

## 5. Pendências e erros encontrados

1. Falta comprovação atual de POST válido e persistência nova, seguida de consulta SQL independente e atualização do catálogo na interface.
2. Não há remoto Git. Há dez arquivos modificados e quatro não rastreados antes do relatório, portanto a árvore entregue não está representada integralmente no único commit.
3. Checklist e relatório anterior apresentam aprovação ampla e contagem antiga de testes; precisam separar evidência histórica, resultado atual e pendências.
4. frontend/.env.example contém comentário com codificação incorreta em “f?sico”; defeito documental, sem impacto no endereço configurado.
5. Scripts de integração não isolam suas escritas. O beginTransaction/rollback do script integrado não abrange o INSERT da API; não presumir limpeza automática.
6. Conteúdo clínico completo e URL oficial específica não estão validados. Isso limita a demonstração dos próprios RF04/RF05; não foi convertido em exigência de autenticação ou de entregas posteriores.
7. Android, abertura de bula, instalação limpa e falha real do MySQL seguem sem comprovação nesta rodada.

Não foi encontrado erro funcional nos fluxos de leitura e navegação efetivamente testados. Ausência de falha nesses cenários não comprova funcionamento de todos os caminhos.

## 6. Correções e verificações antes da entrega

- Em banco de teste isolado, executar POST válido pelo aplicativo, confirmar 201/Location, novo ID, SELECT em conexão independente, busca, detalhes e catálogo atualizado. Preservar evidências e distinguir dados técnicos dos farmacêuticos.
- Consolidar documentação com resultados reais e corrigir a codificação do comentário. Não marcar como testado o que apenas existe no código.
- Identificar o repositório correto, configurar remoto e comparar histórico local/remoto antes de afirmar sincronização. Revisar e registrar mudanças por autorização posterior; esta auditoria não faz commit/push.
- Se a avaliação exigir demonstração completa dos RF04/RF05, preparar conteúdo conferido e bula específica válida, com fontes, e testar o link. Confirmar esse alcance na rubrica institucional.
- Explicitar o efeito persistente dos testes e, em eventual revisão autorizada, eliminar a aparência de isolamento transacional que não abrange a API.
- Validar dispositivo e instalação limpa se exigidos pela rubrica. Não exigir JWT, login, Bearer, autorização implementada, PUT/DELETE, paginação ou associação futura de autoria como bloqueios presumidos da Entrega 2.

## 7. Verificação do GitHub

Branch local: master, sem upstream exibido. HEAD: 955de5e — “Implementa PillDex Entrega 2 com Expo, API Express, MySQL e testes”, 05/11/2026 09:00:51 -03:00. Total de commits alcançáveis: 1.

Modificados antes da auditoria: README.md; backend/.env.example; backend/package-lock.json; backend/package.json; backend/src/app.js; backend/src/server.js; backend/tests/api.test.js; frontend/.env.example; frontend/package.json; frontend/src/services/api.js.

Não rastreados antes da auditoria: docs/correcao-conexao-api.md; docs/correcao-cors-metro.md; scripts/test-api-client.cjs; scripts/test-cors-metro.cjs. Este relatório acrescenta um novo arquivo não rastreado.

git remote -v retornou vazio. Não foi executado fetch/ls-remote porque não há remoto identificado. Não foi inventada URL, nem atribuído um repositório público homônimo ao usuário. Sincronização e conteúdo do GitHub: NÃO VERIFICADOS. Nenhum commit/push foi executado.

## 8. Parecer final

**AINDA NÃO PRONTO.**

A base técnica de leitura funciona e a estrutura do banco e da API foi comprovada. A aprovação integral depende sobretudo da prova de escrita/persistência real e da consolidação do versionamento/documentação. Falta evidência suficiente para declarar os quatro indicadores integralmente atendidos. Este parecer não exige funcionalidades reservadas às Entregas 3 ou 4 e não substitui uma rubrica institucional que não foi fornecida.
