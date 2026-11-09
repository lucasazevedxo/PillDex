# PillDex — Entrega 3

Auditoria de 09/11/2026. Evolução sobre o histórico da Entrega 2, sem recriar o aplicativo ou substituir o MySQL.

## Funcionalidades e arquivos

`backend/src/auth.js` centraliza bcrypt (custo 12), validação de credenciais, emissão HS256 e middlewares de autenticação/autorização. `routes/auth.js` implementa cadastro, login e perfil com limite de tentativas. `models/usuarios.js` usa SQL parametrizado. Cadastro ignora nível fornecido e sempre grava `usuario`; login usa erro genérico e comparação bcrypt mesmo para email inexistente. Hash nunca integra as respostas.

`JWT_SECRET` é obrigatório, externo ao código, com pelo menos 32 bytes. `JWT_TTL_SECONDS` aceita 60–86400 segundos (padrão 3600). Verificação limita algoritmo, emissor, público e validade. O identificador do token é usado para obter o usuário e nível atuais do banco. POST/PUT/DELETE exigem administrador; falta de autenticação retorna 401 e falta de permissão 403. Leituras permanecem públicas. CORS permite Authorization, PUT e DELETE nas origens configuradas; não substitui autenticação.

`models/medicamentos.js`, `controllers/medicamentos.js` e `routes/medicamentos.js` implementam CRUD parametrizado. PUT substitui os nove campos editáveis; não é atualização parcial. ID inválido retorna 400, registro ausente 404. Fonte e links são validados sem produzir conteúdo clínico.

`frontend/src/context/AuthContext.js` centraliza usuário, token, restauração, login/cadastro, logout e Fetch autenticado. No dispositivo, usa expo-secure-store; na Web, apenas memória. Restauração valida `/auth/me`. Timer e respostas 401 encerram sessão expirada. Logout remove sessão local; não revoga o JWT no servidor.

Telas novas: `AuthScreen.js` (Login e Cadastro), `ProfileScreen.js` e `AdminListScreen.js`. `AdminScreen.js` é o formulário reutilizado para criação e edição, com preenchimento pela API. `HomeScreen.js` apresenta acessos conforme sessão; `AppNavigator.js` registra rotas administrativas somente para admin, usando React Navigation conforme pedido explícito. O painel oferece exclusão com confirmação e cancelamento nas duas plataformas. Listas atualizam ao receber foco e após excluir.

## Banco e configuração

Schema preserva `usuarios` com id, nome, email único, senha_hash, nivel, criado_em e atualizado_em. `database/migration-entrega-3.sql` contém a alteração aditiva. `npm run db:migrate` inspeciona information_schema e aplica apenas se necessário; foi executado no MySQL local. Não remove ou substitui registros. `db:setup` também chama a migração em instalações existentes.

`npm run admin:create` provisiona conta com ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD fornecidos pelo operador. Recusa duplicidade e não altera conta existente. Nenhuma conta administrativa permanente foi criada automaticamente. Configure credenciais privadas para a apresentação e siga o README. JWT_SECRET local foi gerado de forma aleatória no `.env` ignorado. Arquivos de exemplo contêm apenas placeholders.

## Testes e auditoria

Veja o checklist para resultados de execução. O teste MySQL real em `backend/scripts/verify-entrega-3.js` inicia servidor com segredo efêmero, cria apenas registros técnicos identificados e remove esses registros ao terminar. Ele verifica hash SQL, autenticação, permissões, token expirado, CRUD e persistência. O teste de navegador `scripts/test-web-e3.cjs` usa API/MySQL reais e contas técnicas temporárias. O redirecionamento de rede no Playwright aponta para esse servidor isolado; não simula dados ou autenticação. O cenário erro/retry interrompe a rede deliberadamente.

## Limitações e versionamento

`npm audit` no frontend registrou 12 alertas moderados nas dependências transitivas das ferramentas Expo/ESLint (glob/minimatch). Nenhum alerta alto ou crítico. A correção automática sugerida rebaixaria o SDK para 52 e não foi aplicada. Backend: instalação auditou 118 pacotes sem vulnerabilidades. Essa pendência de dependências fica registrada para atualização compatível com SDK 58.

Ainda é necessário validar Android em dispositivo, especialmente SecureStore, restauração, links e navegação. Não há recuperação de senha, refresh token ou revogação de JWT. Falha de restauração exige login novamente. Fontes farmacêuticas exigem revisão editorial humana; dados de demonstração anteriores continuam identificados e não foram substituídos por bulas inventadas.

O histórico da Entrega 2 foi preservado. Alterações da Entrega 3 ficam disponíveis para revisão no Git; não foram fabricados commits por etapas nem executado push. O quinto indicador deve considerar o registro de commits reais após revisão. A entrega não é declarada integralmente concluída enquanto a validação Android permanecer pendente.

Referências de implementação: [SecureStore SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [bcrypt](https://github.com/kelektiv/node.bcrypt.js).
