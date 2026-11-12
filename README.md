# PillDex — Uma Enciclopédia Farmacêutica

## Melhorias atuais — categorias, biblioteca e lembretes

O catálogo agora tem filtros por múltiplas categorias, Meus Medicamentos e Lembretes de Medicamentos. A confirmação administrativa usa modal; medicamentos com referências pessoais são arquivados. Consulte [o relatório das melhorias](docs/melhorias-pilldex.md) para validação, auditoria dos oito medicamentos, novas rotas e limitações.

Execute `npm.cmd ci` na raiz, backend e frontend; preserve os `.env`. Em backend: `npm.cmd run db:migrate` e `npm.cmd start`. Empreservando outro terminal, frontend: `npm.cmd run web`. Reinicie serviços antigos após atualizar. A migração acrescenta colunas e quatro tabelas,  os registros existentes. Instalação nova via db:setup já chama a migração.

Validações novas: `npm.cmd run test:melhorias` em backend; `npm.cmd run test:lembretes` e `npm.cmd run test:melhorias:web` na raiz (este último exige Expo Web em 8081 e MySQL). Lint/typecheck ficam no frontend.

Notificações locais Android usam expo-notifications do SDK 58 e permissões de notificações/alarmes exatos. Janela de 30 dias, até 60 ocorrências; reabra o app com conexão para renovar. A entrega em dispositivo está **IMPLEMENTADA, MAS NÃO TESTADA**. No navegador, consulte os horários no aplicativo, sem notificações em segundo plano. Classificação clínica: zero atribuições e oito pendências de revisão de fontes.

As seções de Entrega 3 abaixo preservam o contexto anterior; o relatório de melhorias descreve o estado mais recente.

Aplicativo de consulta informativa para adultos, idosos e cuidadores. Entrega 3: React Native + Expo + React Navigation → Fetch → Express → MySQL, com cadastro, bcrypt, JWT, níveis de acesso e CRUD protegido. Não realiza diagnóstico, prescrição ou recomendação de tratamento.

## Entrega 3 — execução e autenticação

Preserve os arquivos `.env` existentes. Instale as dependências com `npm.cmd ci` na raiz, em `backend` e em `frontend`. No backend, execute `npm.cmd run db:migrate` após configurar o MySQL (ou `db:setup` para instalação nova). A migração atual inclui as tabelas e colunas das melhorias, sem apagar registros.

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

## Proposta original do projeto

O texto abaixo preserva a proposta registrada anteriormente no GitHub. As instruções de execução e o estado atual da Entrega 3 estão nas seções acima.

1. Identificação do projeto Nome da aplicação: PillDex – Uma enciclopédia farmacêutica. Tema: Acesso simplificado às informações sobre medicamentos. Tipo de aplicação: Aplicativo mobile. Tecnologias previstas: React Native, Expo, React Navigation, Node.js, Express e MySQL. Descrição geral: O PillDex é uma aplicação mobile que tem como objetivo facilitar o acesso e a compreensão das informações sobre medicamentos. A aplicação permitirá que os usuários pesquisem medicamentos e consultem resumos de suas bulas, organizados em categorias como indicações, efeitos colaterais, contraindicações e precauções. A proposta é apresentar informações confiáveis em uma linguagem simples e acessível, mantendo a possibilidade de consultar as bulas completas. O aplicativo terá como foco a educação e a informação, sem substituir orientações médicas ou farmacêuticas.
2. Problema identificado Problema principal: A dificuldade de acesso, compreensão e interpretação das informações presentes nas bulas dos medicamentos. Contextualização: As bulas dos medicamentos apresentam informações importantes para a utilização consciente desses produtos. Entretanto, sua extensão e a presença de termos técnicos podem dificultar a compreensão por parte de pessoas que não possuem conhecimentos específicos na área da saúde. Além disso, encontrar rapidamente informações específicas, como possíveis efeitos colaterais, contraindicações e precauções, pode ser uma tarefa difícil para alguns usuários. Essa dificuldade pode contribuir para interpretações incorretas e para o desconhecimento de cuidados importantes relacionados aos medicamentos.
   Público afetado: O público-alvo é composto por pessoas que utilizam medicamentos e apresentam dificuldades para compreender as informações das bulas, incluindo adultos, idosos, cuidadores e pessoas com pouca familiaridade com termos médicos. Pergunta norteadora: Como uma aplicação mobile pode facilitar o acesso e a compreensão das informações sobre medicamentos, tornando as bulas mais acessíveis ao público? 3. Justificativa O desenvolvimento do PillDex justifica-se pela necessidade de tornar as informações sobre medicamentos mais acessíveis e compreensíveis para a população. Embora as bulas contenham informações importantes, a linguagem técnica e a quantidade de conteúdo podem dificultar a localização e a compreensão de orientações específicas. Diante desse cenário, a aplicação propõe organizar as informações em categorias e apresentá-las de maneira resumida, facilitando a consulta pelos usuários. Além de contribuir para a compreensão das informações, o projeto busca incentivar a consulta às fontes oficiais e promover o uso consciente de medicamentos. A escolha de uma aplicação mobile permite disponibilizar essas informações de maneira prática, por meio de uma interface simples e intuitiva. 4. Objetivos 4.1 Objetivo geral Desenvolver uma aplicação mobile que facilite o acesso e a compreensão das informações sobre medicamentos por meio de resumos organizados, confiáveis e apresentados em linguagem acessível. 4.2 Objetivos específicos

- Identificar as principais dificuldades relacionadas à compreensão das bulas.
- Organizar as informações dos medicamentos em categorias.
- Desenvolver uma ferramenta de pesquisa de medicamentos.
- Disponibilizar resumos das informações presentes nas bulas oficiais.
- Facilitar o acesso às informações sobre contraindicações, efeitos colaterais e precauções.
- Desenvolver uma interface simples e intuitiva.
- Implementar progressivamente um sistema de cadastro, autenticação e controle de permissões.
- Manter as informações organizadas e atualizadas conforme as fontes utilizadas.

5. Proposta de solução A solução proposta consiste no desenvolvimento do PillDex, um aplicativo mobile que permitirá aos usuários pesquisar medicamentos e consultar suas principais informações de maneira simplificada. Ao selecionar um medicamento, o usuário poderá visualizar um resumo organizado em categorias, facilitando a localização das informações desejadas. A aplicação também deverá disponibilizar a identificação da fonte das informações e, quando disponível, o acesso à bula oficial completa. O desenvolvimento será realizado de forma incremental. Na primeira etapa, será criada a estrutura visual e navegável do aplicativo. Nas etapas seguintes, serão implementados o banco de dados, a API, as operações de cadastro e consulta, a autenticação JWT e os níveis de acesso. O aplicativo terá caráter informativo e não substituirá o acompanhamento de profissionais de saúde.
6. Tipos de usuário Admin: Pesquisar medicamentos e cadastrar, editar ou excluir os registros do catálogo. Usuário: Pesquisar medicamentos e consultar suas informações.
7. Telas previstas 8. Fluxo de navegação inicial Início  Pesquisa  Lista de resultados  Detalhes do medicamento  Bula completa
