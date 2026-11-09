# Auditoria técnica final — PillDex, Entrega 3

Data: 09/11/2026 (America/Sao_Paulo). Parecer: **AINDA NÃO PRONTO**.

## 1. Resumo executivo e escopo

O cadastro, login, proteção de senha, autorização e CRUD funcionaram nos testes executados com MySQL real e no Expo Web. Não foi comprovada falha de autorização ou de persistência nos cenários exercitados. A conclusão integral permanece bloqueada pela falta de teste nativo da sessão/armazenamento seguro e pela Entrega 3 ainda não estar registrada no histórico local, com arquivos essenciais não rastreados. O remoto também aponta para um commit diferente da referência local e precisa ser reconciliado antes do envio.

Esta auditoria não alterou código de produção, configurações, credenciais, níveis de contas existentes ou documentação anterior. Não executou migração, instalação de dependências, commit ou push. Foram criados este relatório e arquivos temporários de teste em `artifacts/` (ignorado pelo Git). A exportação de bundles foi direcionada a `artifacts/auditoria-e3-export/`. Os testes existentes também geraram a captura ignorada `artifacts/entrega-3-mobile.png`.

Os testes de escrita criaram somente usuários/medicamentos técnicos identificados, sem informações clínicas, e limparam seus próprios registros. O teste adicional comparou SHA-256 do conteúdo completo das tabelas antes/depois: **8 medicamentos e 2 usuários preservados**, incluindo os respectivos campos e timestamps. Não compara o contador AUTO_INCREMENT, que pode avançar legitimamente com esses testes. A conta administrativa real foi preservada; testes usaram outras contas temporárias.

Ambiente observado: Node/npm disponíveis; MySQL **8.0.46**, banco `pilldex_db`; Express **5.3.0**, bcrypt **6.0.0**, jsonwebtoken **9.0.3**, mysql2 **3.24.6**; Expo **58.0.23**, React Native **0.88.1**, SecureStore **58.0.2**. Dependências diretas resolvidas por `npm ls --depth=0`, sem indicação de dependência ausente. API local na porta 3000, Expo Web nas portas 8081 e 8082.

As classificações se limitam aos cenários testados. APROVADO não equivale a garantia de ausência de qualquer vulnerabilidade.

Conferência final: comparação dos segredos locais também executada em **76 arquivos rastreados e novos não ignorados**, sem correspondências. Não foram publicados os valores pesquisados. A verificação não certifica segredos diferentes dos valores locais nem o commit remoto ainda indisponível localmente.

## 2. Tabela dos cinco indicadores

| Indicador | Classificação | Evidência e alcance | Pendência |
| --- | --- | --- | --- |
| 1 — Cadastro, login e proteção de senha | **APROVADO** | Cadastro/login HTTP com MySQL real, validações, duplicidade, bcrypt, ausência de hash nas respostas e tentativa de nivel=admin bloqueada | Nenhuma falha obrigatória comprovada nesses cenários |
| 2 — JWT e gerenciamento da sessão | **PARCIAL** | Assinatura, algoritmo, emissor, público, expiração, Bearer, me, logout e sessão Web testados | SecureStore, reinício/restauração e logout nativos não executados |
| 3 — Níveis e controle de acesso | **APROVADO** | 401/403 em POST/PUT/DELETE; permissões atuais no MySQL; claims/body manipulados não concedem admin; painel restrito no Web | Validação visual nativa permanece fora da evidência Web |
| 4 — CRUD e integração geral | **PARCIAL** | CRUD SQL/HTTP e interface Web aprovados, inclusive pesquisa, persistência e atualização de listagem | Fluxo nativo Android completo não verificado |
| 5 — Funcionamento, evolução e versionamento | **PARCIAL** | API, Web, React Navigation, lint, typecheck e bundles aprovados; documentos presentes | Arquivos novos não rastreados; ausência de commit da Entrega 3; remoto diferente; documentos desatualizados e teste nativo pendente |

## 3. Cadastro, login e proteção de senha

