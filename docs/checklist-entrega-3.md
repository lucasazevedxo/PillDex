# Checklist — Entrega 3

Auditoria de 09/11/2026. As classificações distinguem implementação e evidência de execução.

| Indicador                                   | Classificação                               | Evidências                                                                                                                                                            |
| ------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Cadastro, login e proteção de senha     | CONCLUÍDO E TESTADO                         | auth.js, routes/auth.js, models/usuarios.js; integração MySQL verifica hash bcrypt, duplicidade, tipos, credenciais, email normalizado e bloqueio de elevação pública |
| 2 — JWT e sessão                            | IMPLEMENTADO, MAS NÃO TESTADO integralmente | AuthContext.js e auth.js; JWT, expiração e sessão Web testados; SecureStore e restauração Android pendentes de dispositivo                                            |
| 3 — Níveis e controle de acesso             | CONCLUÍDO E TESTADO                         | authenticate/autorizarNivel; HTTP real verifica 401/403 em POST/PUT/DELETE e permissões atuais no banco                                                               |
| 4 — CRUD e integração                       | IMPLEMENTADO, MAS NÃO TESTADO integralmente | SQL e HTTP real validados; interface Web automatizada; validação Android pendente                                                                                     |
| 5 — Funcionamento, evolução e versionamento | PARCIALMENTE IMPLEMENTADO                   | README, documentação e testes; histórico preservado; mudanças disponíveis no Git, sem push; validação Android pendente                                                |

## Evidências de execução

- [x] `npm.cmd test` em backend: 11 testes passaram.
- [x] `npm.cmd run test:integration` em backend: passou com MySQL local real; cadastro, duplicidade, validação, hash armazenado, login, JWT, me, token inválido/expirado/algoritmo indevido, permissões, CRUD, busca e persistência.
- [x] `node --test scripts/test-api-client.cjs`: 6 testes passaram.
- [x] `npm.cmd run db:migrate`: migração aditiva aplicada, sem exclusão de dados.
- [x] `npm.cmd run test:web`: passou com Edge headless, API e MySQL reais. Pesquisa, detalhes, cadastro, confirmação de senha, login, perfil, logout, painel, criação, edição preenchida, cancelamento/exclusão, atualização, recarga sem persistência, erro/retry, expiração e viewport 390px; sem erros JavaScript. Captura: artifacts/entrega-3-mobile.png (ignorada no Git).
- [x] `npm.cmd run lint`: passou após corrigir atualização síncrona de estado no effect de edição.
- [x] `npm.cmd run typecheck`: passou (checkJs=false; não comprova tipagem estrita).
- [x] `npx.cmd expo export --platform all`: bundles Web, Android e iOS gerados com sucesso. Isso não substitui teste nativo em dispositivo.
- [x] `git diff --check`: passou; `.env` do frontend/backend seguem ignorados pelo Git.
- [ ] Resolver 12 alertas moderados transitivos de Expo/ESLint em atualização compatível do SDK; nenhum alerta alto/crítico no audit executado.
- [ ] Android físico/emulador: login, SecureStore, restauração, logout, expiração, navegação e CRUD.
- [ ] Operador provisionar administrador permanente para apresentação com credenciais privadas.

Não há declaração de conclusão integral. Logout é local e tokens emitidos permanecem válidos até expirar. Testes removem somente seus próprios registros técnicos.
