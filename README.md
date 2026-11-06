# PillDex — Uma Enciclopédia Farmacêutica

Aplicativo de consulta informativa para adultos, idosos e cuidadores. Entrega 2 do curso técnico de desenvolvimento de sistemas. React Native + Expo + React Navigation → Fetch → Express → MySQL. Não realiza diagnóstico, prescrição ou recomendação de tratamento.

## Instalação no Windows

Requer Node.js 22.13+ e MySQL 8.0. Execute no PowerShell, na raiz do repositório:

    cd backend
    npm.cmd ci
    Copy-Item .env.example .env

Preencha DB_HOST, DB_PORT, DB_USER e DB_PASSWORD em backend/.env. DB_NAME deve ser pilldex_db; o script fornecido cria esse banco fixo. Use um usuário com permissão para criar o banco e tabelas; depois prefira usuário específico com SELECT e INSERT. Não publique credenciais. Caso .env já exista, preserve suas configurações.

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

Cinco telas: Início, Pesquisa, Resultados, Detalhes e Administração. Dados vêm exclusivamente da API/MySQL. Listagem atualiza ao receber foco. Pesquisa por nome/princípio ativo; detalhes por ID; cadastro com validação, mensagens de sucesso/erro, loading e estados vazios. Links HTTP/HTTPS cadastrados abrem no navegador. Conteúdo clínico com fonte obrigatória; a validade editorial da fonte depende de revisão humana.

## API

GET /api/health; GET /api/medicamentos; GET /api/medicamentos?busca=nome; GET /api/medicamentos/:id; POST /api/medicamentos. JSON de sucesso: {success:true,data:...}; erro: {success:false,error:{message,fields?}}. Health usa data.server e data.database e retorna 503 se o MySQL estiver indisponível. Veja docs/rotas-api.md.

## Limites desta entrega

Cadastro e API POST não possuem autenticação. Não disponibilize o backend publicamente. Não há login simulado. JWT, hash de senha, Bearer Token, autorização admin/usuario, PUT e DELETE ficam para a Entrega 3. A tabela usuarios está modelada e não recebe dados nesta etapa.

Os registros de demonstração têm informações clínicas vazias e pendentes de validação. Não são bulas revisadas. Fonte oficial de referência: https://www.gov.br/anvisa/pt-br/sistemas/bulario-eletronico. Links de bula específica permanecem vazios; o portal geral não é apresentado como bula de um medicamento.

## Estrutura e validação

frontend/src contém screens, components, navigation, services e styles. backend/src contém config, controllers, models, routes e middlewares. database contém schema e seed; docs contém requisitos, modelagem, navegação, API e checklist de evidências.

npm.cmd test no backend executa testes HTTP com banco substituído exclusivamente nos testes. npm.cmd run test:integration usa MySQL real e deixa um registro técnico identificado no catálogo, sem conteúdo clínico. Execute esse teste apenas em ambiente de desenvolvimento. No frontend, npx.cmd expo install --check valida compatibilidade e npx.cmd expo export --platform web valida o bundle. Compilação não comprova navegação visual nem execução no Android; veja docs/checklist-entrega-2.md para resultados efetivamente observados.

## Versionamento

.gitignore exclui .env, node_modules, .expo e dist. Faça commits de marcos reais e configure seu remoto GitHub. Nenhum push é automático. Não versionar credenciais.

## Teste de interface e qualidade de código

Na raiz, execute npm.cmd ci para instalar Playwright e Prettier. Com API e Expo Web em execução, npm.cmd run test:web usa o Edge instalado em modo headless para testar as cinco telas, POST real, erro/retry e viewport móvel. As capturas ficam em artifacts/ (ignorado pelo Git). Cada execução cria um registro técnico identificado no banco. npm.cmd run format formata os arquivos.

No frontend, npm.cmd run lint executa ESLint; npm.cmd run typecheck executa o compilador em arquivos JavaScript com jsconfig.json, sem emissão e sem tipagem estática estrita (checkJs=false). O aplicativo permanece inteiramente em JavaScript. As versões são resolvidas pelo Expo e registradas nos lockfiles; veja a [referência do SDK 58](https://docs.expo.dev/versions/v58.0.0/). Os alertas conhecidos do npm audit e os testes executados estão em docs/checklist-entrega-2.md.

## CORS e desconexão Metro

Expo Web pode usar http://localhost:8081 ou http://localhost:8082 (também 127.0.0.1). As duas portas estão na configuração CORS local e no exemplo do backend. Para recuperar Metro com cache limpo: no frontend, npm.cmd run web:clear -- --port 8082; abra a URL exibida pelo terminal. A API continua na porta 3000. Veja docs/correcao-cors-metro.md para diagnóstico, reprodução e testes.

Diagnóstico de conexão: docs/correcao-conexao-api.md. Na raiz, node --test scripts/test-api-client.cjs valida os erros do Fetch, contratos HTTP e JSON.
