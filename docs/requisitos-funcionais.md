# Requisitos

## Melhorias atuais

- RF: Admin exclui mediante modal com nome/cancelamento; catálogo arquiva medicamentos referenciados preservando registros pessoais.
- RF: visitante pesquisa nome/princípio ativo e qualquer categoria selecionada; vê filtros ativos, limpeza, contagem e estado vazio. Categorias distinguem indicação/classe/organização.
- RF: Admin altera múltiplas categorias mediante evidência; sem comprovação mantém classificação pendente.
- RF: autenticado adiciona medicamentos à biblioteca, edita observações/datas/estado, consulta detalhes e remove apenas seus vínculos. Duplicatas acidentais são impedidas.
- RF: autenticado configura vários horários por medicamento via lembretes separados, dias da semana, início/fim e estado ativo; pode editar, excluir e consultar próximas ocorrências.
- RF: Android solicita permissões e agenda notificações discretas. Web mostra horários no app, sem garantia de segundo plano.
- RNF: JWT e isolamento por proprietário no backend; SQL parametrizado, FKs RESTRICT, migração aditiva e ausência de dados pessoais em logs.
- RNF: reconciliação local evita duplicidade e cancela agendamentos alterados/removidos; janela documentada de 30 dias/60 ocorrências, renovada ao abrir online. Sem inferência automática de horários ou tratamento.
- RNF: navegação Início/Pesquisa/Meus Medicamentos/Lembretes/Perfil; acesso administrativo preservado e convite ao login nas áreas pessoais.

Estados de validação e pendências de fontes/notificações Android em [melhorias-pilldex.md](melhorias-pilldex.md). Os requisitos abaixo preservam a proposta anterior.

Problema: bulas extensas e técnicas dificultam localizar informações importantes. Público: adultos, idosos, cuidadores e leitores com dificuldade de compreender conteúdo farmacêutico. Justificativa: uma consulta organizada reduz barreiras de acesso sem substituir orientação profissional.

Objetivo geral: facilitar o acesso e a compreensão das informações cadastradas. Objetivos específicos: pesquisar, organizar informações em seções legíveis, identificar fontes e abrir a bula oficial quando disponível.

RF01: listar medicamentos do MySQL no início e catálogo. RF02: pesquisar nome ou princípio ativo via API. RF03: consultar detalhes por ID. RF04: mostrar indicações, efeitos colaterais, contraindicações, precauções e fonte. RF05: abrir URL HTTP/HTTPS cadastrada. RF06: cadastrar via POST com nome obrigatório, limites de tamanho e fonte para conteúdo descritivo/clínico. RF07: apresentar carregamento, erro com nova tentativa, lista vazia e sucesso de cadastro. RF08: atualizar listagem ao retornar à tela.

Requisitos não funcionais: JavaScript, React Native, Expo Web/Android, React Navigation, Fetch, StyleSheet, Express e mysql2/promise; pool, queries parametrizadas, configuração por .env, erros sem credenciais, CORS restrito por origem, botões com papel acessível, fonte legível e conteúdo responsivo até 1050px. Leitor de tela e dispositivo Android exigem validação manual.

Entrega 3: autenticação real, cadastro/login, hash de senhas, JWT e autorização. Usuário: pesquisar, consultar e abrir bula. Admin: mesmas ações mais cadastrar, editar e excluir. Nesta entrega o POST é aberto em ambiente local; nenhum papel está implementado como segurança.