| Requisito / arquivo | Evidência e teste realizado | Esperado | Obtido | Resultado | Correção necessária |
| --- | --- | --- | --- | --- | --- |
| Tabela e campos — `database/schema.sql`, `models/usuarios.js` | SHOW COLUMNS/SHOW INDEX no MySQL real | id, nome, email, senha_hash, nivel, timestamps; email único | Todos os sete campos, índice único de email, enum admin/usuario com padrão usuario | APROVADO | — |
| Cadastro válido — `routes/auth.js` | POST de conta técnica com credenciais geradas nesta execução | 201 e usuário persistido | 201; ID consultado no SQL | APROVADO | — |
| Normalização/duplicidade — `auth.js`, `routes/auth.js` | Repetição do email em maiúsculas | Rejeição sem segunda conta | 409 com mensagem genérica | APROVADO | — |
| Nome/email/senha — `auth.js` | Nome vazio, numérico e maior que 150; email inválido; senha curta, array e senha multibyte maior que 72 bytes | 400, sem cadastro | 400 nos casos exercitados | APROVADO | — |
| Hash — `auth.js`, `models/usuarios.js` | Comparação bcrypt do hash lido por SQL com a senha técnica; inspeção agregada das contas atuais | Hash bcrypt, nunca senha pura | bcrypt.compare=true; custo 12 no código; 2/2 hashes atuais com formato bcrypt, nenhum fora desse formato | APROVADO | Não implica varredura de backups externos |
| Login correto/incorreto — `routes/auth.js` | Login técnico real; senha errada e email ausente | 200 com JWT ou 401 genérico | 200; erros 401 com o mesmo conteúdo para senha errada/email ausente | APROVADO | — |
| Dados sensíveis — `publicUser`, `models/usuarios.js` | Inspeção e asserções em respostas de cadastro/login/me/erros | Sem senha ou senha_hash em usuário retornado | Projeção de campos públicos; nenhuma exposição observada | APROVADO | — |
| Privilégios no cadastro — `routes/auth.js` | Envio de nivel=admin | Persistir usuario | Resposta e SQL confirmaram usuario | APROVADO | — |

O backend faz SQL parametrizado e usa bcrypt para gerar/verificar hashes. O valor enviado em `nivel` não é repassado à criação pública. O script local `backend/scripts/create-admin.js` foi inspecionado: usa credenciais externas, valida senha e recusa email existente. Sua CLI não foi executada nesta auditoria; a existência de conta admin foi comprovada por SQL, não pela execução desse provisionador.

## 4. JWT e sessão

| Requisito / arquivo | Teste/evidência | Esperado | Obtido | Resultado | Correção necessária |
| --- | --- | --- | --- | --- | --- |
| Segredo externo — `backend/src/auth.js`, `config/db.js` | Verificação sem imprimir seu valor | JWT_SECRET no ambiente, não literal no código | Configurado localmente, 96 bytes; TTL 3600 s; validação de configuração no startup | APROVADO | Manter privado |
| Emissão e assinatura — `issueToken` | Login, jwt.verify com HS256/emissor/público e verificação de sub/exp | JWT assinado e com expiração | Verificação aprovada; sub corresponde ao usuário; exp > iat | APROVADO | — |
| Bearer válido/me — `authenticate`, `routes/auth.js` | GET /auth/me com token de login | 200 com usuário público | 200 | APROVADO | — |
| Token ausente/inválido/malformado — `authenticate` | Sem header; token inválido; Basic; Bearer sem valor; token com palavra adicional | 401 | 401 nos cenários testados | APROVADO | — |
| Assinatura/expiração/claims — `authenticate` | Outra chave, token expirado, issuer/audience errados, HS384 e assinatura none | 401 | Todos rejeitados | APROVADO | — |
| Fetch autenticado — `AuthContext.js`, `api.js` | CRUD no navegador e inspeção do helper | Authorization: Bearer centralizado | Requisições protegidas funcionaram; 401 encerra sessão no código | APROVADO no Web | Testar também no dispositivo |
| Memória no Web — `AuthContext.js` | Recarga após login e inspeção de localStorage | Sem restauração persistente de token | Retornou a visitante; nenhuma chave de sessão/token PillDex encontrada | APROVADO | — |
| Expiração na interface — `AuthContext.js`, `AppNavigator.js` | Login em servidor de teste com TTL 60 s e avanço do relógio Playwright em 61 s | Encerrar sessão e mostrar login | Fluxo passou; expiração real de JWT também testada na API | APROVADO no Web | Relógio simulado testa UI; não substitui passagem de tempo nativa |
| Logout na interface — `ProfileScreen.js`, `AuthContext.js` | Sair, retorno a visitante, desaparecimento de opções administrativas | Sessão local removida | Passou no navegador; novo login necessário para usar painel | APROVADO no Web | — |
| Revogação no servidor | Reutilização do JWT técnico após sair no aplicativo | Documentado como logout local | /auth/me ainda retornou 200 com o JWT emitido | APROVADO para o modelo documentado | Revogação é melhoria opcional, não foi alegada |
| SecureStore/restauração nativa — `AuthContext.js`, `frontend/app.json` | Inspeção de getItemAsync/setItemAsync/deleteItemAsync e plugin; consulta ADB | Restaurar token válido e remover ao sair | Implementação presente; nenhum dispositivo/emulador conectado | NÃO VERIFICADO em execução | Executar em Android: login, fechar/reabrir, expiração, logout e novo reinício |

