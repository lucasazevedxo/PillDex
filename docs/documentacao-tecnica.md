# Atualização técnica — Entrega 3

Autenticação real com MySQL, bcrypt, JWT HS256, Bearer Token e autorização pelo nível atual no banco. Migração aditiva de usuarios.atualizado_em; provisionamento local sem senha fixa; CRUD completo com queries parametrizadas. Frontend centraliza sessão em AuthContext, usa SecureStore nativo e memória na Web. Login, cadastro, perfil e painel administrativo foram integrados à navegação existente. Detalhes, configuração, arquivos e limitações estão em [entrega-3.md](entrega-3.md), [rotas-api.md](rotas-api.md) e [checklist-entrega-3.md](checklist-entrega-3.md).

Os registros abaixo documentam a Entrega 2 e preservam a evolução histórica.

# Documentação técnica

PillDex, Entrega 2: aplicativo de consulta farmacêutica organizado em cliente mobile/Web, API REST e persistência MySQL. Problema, público, justificativa, objetivos e requisitos estão em requisitos-funcionais.md. Instalação, ambiente e execução estão no README.

Cliente: React Native/Expo, React Navigation Native Stack, JavaScript, StyleSheet, Fetch com timeout de 12 segundos. services/api.js centraliza URL e requisições; useMedicines recarrega com foco e ignora resultados de telas desmontadas. Componentes reutilizáveis: botão, campo, card, página, cabeçalho, loading, erro e vazio. Não existe catálogo local nem fallback com dados falsos.

Servidor: app.js permite injetar pool para testes; server.js abre porta e encerra conexões. Routes encaminham para controllers; validação normaliza entradas; models executam SQL com parâmetros. config/db.js utiliza mysql2/promise, limite de 10 conexões e timeout de conexão de 5 segundos. CORS por lista de origens; corpo JSON limitado. Erros não expõem SQL nem credenciais.

Banco: schema.sql cria medicamentos e usuarios; seed.sql é opcional e conservador. Não há migração destrutiva. db:setup executa scripts somente quando solicitado. Estrutura e relações futuras em modelagem-banco.md; contratos em rotas-api.md; telas em fluxo-navegacao.md.

Limitações: ausência de autenticação, autorização, edição, exclusão, paginação, auditoria editorial e validação automática de fontes. O cadastro é apenas demonstração local. JWT, hash, login, Bearer e restrição de escrita por admin são Entrega 3. Tabela usuarios ainda não é usada. URL sintaticamente válida não prova que a bula é oficial; revisão editorial é obrigatória antes de publicar conteúdo.

Resultados de testes devem ser consultados no checklist-entrega-2.md. Testes unitários/HTTP usam banco substituído apenas no ambiente de teste; teste integrado usa MySQL real. Não há afirmação de validação visual/Android sem execução correspondente.
