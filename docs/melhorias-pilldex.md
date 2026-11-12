# Melhorias PillDex

Validação local em 12/11/2026. Nenhum commit ou push realizado. Dados existentes preservados; registros técnicos criados pelos novos testes são removidos em `finally` por seus identificadores.

## Resultado por funcionalidade

| Funcionalidade                                        | Estado                                       | Evidência                                                                                          |
| ----------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Exclusão e arquivamento administrativos               | CONCLUÍDA E TESTADA                          | API/MySQL e Expo Web, incluindo cancelamento, 401/403, confirmação visível e atualização da lista  |
| Dez categorias e filtros combinados                   | CONCLUÍDA E TESTADA                          | MySQL, correspondência com qualquer categoria, ausência de duplicatas, edição administrativa e Web |
| Classificação clínica dos oito registros existentes   | PENDENTE                                     | Auditoria abaixo. Nenhuma atribuição sem evidência suficiente                                      |
| Biblioteca pessoal                                    | CONCLUÍDA E TESTADA                          | CRUD com MySQL, isolamento entre usuários, Web e consulta de medicamento arquivado                 |
| Lembretes e próximos horários                         | CONCLUÍDA E TESTADA                          | CRUD/validação/isolamento no MySQL e Web                                                           |
| Reconciliação local de notificações                   | IMPLEMENTADA, MAS NÃO TESTADA em dispositivo | Testes com adaptador simulado aprovados; entrega nativa não validada                               |
| Notificações Android, permissões e aplicativo fechado | IMPLEMENTADA, MAS NÃO TESTADA                | Bundle Android gerado; `adb devices -l` sem dispositivo                                            |
| Alternativa Web                                       | CONCLUÍDA E TESTADA                          | Horários exibidos no aplicativo, sem promessa de notificação em segundo plano                      |

## Falha de exclusão e correção

A versão inspecionada já tinha onPress, DELETE, envio Bearer, autenticação JWT, autorização pelo nível atual no MySQL e query parametrizada. Não foi encontrada ausência de token ou rota. A confirmação era um bloco inline antes da lista. Ao clicar em Excluir após rolar, esse bloco ficava fora do viewport: o clique apenas preenchia `pending`, e o DELETE dependia de outro botão invisível acima.

O defeito foi reproduzido temporariamente com o bloco inline e Playwright em 390 × 844: bounding box do botão de confirmação fora da área visível. O modal foi restaurado e o teste final valida que a confirmação está dentro da tela, Cancelar não altera o banco e confirmar remove o item da lista.

Agora o modal funciona com React Native em Web/Android, mostra o nome e explica a preservação das referências. Com referência em `usuario_medicamentos`, DELETE marca `arquivado=1`; sem referência, apaga associações de categoria e o medicamento na mesma transação. Bloqueio do medicamento com `FOR UPDATE` também serializa adição pessoal e exclusão. Todas as FKs usam RESTRICT. Não há cascata indiscriminada. A remoção pessoal apaga explicitamente apenas seus lembretes e o vínculo pessoal, sem apagar o catálogo.

Medicamentos arquivados não aparecem nas buscas nem no GET público por ID. Os detalhes continuam disponíveis ao proprietário pela biblioteca autenticada. PUT público administrativo não altera registros arquivados. Não há interface de desarquivamento nesta versão.

## Categorias e auditoria editorial

Categorias iniciais: Dor de cabeça; Dor e febre; Antialérgicos; Anti-inflamatórios; Problemas digestivos; Náuseas e vômitos; Tosse e sintomas respiratórios; Antibióticos; Saúde cardiovascular; Outras categorias. Cada uma indica se é indicação, classe ou organização. Não representam recomendação de tratamento.

Pesquisa combina `(nome OU princípio ativo) E (qualquer categoria selecionada)`. EXISTS evita duplicatas. IDs e textos são parametrizados, inclusive caracteres curingas literais. O seletor mostra quantidade de filtros, limpeza, contagem e atualização dos resultados ao selecionar categorias. O formulário Admin permite múltiplas categorias e exige evidência textual de até 2000 caracteres para classificações. A validação editorial humana continua necessária: um campo preenchido não prova a autenticidade da fonte.

Todos os oito registros reais foram lidos do MySQL antes das alterações:

| ID  | Medicamento / princípio ativo                                | Resultado da análise                                                                                                                                |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Paracetamol / paracetamol (acetaminofeno)                    | Fonte explicitamente marcada como conteúdo clínico pendente de validação; sem URL específica. Sem classificação                                     |
| 2   | Dipirona / dipirona monoidratada (metamizol)                 | Mesma pendência de validação; sem URL específica. Sem classificação                                                                                 |
| 3   | Ibuprofeno / ibuprofeno                                      | Mesma pendência de validação; sem URL específica. Sem classificação                                                                                 |
| 4   | Teste de integração PillDex 1793879380542 / marcador técnico | Registro técnico, sem indicação clínica. Sem classificação                                                                                          |
| 5   | Teste Web PillDex 1793879538654 / não informado              | Registro técnico, sem indicação clínica. Sem classificação                                                                                          |
| 6   | Teste Web PillDex 1793879641716 / não informado              | Registro técnico, sem indicação clínica. Sem classificação                                                                                          |
| 7   | Teste Web PillDex 1793879955276 / não informado              | Registro técnico, sem indicação clínica. Sem classificação                                                                                          |
| 8   | Postan / ácido mefenâmico                                    | Fonte genérica “Anvisa”, mas URL cadastrada aponta para bula de tadalafila em site de terceiros. Incompatibilidade exige revisão. Sem classificação |

Classificados clinicamente: **0**. Pendentes: **8**, preservados com `classificacao_status='pendente'`. As indicações foram examinadas, mas não bastam para superar as pendências das fontes. Não foram feitas pesquisas externas de conteúdo médico. Associações técnicas usadas em testes foram removidas junto aos registros de teste. Os quatro registros técnicos anteriores não foram apagados.

## Biblioteca e lembretes

Meus Medicamentos permite pesquisar o catálogo, adicionar, editar observações, datas e estado ativo, consultar detalhes e remover com confirmação. Restrição UNIQUE por usuário/medicamento impede adição acidental duplicada. Não há esquema que justifique duplicatas nesta versão.

Lembretes seleciona um vínculo pessoal, horário HH:MM, dias (0 domingo a 6 sábado), início obrigatório e fim opcional. Vários horários são representados por vários lembretes. Permite editar, ativar/desativar, excluir e exibir próximas ocorrências. Datas válidas entre 2000 e 2100 e limites inclusivos são verificados no backend. Registro pessoal inativo ou fora de suas datas não gera notificações.

O proprietário sempre vem do JWT validado, nunca de usuario_id no corpo. Consultas e mutações filtram o proprietário; IDs de outra pessoa retornam 404. Dados pessoais não são enviados a outros usuários nem registrados em logs da aplicação.

## Notificações e limitações

Instalado `expo-notifications ~58.1.9` usando `npx.cmd expo install expo-notifications`, compatível com SDK 58. Configurados plugin, permissão Android SCHEDULE_EXACT_ALARM e canal privado. O botão de ativação solicita permissão de notificações e de alarmes exatos. O agendamento usa DATE e `delivery: 'alarmClock'`, conforme a API instalada. A entrega não foi testada em aparelho.

Referência técnica: [Expo Notifications SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/). A documentação informa suporte a notificações locais no Expo Go, com limitações; configurações nativas do projeto devem ser verificadas em build de desenvolvimento Android. Alterar app.json exige reconstruir o aplicativo nativo.

Texto discreto: “Você tem um lembrete de medicamento no PillDex.” Sem nome, princípio ativo ou observação na notificação. Tocar abre o aplicativo pelo comportamento padrão do sistema; consulte a tela Lembretes para detalhes.

IDs são locais, obtidos da lista de agendamentos do sistema, e não são armazenados no MySQL. A reconciliação serializada utiliza identificador determinístico por usuário, lembrete e instante. Cancela agendamentos antigos, mantém os já corretos e agenda os ausentes, evitando duplicação. Executa ao restaurar/iniciar sessão, retornar ao primeiro plano, a cada minuto enquanto o JS está ativo e após mutações pessoais. Logout cancela os agendamentos deste aplicativo.