`adb devices -l` foi executado pelo caminho do SDK local; a lista retornou vazia. Não se afirmou que o SDK Android está ausente. A geração de bundle Android/iOS passou, mas não comprova SecureStore, execução nativa, conectividade de aparelho ou restauração.

Ponto de robustez observado por inspeção: se deleteItemAsync falhar, o código limpa a sessão em memória e exibe uma mensagem, mas o item persistido pode continuar presente. Não foi reproduzida essa falha no dispositivo. Testar esse caminho e oferecer recuperação antes de considerá-lo validado; não foi classificado como uma falha operacional comprovada.

## 5. Níveis e permissões

Arquivos: `backend/src/auth.js`, `routes/medicamentos.js`, `models/usuarios.js`, `frontend/src/navigation/AppNavigator.js`, `HomeScreen.js`, `AdminListScreen.js`.

| Cenário realizado | Esperado | Obtido | Resultado | Correção |
| --- | --- | --- | --- | --- |
| Usuário comum tenta POST, PUT e DELETE | 403 nas três operações | 403 nas três | APROVADO | — |
| Sem token nas três operações | 401 | 401 | APROVADO | — |
| Token inválido nas três operações | 401 | 401 | APROVADO | — |
| Body envia nivel=admin com usuário comum | Não elevar acesso | 403 nas três operações | APROVADO | — |
| JWT válido de teste afirma nivel=admin, mas SQL mantém usuario | Autorizar pelo banco | 403 nas três operações | APROVADO | — |
| Conta técnica promovida localmente somente para testar admin | Permitir CRUD admin | 201 no cadastro, 200 na edição/exclusão | APROVADO | Conta técnica removida |
| Conta técnica volta a usuario após ter token emitido | Bloquear novas escritas | 403, comprovando consulta do nível atual | APROVADO | — |
| Visitante/usuario no frontend | Sem opções administrativas | Contagem de botões administrativos igual a zero | APROVADO no Web | Teste nativo pendente |
| Admin no frontend | Painel e formulário disponíveis | Login, perfil, painel e CRUD passaram | APROVADO no Web | Teste nativo pendente |

O middleware busca usuário e nível atuais no banco; não confia no nível do body ou apenas no claim assinado. A ocultação de botões é complementar à autorização do backend. No banco atual foram observadas **1 conta admin e 1 usuario**, sem expor hashes ou credenciais no relatório.

## 6. CRUD e validações

Arquivos: `backend/src/routes/medicamentos.js`, `controllers/medicamentos.js`, `models/medicamentos.js`, `middlewares/validation.js`; `frontend/src/screens/AdminListScreen.js`, `AdminScreen.js`, `DetailsScreen.js`, `services/api.js`.

| Requisito/teste | Esperado | Obtido/evidência | Resultado | Correção |
| --- | --- | --- | --- | --- |
| POST técnico como admin | 201, Location, persistência SQL | Teste HTTP existente conferiu Location; integração adicional conferiu nome/princípio por SQL | APROVADO | — |
| GET lista e ID | 200 e registro correto | Resultado correspondeu ao SQL e ID criado | APROVADO | — |
| Pesquisa por nome | Encontrar somente o registro técnico | Busca com nome completo e aspas retornou somente o esperado | APROVADO | — |
| Pesquisa por princípio ativo | Encontrar pelo princípio distinto do nome | Registro técnico encontrado pelo marcador exclusivo do princípio | APROVADO | — |
| PUT e persistência | 200; novo conteúdo no MySQL | Nome editado confirmado por SELECT | APROVADO | — |
| PUT sem mudanças | Sucesso sem falso 404 | 200 ao salvar valores idênticos | APROVADO | — |
| DELETE e persistência | 200; registro ausente | SELECT retornou zero registros e GET retornou 404 | APROVADO | — |
| ID inválido/ausente | 400/404 | abc → 400; ID inexistente → 404 em GET/PUT/DELETE | APROVADO | — |
| Nome, tipos e limites | 400 em dados inválidos | Nome ausente/numérico/maior que 150, fonte maior que 255 e PUT com nome numérico rejeitados | APROVADO | — |
| Fonte e URL | Rejeitar texto clínico sem fonte e esquema executável | 400 para indicacoes sem fonte e javascript: | APROVADO | Não equivale a revisão farmacêutica da fonte |
| Formulário de edição | Preencher pela API e salvar | Navegador confirmou valor inicial e mensagem de atualização | APROVADO no Web | Testar nativo |
| Exclusão na interface | Confirmar/cancelar e atualizar lista | Cancelamento manteve o item; confirmação removeu e lista atualizou | APROVADO no Web | Testar nativo |

