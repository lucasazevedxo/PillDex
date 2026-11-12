-- Executado por backend/scripts/migrate.js após adicionar as colunas ausentes.
CREATE TABLE IF NOT EXISTS categorias (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 nome VARCHAR(100) NOT NULL UNIQUE, descricao VARCHAR(255) NOT NULL,
 tipo ENUM('indicacao','classe','organizacao') NOT NULL, ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS medicamento_categorias (
 medicamento_id INT UNSIGNED NOT NULL, categoria_id INT UNSIGNED NOT NULL,
 PRIMARY KEY(medicamento_id,categoria_id), INDEX(categoria_id),
 FOREIGN KEY(medicamento_id) REFERENCES medicamentos(id) ON DELETE RESTRICT,
 FOREIGN KEY(categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS usuario_medicamentos (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, usuario_id INT UNSIGNED NOT NULL,
 medicamento_id INT UNSIGNED NOT NULL, observacoes TEXT,
 data_inicio DATE, data_fim DATE, ativo BOOLEAN NOT NULL DEFAULT TRUE,
 criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY usuario_medicamento(usuario_id,medicamento_id), INDEX(medicamento_id),
 FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
 FOREIGN KEY(medicamento_id) REFERENCES medicamentos(id) ON DELETE RESTRICT,
 CHECK(data_fim IS NULL OR data_inicio IS NULL OR data_fim >= data_inicio)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS lembretes (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, usuario_medicamento_id INT UNSIGNED NOT NULL,
 horario CHAR(5) NOT NULL, dias_semana JSON NOT NULL, data_inicio DATE NOT NULL,
 data_fim DATE, ativo BOOLEAN NOT NULL DEFAULT TRUE,
 criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX(usuario_medicamento_id),
 FOREIGN KEY(usuario_medicamento_id) REFERENCES usuario_medicamentos(id) ON DELETE RESTRICT,
 CHECK(data_fim IS NULL OR data_fim >= data_inicio)
) ENGINE=InnoDB;
INSERT IGNORE INTO categorias(nome,descricao,tipo) VALUES
 ('Dor de cabeça','Organização por indicação. Não recomenda tratamento.','indicacao'),
 ('Dor e febre','Organização por indicação. Não recomenda tratamento.','indicacao'),
 ('Antialérgicos','Classe farmacológica. Exige classificação verificada.','classe'),
 ('Anti-inflamatórios','Classe farmacológica. Exige classificação verificada.','classe'),
 ('Problemas digestivos','Organização por indicação. Não recomenda tratamento.','indicacao'),
 ('Náuseas e vômitos','Organização por indicação. Não recomenda tratamento.','indicacao'),
 ('Tosse e sintomas respiratórios','Organização por indicação. Não recomenda tratamento.','indicacao'),
 ('Antibióticos','Classe farmacológica. Exige classificação verificada.','classe'),
 ('Saúde cardiovascular','Organização por área terapêutica.','organizacao'),
 ('Outras categorias','Organização do catálogo.','organizacao');