Janela explícita: próximas **60 ocorrências em até 30 dias**, para respeitar limites locais. É necessário reabrir o aplicativo com conexão para renovar. Não há serviço de sincronização em background: alterações feitas em outro dispositivo podem manter agendamentos antigos até a reconciliação local. Falhas de sincronização são informadas na tela.

Horários seguem o fuso atual do dispositivo. Datas são construídas por calendário local, sem somar intervalos fixos de 24 horas; horários inexistentes na transição de verão são ignorados. Mudança de fuso é reconciliada ao retomar ou durante o uso. Se o fuso mudar com o app fechado, não há garantia de ajuste antes da reabertura. O aplicativo avisa sobre permissões, bateria e restrições do sistema. Não há garantia de entrega com app fechado, reinício ou parada forçada.

Web usa um módulo separado: não importa o módulo nativo e somente exibe horários. Não implementa push de navegador nem notificações locais em segundo plano.

## Banco, rotas e telas

`npm.cmd run db:migrate` em backend verifica colunas via information_schema, acrescenta arquivado/classificacao_status/classificacao_evidencia e executa `database/migration-melhorias.sql`. Cria categorias, medicamento_categorias, usuario_medicamentos e lembretes, com índices, FKs, datas e timestamps. Execução repetida não apaga dados. MySQL DDL tem commit implícito; não se promete rollback global de migração. O runner pode ser executado novamente para concluir etapas já aplicadas.

Novas rotas públicas: GET /api/categorias; filtro categorias em GET /api/medicamentos. Novas rotas autenticadas: GET/POST /api/meus-medicamentos; GET/PUT/DELETE /api/meus-medicamentos/:id; GET/POST /api/lembretes; PUT/DELETE /api/lembretes/:id. Contratos completos em rotas-api.md.

Novas telas: LibraryScreen e RemindersScreen. Alteradas: Home, Search, Results, Admin, AdminList e Details, além de navegação e componentes compartilhados. Menu Início, Pesquisa, Meus Medicamentos, Lembretes e Perfil em todas as páginas; área administrativa preservada. Visitantes recebem convite ao login nas áreas pessoais. React Navigation mantido por solicitação expressa do usuário.

## Testes executados

- `npm.cmd test`: 11 testes HTTP de regressão aprovados.
- `npm.cmd run test:integration` em backend: cadastro, bcrypt, login, JWT, permissões, CRUD e MySQL real aprovados.
- `node backend/scripts/verify-melhorias.js`: 47 verificações HTTP com MySQL real aprovadas, com asserções adicionais de persistência, isolamento, arquivamento e integridade.
- `node --test scripts/test-reminders.cjs`: 3 testes aprovados de calendário, horário de verão e reconciliação com adaptador simulado. Não simulam entrega real Android.
- `node --test scripts/test-api-client.cjs`: 6 testes de regressão do cliente HTTP aprovados.
- `npm.cmd run test:web`: regressão Web aprovada em Edge headless e viewport móvel.
- `node scripts/test-web-melhorias.cjs`: fluxo integrado Web/MySQL aprovado em 390px, sem erros JS, incluindo filtros/categorias, observações, lembretes, cancelamento, arquivamento e remoção pessoal.
- `npm.cmd run lint` e `npm.cmd run typecheck` em frontend: aprovados. Typecheck usa checkJs=false, sem validação estática estrita de todas as propriedades.
- `npx.cmd expo export --platform android`: bundle gerado. Não equivale a execução nativa.
- `npx.cmd expo export --platform all`: bundles finais Web, Android e iOS gerados. Não equivalem a execução nativa.
- `adb devices -l`: nenhum dispositivo conectado. Teste real de notificações PENDENTE.

## Execução

Preserve .env. Após instalar dependências com `npm.cmd ci` nas três pastas:

```powershell
cd backend
npm.cmd run db:migrate
npm.cmd start
```

Em outro terminal:

```powershell
cd frontend
npm.cmd run web
```

Backend e Expo já abertos antes das alterações devem ser reiniciados para carregar a nova API/configuração. Para Android, configure EXPO_PUBLIC_API_URL com IP alcançável pelo aparelho; gere uma build de desenvolvimento com as permissões/plugins atuais e valide notificações, cancelamento, permissões, bateria, reinício, fuso e sessão restaurada no dispositivo.
