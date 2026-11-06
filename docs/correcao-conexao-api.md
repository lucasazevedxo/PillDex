# Diagnóstico da conexão API — 05/11/2026

## Estado observado

Backend e MySQL estavam em execução. GET http://localhost:3000/api/health e a variante 127.0.0.1 retornaram 200 com servidor/banco online. Pesquisa por Paracetamol retornou 200 e um registro. Requisição para [::1]:3000 falhou com ECONNREFUSED, pois HOST=127.0.0.1 limita a API ao IPv4. A URL anterior localhost funcionou neste ambiente de teste; não se afirma que IPv6 foi a causa comprovada da mensagem histórica do usuário. A mensagem original não se reproduziu no navegador automatizado nas duas portas.

## Correções

- frontend/.env e .env.example usam http://127.0.0.1:3000/api, endereço exato em que a API escuta, evitando dependência da resolução IPv4/IPv6 de localhost no Expo Web local. Em Android físico continua necessário IP local do PC e HOST apropriado, conforme README.
- services/api.js normaliza espaços/barra final, valida configuração HTTP/HTTPS sem credenciais e distingue falha de transporte, timeout, resposta inválida/HTML e erro HTTP da API. Erros de validação preservam status e fields. Erro do banco 503 não é apresentado como falha de rede. GET continua sem Content-Type desnecessário e POST mantém JSON.
- server.js passa a tratar erro de inicialização com diagnóstico de porta ocupada e encerramento do pool. Porta configurada é 3000; carregar .env continua independente da pasta atual por caminho relativo ao módulo db.js.
- CORS existente foi preservado: localhost/127.0.0.1 nas portas 8081/8082, OPTIONS antes de JSON/rotas. Nenhum dado local substitui o MySQL.
- API e Expo 8082 foram reiniciados para aplicar código e variável pública. Arquivos de credenciais não foram exibidos nem versionados.

## Testes

PASS: 11 testes HTTP da API. PASS: seis testes do cliente Fetch em scripts/test-api-client.cjs, cobrindo GET, POST, HTTP 400 com fields, HTTP 503, JSON inválido/nulo, rede e timeout simulado. Timeout foi testado pela rejeição AbortError, sem esperar 12 segundos reais. PASS: lint e checagem JS sem tipagem estrita.

Antes da mudança de URL, o teste real scripts/test-cors-metro.cjs passou em 8081/8082: MySQL, listagem, pesquisa, OPTIONS GET/POST e WebSockets Metro 101. Após reiniciar Expo 8082, o mesmo teste registra as URLs reais requisitadas pelo navegador para conferir o endereço compilado no bundle.

Nenhum cadastro/exclusão ou modificação no schema foi necessário. Não há ação manual de banco pendente. Se uma aba já aberta mantiver erro antigo, recarregue http://localhost:8082. Se o servidor for encerrado, iniciar backend com npm.cmd start e frontend com npm.cmd run web -- --port 8082, em terminais separados. Testes locais não comprovam acesso em outro computador, aparelho físico, firewall externo ou situação histórica da aba original.

Resultado final após reinício: PASS nas duas portas. Em 8082, o navegador requisitou http://127.0.0.1:3000/api/medicamentos?busca= e ?busca=Paracetamol, ambos HTTP 200, sem erros JavaScript/CORS. WebSockets Metro /hot e /message permaneceram abertos com handshake 101. Em 8081, o processo anterior continuou usando localhost e também passou; para carregar a nova variável nessa instância, reinicie o Expo 8081 quando for utilizá-lo. A instância recomendada e já atualizada nesta sessão é http://localhost:8082.
