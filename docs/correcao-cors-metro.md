# Correção de CORS e diagnóstico do Metro — 05/11/2026

## Causa reproduzida

Antes da correção, OPTIONS /api/medicamentos?busca= com Origin http://localhost:8081 retornava 204 com Access-Control-Allow-Origin; a mesma requisição com Origin http://localhost:8082 retornava 403 sem esse cabeçalho. backend/.env e o fallback de app.js listavam apenas a porta 8081. A URL EXPO_PUBLIC_API_URL=http://localhost:3000/api já estava correta. MySQL respondeu online em /api/health. cors@2.8.6 estava instalado no backend; nenhuma reinstalação necessária. As alterações pré-existentes de package.json/package-lock do backend foram preservadas.

## Correção implementada

backend/src/app.js, backend/.env e backend/.env.example agora aceitam localhost e 127.0.0.1 nas portas 8081 e 8082. CORS global permanece antes de express.json, health e rotas. Métodos GET/POST/OPTIONS, cabeçalho Content-Type e status 204 de OPTIONS estão explícitos. O próprio app.use(cors(...)) encerra o preflight, sem consultar o banco e sem rota curinga incompatível com Express 5. Origens externas continuam rejeitadas. Referência: https://expressjs.com/en/resources/middleware/cors/.

frontend/src/services/api.js passou a enviar Content-Type: application/json apenas quando há corpo de requisição. GET simples evita preflight desnecessário; POST mantém JSON e continua protegido pelo contrato de preflight. A correção da lista de origens funciona também para clientes que ainda enviem Content-Type no GET.

## Metro é uma conexão separada

Na inspeção inicial existia Metro na porta 8081 e nenhum processo escutando em 8082. Uma aba antiga apontando para 8082 é uma explicação compatível com a desconexão 1006, mas o evento original não foi capturado e não comprova causa única. O erro CORS observado ocorre na API 3000; o WebSocket de atualização do Expo usa a porta do Metro. Alterar CORS da API não restaura um processo Metro ausente.

A API foi reiniciada para carregar o .env atualizado. Expo foi iniciado em 8082 com cache limpo. Ambas as portas responderam /status com packager-status:running. Uma primeira tentativa de navegador excedeu 30 segundos; os logs do Metro 8081 mostraram compilação de aproximadamente 102 segundos durante a reconstrução de cache. O teste foi ajustado para aguardar compilação inicial. Não foram apagadas dependências ou alteradas configurações globais.

## Reproduzir

Em backend/: npm.cmd start. Em frontend/: npm.cmd run web:clear -- --port 8082. Abra http://localhost:8082. Evite iniciar vários processos Expo para uso normal; use a mesma porta mostrada no terminal. Se já existe um processo funcional na porta, abra a URL dele ou encerre esse processo antes de reiniciar. Depois de reiniciar, recarregue a aba antiga. Trocar CORS_ORIGINS exige reiniciar a API; alterar EXPO_PUBLIC_API_URL exige reiniciar Expo.

Na raiz: node scripts/test-cors-metro.cjs, com API 3000 e Expo nas duas portas em execução para esse teste específico. O script verifica MySQL online, GET/listagem/pesquisa real, preflight GET/POST, pesquisa no Edge e handshake WebSocket 101 ainda aberto em cada porta. Não insere ou exclui registros. No backend: npm.cmd test (11 testes). No frontend: npm.cmd run lint e npm.cmd run typecheck (checagem JS sem tipagem estrita).

Referência para limpeza de cache: https://docs.expo.dev/troubleshooting/clear-cache-windows/. Cache limpo é ferramenta de recuperação, não prova da causa do evento 1006. Problemas exclusivos da aba/extensões/firewall do usuário exigem nova captura se persistirem; não foram reproduzidos fora do cenário local testado.

## Resultados finais observados

- PASS: 11 testes HTTP, incluindo GET/OPTIONS nas quatro origens locais e OPTIONS sem acesso ao banco.
- PASS: API real /health com banco online, GET /medicamentos e pesquisa por Paracetamol; preflight GET/POST em localhost:8081 e localhost:8082 retorna 204 com a origem correta.
- PASS: pesquisa pela interface no Edge nas portas 8081 e 8082 com dados do MySQL; sem erros JavaScript/CORS nem mensagem de desconexão durante a janela observada.
- PASS: WebSockets /hot e /message em cada porta retornaram handshake 101 e permaneceram abertos até o fim da observação.
- PASS: lint e typecheck no frontend; git diff --check.
- Nenhum registro inserido ou excluído nesta correção. Nenhuma credencial exposta nos logs de diagnóstico.
- Manual somente se persistir na aba original: recarregar http://localhost:8082 e fornecer novo log/WebSocket se o 1006 reaparecer. Não foi capturado o evento histórico; não se afirma uma causa única para ele.
