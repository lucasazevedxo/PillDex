# Requisitos

Problema: bulas extensas e técnicas dificultam localizar informações importantes. Público: adultos, idosos, cuidadores e leitores com dificuldade de compreender conteúdo farmacêutico. Justificativa: uma consulta organizada reduz barreiras de acesso sem substituir orientação profissional.

Objetivo geral: facilitar o acesso e a compreensão das informações cadastradas. Objetivos específicos: pesquisar, organizar informações em seções legíveis, identificar fontes e abrir a bula oficial quando disponível.

RF01: listar medicamentos do MySQL no início e catálogo. RF02: pesquisar nome ou princípio ativo via API. RF03: consultar detalhes por ID. RF04: mostrar indicações, efeitos colaterais, contraindicações, precauções e fonte. RF05: abrir URL HTTP/HTTPS cadastrada. RF06: cadastrar via POST com nome obrigatório, limites de tamanho e fonte para conteúdo descritivo/clínico. RF07: apresentar carregamento, erro com nova tentativa, lista vazia e sucesso de cadastro. RF08: atualizar listagem ao retornar à tela.

Requisitos não funcionais: JavaScript, React Native, Expo Web/Android, React Navigation, Fetch, StyleSheet, Express e mysql2/promise; pool, queries parametrizadas, configuração por .env, erros sem credenciais, CORS restrito por origem, botões com papel acessível, fonte legível e conteúdo responsivo até 1050px. Leitor de tela e dispositivo Android exigem validação manual.

Entrega 3: autenticação real, cadastro/login, hash de senhas, JWT e autorização. Usuário: pesquisar, consultar e abrir bula. Admin: mesmas ações mais cadastrar, editar e excluir. Nesta entrega o POST é aberto em ambiente local; nenhum papel está implementado como segurança.