PUT substitui o conjunto de nove campos editáveis; não implementa PATCH. SQL dinâmico usa somente a lista fixa de nomes de colunas do código; os valores e IDs são parâmetros.

## 7. Integração MySQL e preservação

`SHOW COLUMNS` comprovou que a migração de `usuarios.atualizado_em` já está refletida no banco. A auditoria leu `database/migration-entrega-3.sql` e `backend/scripts/migrate.js`, mas não reaplicou DDL. O script JS consulta information_schema antes de acrescentar a coluna; o arquivo SQL isolado é de execução única, conforme comentário.

`npm run test:integration` executou HTTP contra uma instância real da aplicação e MySQL, com segredo efêmero exclusivo do processo. O teste adicional em `artifacts/audit-entrega-3.cjs` repetiu cenários com verificações SQL independentes, incluindo igualdade dos dados existentes após limpeza. Nenhum teste usou a conta administrativa real para operações de escrita.

Baseline de medicamentos no teste adicional: SHA-256 `d1fa1c2b2908413008fa8747a5885c4401eca3db961ce6ab2a87fb747b64e31c`. A igualdade de usuários também foi verificada sem publicar seu conteúdo ou hashes de senha.

## 8. Expo Web, frontend e regressão da Entrega 2

| Teste / arquivo | Esperado | Obtido | Resultado / limite |
| --- | --- | --- | --- |
| `npm run test:web` — `scripts/test-web-e3.cjs` | Cadastro, confirmação de senha, login correto/incorreto, perfil, logout, restrição do painel e CRUD | Passou com Edge headless e API/MySQL reais; servidor isolado por redirecionamento de URL no teste | APROVADO no Web; não é autenticação simulada |
| Regressão pública — mesmo script | Pesquisa vazia, pesquisa existente, detalhes, catálogo | Passou; consultas continuaram disponíveis sem login | APROVADO |
| Erro/retry e expiração — mesmo script | Mostrar erro de rede/recuperar; encerrar sessão expirada | Passou; rede interrompida deliberadamente e relógio de UI avançado | APROVADO no alcance da injeção de falhas |
| Sessão após refresh | Não persistir token no navegador | Voltou a visitante | APROVADO |
| Largura 390 px | Sem overflow horizontal | Asserção passou; captura gerada e inspecionada | APROVADO nesse viewport |
| CORS/Metro real — `scripts/test-cors-metro.cjs` | GET/pesquisa e WebSocket ativos nas portas 8081/8082 | HTTP 200, handshakes 101, sem erros JS/CORS observados | APROVADO |
| API local sem redirecionamento — `artifacts/audit-web-live.cjs` | Login admin, perfil, formulário, logout, consulta pública e link | Passou usando API da porta 3000; nenhuma interceptação da API | APROVADO |
| Abertura de link — teste live | Abrir a URL cadastrada em nova aba | Popup abriu a URL técnica esperada | APROVADO para mecanismo; destino técnico interceptado, não é uma bula real |
| `npm run lint` e `npm run typecheck` | Exit 0 | Ambos passaram | APROVADO; checkJs=false, sem tipagem estática estrita |
| `npx expo install --check` | Compatibilidade declarada do SDK | “Dependencies are up to date”, exit 0 | APROVADO |
| `npx expo export --platform all --output-dir ../artifacts/auditoria-e3-export` | Gerar Web/Android/iOS | Três bundles gerados, exit 0 | APROVADO como compilação; execução nativa NÃO VERIFICADA |

