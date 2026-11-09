# PillDex — Uma Enciclopédia Farmacêutica

Aplicativo de consulta informativa para adultos, idosos e cuidadores. Entrega 3: React Native + Expo + React Navigation → Fetch → Express → MySQL, com cadastro, bcrypt, JWT, níveis de acesso e CRUD protegido. Não realiza diagnóstico, prescrição ou recomendação de tratamento.

## Entrega 3 — execução e autenticação

Preserve os arquivos `.env` existentes. Instale as dependências com `npm.cmd ci` na raiz, em `backend` e em `frontend`. No backend, execute `npm.cmd run db:migrate` após configurar o MySQL (ou `db:setup` para instalação nova). A migração acrescenta apenas `usuarios.atualizado_em`, sem apagar registros.

Configure `JWT_SECRET` com pelo menos 32 bytes aleatórios e `JWT_TTL_SECONDS=3600` em `backend/.env`. Gere um segredo com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` e guarde-o somente no `.env`. O servidor recusa iniciar sem configuração válida. Nesta estação, o segredo local já foi gerado sem ser exibido.

Cadastro público sempre cria `usuario`. Para provisionar um administrador, configure `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` no ambiente do terminal ou temporariamente no `.env` ignorado pelo Git e execute, em `backend`, `npm.cmd run admin:create`. A senha deve ter no mínimo 8 caracteres e no máximo 72 bytes. Remova essas três variáveis após provisionar. O script recusa email existente; não promove contas silenciosamente. Nenhuma conta administrativa permanente com senha pública é fornecida.

Inicie a API com `cd backend` e `npm.cmd start`. Em outro terminal, execute `cd frontend` e `npm.cmd run web`. O catálogo é público; use Entrar/Criar conta e Meu perfil. Somente administradores veem Gerenciar catálogo, com cadastro, edição preenchida e exclusão confirmada.

JWT usa HS256, `sub`, nível, emissor, público e expiração; a API consulta o nível atual no MySQL em cada operação protegida. O aplicativo envia `Authorization: Bearer TOKEN`. No Android/iOS, SecureStore permite restaurar a sessão após validar `/auth/me`. Na Web, o token fica apenas em memória e desaparece ao recarregar. Logout é local: o JWT emitido permanece válido no servidor até expirar. Use HTTPS ao disponibilizar fora do ambiente local.

Relatório, evidências e limitações: [Entrega 3](docs/entrega-3.md) e [checklist dos cinco indicadores](docs/checklist-entrega-3.md).

## Instalação no Windows

Requer Node.js 22.13+ e MySQL 8.0. Execute no PowerShell, na raiz do repositório:

    cd backend
    npm.cmd ci
    Copy-Item .env.example .env

Preencha DB_HOST, DB_PORT, DB_USER e DB_PASSWORD em backend/.env. DB_NAME deve ser pilldex_db; o setup cria esse banco fixo. Use uma conta de migração com permissão DDL e uma conta da aplicação com SELECT, INSERT, UPDATE e DELETE nas tabelas necessárias. Não publique credenciais. Caso .env já exista, preserve suas configurações.

    npm.cmd run db:setup
    npm.cmd test
    npm.cmd run test:integration
    npm.cmd start

O setup executa database/schema.sql e database/seed.sql. Usa CREATE IF NOT EXISTS e seed sem duplicação por nome; não apaga dados. Não migra tabelas preexistentes incompatíveis. Alternativa: abra os dois arquivos no MySQL Workbench e execute primeiro schema.sql, depois seed.sql.

Em outro terminal, a partir da raiz:

    cd frontend
    npm.cmd ci
    Copy-Item .env.example .env
    npm.cmd run web

Abra http://localhost:8081. Configure EXPO_PUBLIC_API_URL=http://127.0.0.1:3000/api no .env do frontend. Reinicie o Expo após alterar variáveis. Teste http://127.0.0.1:3000/api/health: servidor e banco devem estar online.

## Android e rede

Para aparelho físico, use EXPO_PUBLIC_API_URL=http://IP_LOCAL_DO_PC:3000/api, HOST=0.0.0.0 no backend e a mesma rede Wi-Fi. Autorize a porta 3000 no firewall apenas na rede privada apropriada. Localhost no aparelho aponta para o próprio aparelho. Emulador Android padrão pode usar 10.0.2.2. Execute npm.cmd run android ou leia o QR code com Expo Go compatível com SDK 58. CORS_ORIGINS aceita uma lista separada por vírgulas de origens Web exatas, incluindo porta. CORS não é autenticação.

## Funcionalidades

Nove telas: Início, Pesquisa, Resultados, Detalhes, Cadastro, Login, Perfil, Administração e Formulário de medicamento. Dados vêm da API/MySQL. Listagens atualizam ao receber foco. Pesquisa por nome/princípio ativo, detalhes por ID e CRUD administrativo com validação, mensagens, loading e confirmação de exclusão. Links HTTP/HTTPS abrem no navegador. Conteúdo clínico com fonte obrigatória; a validade editorial depende de revisão humana.

## API

GET /api/health; POST /api/auth/cadastro; POST /api/auth/login; GET /api/auth/me; GET /api/medicamentos; GET /api/medicamentos?busca=nome; GET /api/medicamentos/:id; POST /api/medicamentos; PUT /api/medicamentos/:id; DELETE /api/medicamentos/:id. Escritas exigem administrador. JSON de sucesso: {success:true,data:...}; erro: {success:false,error:{message,fields?}}. Health retorna 503 se o MySQL estiver indisponível. Veja docs/rotas-api.md.

## Limitações

Não há revogação de JWT, recuperação de senha ou refresh token. Expiração exige novo login. Armazenamento seguro e restauração no Android estão implementados, mas ainda dependem de teste em dispositivo. Os documentos da Entrega 2 preservam o histórico anterior.

Os registros de demonstração têm informações clínicas vazias e pendentes de validação. Não são bulas revisadas. Fonte oficial de referência: https://www.gov.br/anvisa/pt-br/sistemas/bulario-eletronico. Links de bula específica permanecem vazios; o portal geral não é apresentado como bula de um medicamento.

## Estrutura e validação

frontend/src contém screens, components, navigation, services e styles. backend/src contém config, controllers, models, routes e middlewares. database contém schema e seed; docs contém requisitos, modelagem, navegação, API e checklist de evidências.

npm.cmd test no backend executa testes HTTP com banco substituído exclusivamente nos testes. npm.cmd run test:integration usa servidor isolado e MySQL real, cria registros técnicos sem conteúdo clínico e os remove ao terminar. Execute em desenvolvimento. No frontend, npx.cmd expo install --check valida compatibilidade e npx.cmd expo export --platform web valida o bundle. Compilação não comprova execução no Android; veja docs/checklist-entrega-3.md.

## Versionamento

.gitignore exclui .env, node_modules, .expo, dist, caches, temporários e arquivos de chaves privadas. Repositório oficial: [lucasazevedxo/PillDex](https://github.com/lucasazevedxo/PillDex), remoto origin e branch principal main. Mantenha .env.example sem credenciais reais. Consulte [a auditoria da Entrega 2](docs/auditoria-entrega-2.md) para os resultados técnicos e pendências; ela registra o estado observado antes desta preparação de versionamento. O envio ao GitHub não altera os resultados dos testes nem resolve as pendências funcionais da auditoria.

## Teste de interface e qualidade de código

Na raiz, execute npm.cmd ci para instalar Playwright e Prettier. Com Expo Web na porta 8081 e MySQL disponível, npm.cmd run test:web inicia uma API isolada e usa Edge headless para testar catálogo, autenticação, perfil e CRUD administrativo, erro/retry, expiração e viewport móvel. Os registros técnicos são removidos ao terminar. Capturas ficam em artifacts/ (ignorado pelo Git). npm.cmd run format formata os arquivos.

No frontend, npm.cmd run lint executa ESLint; npm.cmd run typecheck executa o compilador em arquivos JavaScript com jsconfig.json, sem emissão e sem tipagem estática estrita (checkJs=false). O aplicativo permanece inteiramente em JavaScript. As versões são resolvidas pelo Expo e registradas nos lockfiles; veja a [referência do SDK 58](https://docs.expo.dev/versions/v58.0.0/). Os alertas conhecidos do npm audit e os testes executados estão em docs/checklist-entrega-2.md.

## CORS e desconexão Metro

Expo Web pode usar http://localhost:8081 ou http://localhost:8082 (também 127.0.0.1). As duas portas estão na configuração CORS local e no exemplo do backend. Para recuperar Metro com cache limpo: no frontend, npm.cmd run web:clear -- --port 8082; abra a URL exibida pelo terminal. A API continua na porta 3000. Veja docs/correcao-cors-metro.md para diagnóstico, reprodução e testes.

Diagnóstico de conexão: docs/correcao-conexao-api.md. Na raiz, node --test scripts/test-api-client.cjs valida os erros do Fetch, contratos HTTP e JSON.
