# Checklist da Entrega 2

Validação local em 05/11/2026, Windows, Node 24.13.1, MySQL80, Expo SDK 58 e Microsoft Edge headless. Status representam execução observada, não apenas leitura do código.

| Indicador                                 | Status              | Evidências                                                                                                                                                                                           |
| ----------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Modelagem dos dados                    | CONCLUÍDO E TESTADO | database/schema.sql, database/seed.sql, docs/modelagem-banco.md; scripts executados no MySQL80, tabelas medicamentos e usuarios criadas                                                              |
| 2. Estrutura da API                       | CONCLUÍDO E TESTADO | backend/src/{config,controllers,models,routes,middlewares}, app.js, server.js; 9 testes HTTP aprovados em backend/tests/api.test.js                                                                  |
| 3. Integração aplicativo/API/banco        | CONCLUÍDO E TESTADO | frontend/src/services/api.js, backend/scripts/verify-integration.js, scripts/test-web.cjs; GET/POST, persistência SQL, busca por nome/princípio, detalhes por ID e cadastro pelo navegador aprovados |
| 4. Evolução, documentação e versionamento | CONCLUÍDO E TESTADO | cinco telas em frontend/src/screens, React Navigation em src/navigation, README e docs, .gitignore; navegação Web validada e repositório Git local preparado                                         |

## Verificações complementares

| Verificação                                         | Status / resultado                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Dependências de backend, frontend e ferramentas     | CONCLUÍDO E TESTADO — instalação via npm.cmd                                                          |
| Pool e health MySQL                                 | CONCLUÍDO E TESTADO — banco e servidor online, health 503 com banco substituído indisponível em teste |
| POST e persistência real                            | CONCLUÍDO E TESTADO — registro técnico integrado id 4, mais registros técnicos criados no teste Web   |
| Pesquisa inexistente e tratamento de erro/retry     | CONCLUÍDO E TESTADO — testes Web com API real e falha de rede simulada                                |
| Nome obrigatório, limites, fonte, URL e ID inválido | CONCLUÍDO E TESTADO — testes HTTP; nome obrigatório também testado na interface                       |
| Expo Web e exportação                               | CONCLUÍDO E TESTADO — Metro iniciado, bundle Web gerado, navegação executada no Edge                  |
| Responsividade                                      | CONCLUÍDO E TESTADO — capturas 1366×900 e 390×844; sem overflow horizontal em 390px                   |
| Abertura de bula específica                         | IMPLEMENTADO, MAS NÃO TESTADO — Linking.openURL; seed não inventa link de bula específica             |
| Execução em aparelho/emulador Android               | IMPLEMENTADO, MAS NÃO TESTADO — configuração e bibliotecas compatíveis; requer dispositivo            |
| Conteúdo clínico individual revisado                | PENDENTE — campos clínicos e URL específica vazios, descrições explícitas de pendência                |
| Autenticação e autorização                          | PENDENTE — reservadas à Entrega 3; POST aberto apenas para demonstração local                         |
| GitHub remoto/push                                  | PENDENTE — nenhum push autorizado ou executado                                                        |

## Testes e reprodução

No backend: npm.cmd test (9 aprovados) e npm.cmd run test:integration (MySQL real). O teste integrado deixa registro técnico identificado, sem conteúdo farmacêutico. Na raiz: npm.cmd ci e npm.cmd run test:web, com API/Expo já iniciados e Edge instalado. Esse teste também persiste um registro técnico para conferir o POST completo. Não executa DELETE.

Capturas locais ignoradas pelo Git: artifacts/inicio-desktop.png, artifacts/detalhes-desktop.png, artifacts/inicio-mobile.png. artifacts/web-test.json contém URLs/status das requisições e lista vazia de erros JavaScript.

Compatibilidade: npx.cmd expo install --check aprovado. Exportação: npx.cmd expo export --platform web aprovado. A largura móvel no navegador não equivale a executar Android.

## Problemas corrigidos e limitações

- PowerShell bloqueava npm.ps1: comandos usam npm.cmd/npx.cmd, sem alterar política de execução.
- Pipe inicial do PowerShell corrompeu acentos: gravação UTF-8 corrigida, três registros de demonstração corrigidos por correspondência exata e capturas revisadas. Script conservador em backend/scripts/repair-seed-encoding.js; não precisa ser executado numa instalação nova.
- .env inicialmente dependia da pasta de execução: agora backend/src/config/db.js resolve caminho relativo ao próprio arquivo.
- Chamada inicial npm test dentro do frontend não tinha script: testes HTTP pertencem ao backend; teste Web é executado na raiz. Comandos corretos documentados.
- Docker estava desligado: MySQL80 já estava em execução e foi usado diretamente.
- npm audit: backend e ferramentas raiz sem vulnerabilidades na instalação; frontend apresentou 12 avisos moderados transitivos nas ferramentas Expo/ESLint (glob/minimatch e dependentes). Não foi aplicada a sugestão de downgrade forçado incompatível para Expo 52/53. Reavaliar atualizações compatíveis antes de distribuição.

As credenciais locais foram configuradas em backend/.env ignorado pelo Git. Nenhuma credencial consta nos exemplos/documentação. A tabela usuarios é preparação, sem autenticação falsa. Revisão editorial e proteção do backend são necessárias antes de disponibilização pública.

ESLint detectou uma atualização de estado síncrona em effect na tela Detalhes: corrigida com estado associado à chave da requisição e descarte de resposta obsoleta. Uma dependência de recarga também foi explicitada no hook de listagem.

Validação estática final: npm.cmd run lint aprovado sem erros/avisos; npm.cmd run typecheck aprovado em modo JavaScript sem checkJs estrito. O teste Web completo passou novamente após a correção no carregamento dos detalhes.