Capturas temporárias: `artifacts/entrega-3-mobile.png`, `artifacts/auditoria-e3-perfil.png`, `artifacts/auditoria-e3-formulario.png`, `artifacts/auditoria-e3-detalhes.png`. O fluxo foi exercitado pelo navegador real; não foi realizada revisão visual manual exaustiva de todos os dispositivos ou de todos os estados de acessibilidade.

No catálogo preservado, consulta agregada encontrou 8 medicamentos, 8 fontes preenchidas e 1 URL de bula preenchida. A auditoria funcional não validou a qualidade farmacêutica nem a correspondência oficial dessa URL com um medicamento. A abertura de URL foi testada com registro técnico descartável explicitamente identificado; isso não certifica o conteúdo editorial do catálogo.

## 9. Segurança

| Verificação / arquivo | Teste/evidência | Esperado | Obtido | Resultado / correção |
| --- | --- | --- | --- | --- |
| SQL injection — models e validation | Busca com aspas/OR/comentário/%/_, nome com expressão SQL literal e login com aspas | Não alterar a estrutura da consulta ou autenticar indevidamente | Busca maliciosa vazia; nome gravado como texto; login 401 | APROVADO para os payloads exercitados |
| Senhas — auth.js/usuarios.js | bcrypt.compare e varredura de formato nas contas atuais | Hashes bcrypt | 2/2 hashes com formato esperado | APROVADO |
| Segredo em código/Git | Busca por referências e comparação dos valores locais de JWT_SECRET/DB_PASSWORD (>=8 caracteres), sem imprimir valores | Não encontrar os segredos locais | Zero ocorrências no conteúdo dos arquivos rastreados atuais e nos 3 commits acessíveis | APROVADO nesse escopo; outros segredos/backups/remoto novo NÃO VERIFICADOS |
| Arquivos .env no Git | git ls-files, check-ignore e log por caminho | Ignorados e não rastreados | backend/.env e frontend/.env ignorados; nenhum desses caminhos no histórico consultado | APROVADO no histórico local consultado |
| Tokens em logs — backend/src e frontend/src | Inspeção dos pontos console e saídas dos testes | Não registrar Authorization/JWT/senha | Logs de produção inspecionados registram endereço/códigos de erro; nenhum token observado | APROVADO no código/saídas inspecionados; logs externos não examinados |
| Endpoints administrativos | Matriz 401/403 e manipulação de nível | Não modificar sem admin | Bloqueados no backend | APROVADO |
| CORS — app.js | Origem não permitida e preflight POST/PUT/DELETE com Authorization nas origens locais | 403 ou 204 com headers corretos | Conforme esperado | APROVADO; CORS não é autenticação |
| Erros/dados internos — errors.js | JSON malformado e banco indisponível nos testes HTTP existentes | Sem stack/credenciais | Respostas genéricas; teste de indisponibilidade passou | APROVADO nesses cenários |
| Dependências backend | npm audit --json | Sem avisos conhecidos | 0 vulnerabilidades, exit 0 | APROVADO na consulta executada |
| Dependências frontend | npm audit --json | Pendências conhecidas identificadas | 12 moderadas; 0 altas/críticas; exit 1 | PARCIAL; avaliar correção compatível, não executar fix --force cegamente |

Os 12 avisos do frontend incluem dependências/efeitos transitivos de glob/minimatch em Expo/CLI/fingerprint e ESLint/TypeScript-ESLint. A sugestão automática inclui rebaixar Expo para 52.0.49 e eslint-config-expo para 6.0.0; não foi aplicada. A contagem de 12 não representa 12 explorações independentes comprovadas no aplicativo.

Não houve testes de carga, tentativa destrutiva, acesso a contas alheias ou varredura de serviços externos. O limite de tentativas de autenticação está implementado com express-rate-limit; sua saturação não foi testada para evitar teste de carga e impacto nas sessões locais. HTTPS é necessário em disponibilização externa; a auditoria exerceu HTTP local.

## 10. README e documentação

