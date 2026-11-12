# Fluxo atual — melhorias

Todas as páginas oferecem Início, Pesquisa, Meus Medicamentos, Lembretes e Perfil. O catálogo continua público. Nas áreas pessoais, visitante recebe convite para Entrar; cadastro/login mantidos. Usuários autenticados veem somente seus registros. React Navigation foi preservado.

Pesquisa → filtros de categoria (múltipla seleção com resultados atualizados) → Resultados → Detalhes. Texto e categorias combinam-se; limpar filtros restaura a busca.

Meus Medicamentos → Adicionar medicamento → pesquisar catálogo → adicionar. Cada card permite editar observações/datas/estado em modal, consultar detalhes inclusive de arquivados e remover com confirmação. Remoção pessoal preserva catálogo e remove seus lembretes.

Lembretes → Criar → selecionar medicamento pessoal → horário, dias, datas, ativo → Salvar. Cada registro permite edição em modal, ativação/desativação e exclusão confirmada. Próximos horários e situação da sincronização aparecem na tela. Ativar notificações solicita permissões no Android; Web apresenta a alternativa de consulta no app.

Administração → Cadastro/Edição com categorias e evidência. Excluir → modal visível com nome e Cancelar/Confirmar → exclusão física ou arquivamento → lista atualizada e mensagem do servidor. Acesso administrativo e telas anteriores permanecem. [Validação e limitações](melhorias-pilldex.md).

# Fluxo anterior — Entrega 3

Início → Pesquisa → Resultados → Detalhes continua público. Visitantes acessam Login ou Cadastro; após autenticar, Meu perfil mostra dados e Sair. Administradores acessam Administração → Formulário de medicamento (cadastro/edição preenchida); o painel permite excluir com confirmação e cancelamento. Sessão expirada redireciona para Login. Rotas administrativas são condicionais na navegação e protegidas também na API. Veja [Entrega 3](entrega-3.md). O conteúdo abaixo registra o fluxo histórico.

# Telas e navegação

React Navigation Native Stack: Início → Pesquisa → Resultados → Detalhes. Início → Resultados (catálogo completo). Início → Administração → Detalhes do novo registro ou Resultados. Cabeçalho oferece retorno nativo. As listagens recarregam ao receber foco para refletir cadastros recentes.

Início: apresentação, aviso informativo, atalhos e até quatro registros reais. Pesquisa: nome/princípio ativo e opção de catálogo completo. Resultados: chamada API, contagem, cards, vazio, erro e nova tentativa. Detalhes: consulta por ID com seções e abertura de bula válida. Administração: campos do banco, validações, POST, confirmação e aviso explícito de ausência de autenticação.

Teste manual: iniciar API e Expo, abrir Início; pesquisar um nome inexistente e conferir vazio; pesquisar registro do banco; abrir detalhes e voltar; cadastrar registro técnico com fonte e conferir catálogo; desligar API e tentar novamente para verificar erro. Para testar URL use uma bula oficial específica previamente verificada. Não marcar Android como testado sem aparelho/emulador.
