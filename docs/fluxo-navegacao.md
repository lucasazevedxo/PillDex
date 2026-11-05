# Telas e navegação

React Navigation Native Stack: Início → Pesquisa → Resultados → Detalhes. Início → Resultados (catálogo completo). Início → Administração → Detalhes do novo registro ou Resultados. Cabeçalho oferece retorno nativo. As listagens recarregam ao receber foco para refletir cadastros recentes.

Início: apresentação, aviso informativo, atalhos e até quatro registros reais. Pesquisa: nome/princípio ativo e opção de catálogo completo. Resultados: chamada API, contagem, cards, vazio, erro e nova tentativa. Detalhes: consulta por ID com seções e abertura de bula válida. Administração: campos do banco, validações, POST, confirmação e aviso explícito de ausência de autenticação.

Teste manual: iniciar API e Expo, abrir Início; pesquisar um nome inexistente e conferir vazio; pesquisar registro do banco; abrir detalhes e voltar; cadastrar registro técnico com fonte e conferir catálogo; desligar API e tentar novamente para verificar erro. Para testar URL use uma bula oficial específica previamente verificada. Não marcar Android como testado sem aparelho/emulador.