| Arquivo | Evidência | Resultado | Correção necessária |
| --- | --- | --- | --- |
| README.md | Execução, MySQL, JWT, bcrypt, Bearer, níveis, CRUD, admin:create, Web/mobile e logout local documentados | APROVADO para cobertura; PARCIAL para atualização | Evitar Copy-Item .env.example .env incondicional em ambiente já configurado; manter destaque para preservar .env |
| docs/entrega-3.md | Evolução e arquivos, configuração, limites de sessão e testes | APROVADO | Registrar resultado da auditoria atual após revisão |
| docs/checklist-entrega-3.md | Cinco indicadores e limites nativos explícitos | PARCIAL | Continua pendente “provisionar administrador”, mas banco já contém admin; atualizar esse item com a evidência atual |
| docs/rotas-api.md | Contrato atual de auth/CRUD, códigos HTTP e distinção do histórico da Entrega 2 | APROVADO | Melhorar organização, trazendo a tabela atual para o início, opcionalmente |
| docs/documentacao-tecnica.md, modelagem-banco.md, fluxo-navegacao.md, relatorio-final.md | Atualizações da Entrega 3 e preservação do conteúdo histórico | APROVADO para existência e cobertura inspecionada | Não confundir registros históricos com resultados desta execução |

Nenhum desses arquivos foi alterado pela auditoria. O único documento criado é este relatório.

## 11. Git e GitHub

Repositório configurado: `https://github.com/lucasazevedxo/PillDex.git`, branch local `main` com upstream `origin/main`.

| Verificação | Obtido | Resultado |
| --- | --- | --- |
| HEAD local e referência origin/main | Ambos `c63e7160d34aac68e2900ef2beaa04f440071f7e` | APROVADO como estado local observado |
| Histórico local acessível | 3 commits: c63e716 (Entrega 2), 8c36595 (PrimeiroCommit), 955de5e (Entrega 2) | Histórico preservado; Entrega 3 ainda ausente |
| Arquivos da Entrega 3 registrados | auth.js, routes/auth.js, AuthContext.js e docs/entrega-3.md, entre outros, aparecem como não rastreados | REPROVADO para requisito de arquivos necessários versionados |
| Modificações rastreadas | README, backend, frontend, SQL, documentação e scripts modificados localmente | PARCIAL: trabalho existe, mas não integra commit da Entrega 3 |
| Remoto real — git ls-remote origin refs/heads/main | `08ac912d578a7d7563488a7e6d82ee200dce51d1` | Diferente de HEAD e da referência local origin/main |
| Ancestralidade/conteúdo do novo remoto | git cat-file não encontrou esse objeto localmente; nenhum fetch foi realizado | NÃO VERIFICADO; não é possível afirmar se está à frente, atrás ou divergente apenas pelos hashes |
| Credenciais locais | .env ignorados, sem correspondência dos segredos locais na varredura descrita | APROVADO no alcance local; conteúdo do commit remoto novo não auditado |
| Whitespace — git diff --check | Exit 0; avisos LF/CRLF apenas | APROVADO |

O `git status -sb` pode mostrar main...origin/main sem indicar a mudança real do servidor, pois a referência remota local está desatualizada. A consulta ls-remote não atualizou refs nem alterou o histórico. Não foram executados commit, push, reset ou merge. Não se deve publicar as mudanças antes de revisar o novo estado remoto e incluir todos os arquivos necessários.

## 12. Problemas e limitações identificados

1. **Teste nativo essencial ausente:** nenhum dispositivo conectado ao ADB; não comprovados SecureStore, restauração após reinício, exclusão do token e navegação/CRUD no Android.
2. **Versionamento incompleto:** novos arquivos essenciais não rastreados e nenhuma revisão da Entrega 3 no histórico local. Um checkout dos commits locais atuais não reproduz a implementação auditada.
3. **Estado remoto diferente:** a ponta real do GitHub difere da referência local; conteúdo e relação de ancestralidade ainda não verificados.
4. **Documentação parcialmente desatualizada:** conta admin já existe, mas checklist ainda pede provisionamento. Comando de cópia de .env requer cuidado para não sobrescrever configurações existentes.
5. **Dependências frontend:** 12 alertas moderados conhecidos; nenhuma correção aplicada nesta auditoria.
6. **Limite editorial:** somente 1 dos 8 registros tem URL preenchida; não foi certificada a correspondência oficial nem revisado conteúdo clínico. A aplicação apresenta campos ausentes como não cadastrados.
7. **Robustez nativa a confirmar:** falha de exclusão do SecureStore pode preservar o item persistido; cenário identificado por inspeção, não reproduzido.

Não foi comprovada falha de cadastro/login, autorização de usuário comum, SQL injection ou persistência do CRUD nos testes executados.

