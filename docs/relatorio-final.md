# Relatório atual

A evolução, evidências, auditoria dos cinco indicadores e pendências da Entrega 3 estão em [entrega-3.md](entrega-3.md) e [checklist-entrega-3.md](checklist-entrega-3.md). O relatório abaixo preserva a Entrega 2 como histórico.

# Relatório final — Entrega 2

## Arquivos e funcionalidades entregues

- frontend/: aplicativo Expo SDK 58, JavaScript, React Navigation e StyleSheet. Cinco telas: Início, Pesquisa, Resultados, Detalhes e Administração. Componentes reutilizáveis, API central com Fetch e timeout, atualização por foco, estados de loading/vazio/erro e cadastro com validação.
- backend/: Express com rotas, controllers, models, middlewares e pool MySQL. Configuração .env, CORS por origem, SQL parametrizado, respostas JSON e erros sem credenciais. Scripts para preparar o banco e testar integração real.
- database/: schema.sql cria pilldex_db com medicamentos e usuarios; seed.sql insere três registros de demonstração sem alegações clínicas, não duplica nomes existentes e não apaga dados.
- docs/: documentação técnica, requisitos, banco, rotas, navegação, checklist e este relatório.
- scripts/test-web.cjs: teste real no Edge, com capturas locais em artifacts/. README, .gitignore, arquivos de exemplo .env, manifests e lockfiles para instalação reproduzível.

## Rotas

GET /api/health; GET /api/medicamentos; GET /api/medicamentos?busca=termo; GET /api/medicamentos/:id; POST /api/medicamentos. Não há PUT/DELETE nem autenticação na Entrega 2.

## Resultados observados

Nove testes HTTP aprovados; integração MySQL aprovada com GET/POST, consulta por ID, pesquisa por nome/princípio e persistência SQL; teste Web aprovado nas cinco telas com cadastro real, validação, lista vazia, erro/retry e viewport 390px. Expo iniciado e bundle Web exportado. Compatibilidade das dependências, lint e checagem de compilação JavaScript aprovados. Capturas desktop e móvel revisadas. Checagem JavaScript usa checkJs=false; não comprova tipagem estática estrita.

Problemas corrigidos: codificação dos acentos no pipe do PowerShell e nos três primeiros registros de demonstração; caminho de .env dependente da pasta atual; carregamento dos detalhes com atualização síncrona em effect; dependência de recarga do hook de listagem. npm.ps1 bloqueado foi contornado usando npm.cmd; Docker desligado não impediu uso do MySQL80 local.

## Executar novamente

Em backend/: npm.cmd ci, configurar .env conforme .env.example, npm.cmd run db:setup e npm.cmd start. O script cria o banco fixo pilldex_db; requer MySQL 8 e usuário com permissão adequada. Credenciais do ambiente atual já estão em arquivo local ignorado pelo Git.

Em outro terminal, frontend/: npm.cmd ci, configurar EXPO_PUBLIC_API_URL=http://localhost:3000/api e npm.cmd run web. Abrir http://localhost:8081. Backend local: http://127.0.0.1:3000/api/health. Instruções para IP local/Android e firewall no README.

## Pendências e limites

Android físico/emulador e abertura de URL de bula específica não foram testados. Conteúdo clínico individual depende de revisão oficial e continua vazio. Testes persistiram registros técnicos explicitamente identificados no banco; não foi executada exclusão. Usuários e permissões reais, JWT, hash, login, PUT/DELETE são Entrega 3. Não publicar backend enquanto POST estiver sem proteção.

npm audit do frontend apresentou 12 avisos moderados transitivos após instalação das ferramentas Expo/ESLint; não houve aplicação de downgrade forçado incompatível. Backend e ferramentas raiz não apresentaram vulnerabilidades na instalação. Git local foi iniciado; nenhum remoto nem push foi configurado/executado. Checklist com os quatro indicadores e evidências: checklist-entrega-2.md.