Ocorrências do procedimento: o primeiro teste adicional de login com payload contendo espaços retornou 400 de validação, enquanto o roteiro temporário esperava 401. O payload foi ajustado para um email sintaticamente aceito e permaneceu sem autenticar (401). Outro roteiro temporário tentou localizar o botão de retorno por um nome acessível genérico que não correspondia à interface; foi repetido usando ações explícitas da aplicação e passou. Esses erros foram do roteiro de auditoria; não motivaram alterações em produção. As limpezas de registros técnicos também ocorreram nessas execuções.

## 13. Correções obrigatórias, em ordem de prioridade

1. **P1 — Comprovar o fluxo Android.** Conectar dispositivo/emulador e registrar login dos dois níveis, reinício com restauração de sessão válida, expiração, logout e reinício sem restauração, pesquisa/detalhes/links e CRUD. Testar também falha do armazenamento seguro antes de alegar robustez nesse cenário. Não basta exportar bundle.
2. **P1 — Concluir o versionamento em tarefa posterior autorizada.** Verificar o commit remoto real, reconciliar o histórico sem perder alterações, revisar segredos, incluir os arquivos essenciais e registrar commits reais da Entrega 3. Commit/push foram expressamente proibidos nesta auditoria e não foram executados.
3. **P2 — Atualizar as evidências documentais.** Corrigir o checklist de admin e registrar os resultados nativos quando executados; tornar a cópia de .env condicional ou indicar claramente que só deve ocorrer quando o arquivo não existe.
4. **P2 — Tratar os avisos de dependências.** Avaliar versões compatíveis com SDK 58 e o alcance dos avisos; aplicar correções em tarefa de implementação e repetir testes. Não rebaixar automaticamente o SDK com npm audit fix --force.

Para apresentar medicamentos com bula oficial verificada, revisar editorialmente e cadastrar as fontes específicas dos registros usados na demonstração. Esta auditoria não autoriza nem cria informações farmacêuticas.

## 14. Melhorias opcionais

- Revogação de JWT/refresh token, caso o produto passe a exigir logout também no servidor; o modelo local atual está documentado.
- Cobertura automatizada dos caminhos de falha do SecureStore e da restauração nativa.
- Testes de acessibilidade e revisão visual em mais tamanhos de tela e dispositivos.
- Paginação do catálogo, política de atualização editorial e rastreamento de revisões administrativas.
- Varredura especializada de segredos no histórico completo do remoto após sincronização, sem expor valores no relatório.

## 15. Comandos, resultados e parecer final

| Execução nesta auditoria | Resultado |
| --- | --- |
| backend: npm.cmd test | 11/11 testes passaram |
| backend: npm.cmd run test:integration | PASS com MySQL real |
| raiz: node --test scripts/test-api-client.cjs | 6/6 testes passaram |
| raiz: node artifacts/audit-entrega-3.cjs | 63 verificações de respostas HTTP passaram; schema, hashes, preservação de dados e busca de segredos locais também passaram |
| raiz: npm.cmd run test:web | PASS Edge headless + API/MySQL reais |
| raiz: node scripts/test-cors-metro.cjs | PASS portas 8081/8082, HTTP e WebSocket, sem erros JS/CORS |
| raiz: node artifacts/audit-web-live.cjs | PASS API local 3000, logout local, formulário e abertura de link técnico |
| frontend: npm.cmd run lint | Exit 0 |
| frontend: npm.cmd run typecheck | Exit 0 |
| frontend: npx.cmd expo install --check | Exit 0, dependências compatíveis |
| frontend: npx.cmd expo export --platform all --output-dir ../artifacts/auditoria-e3-export | Exit 0, Web/Android/iOS |
| backend/frontend: npm.cmd ls --depth=0 | Dependências diretas presentes |
| backend: npm.cmd audit --json | Exit 0, zero vulnerabilidades |
| frontend: npm.cmd audit --json | Exit 1, 12 moderadas, zero altas/críticas |
| adb devices -l pelo SDK local | Nenhum dispositivo/emulador conectado |
| git ls-remote / log / status / ls-files / check-ignore / diff --check | Estados e limitações descritos na seção 11 |

**Parecer final: AINDA NÃO PRONTO.** A aplicação demonstrou funcionamento no backend/MySQL e no Expo Web, com proteção efetiva das operações administrativas. Não é correto declarar todos os indicadores concluídos enquanto a sessão nativa não estiver comprovada e a implementação da Entrega 3 não estiver devidamente versionada com o estado remoto revisado. O relatório registra essas pendências sem modificar a aplicação ou o histórico.
