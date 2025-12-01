-- =====================================================
-- INSERÇÃO DE DADOS REAIS EXTRAÍDOS DA PLANILHA
-- Sistema de Monitoramento de Indicadores de Saúde Municipal
-- Data: 2025-12-01 11:18:23
-- =====================================================

-- Limpar dados existentes (se necessário)
-- DELETE FROM alertas;
-- DELETE FROM valores_indicador;
-- DELETE FROM indicadores;
-- DELETE FROM categorias_indicador;

-- Inserir categorias de indicadores
INSERT INTO categorias_indicador (id, nome, descricao, ativo) VALUES
(1, 'Epidemiológico', 'Indicadores de vigilância epidemiológica', true),
(2, 'Produção', 'Indicadores de produção de serviços', true),
(3, 'Financeiro', 'Indicadores financeiros e orçamentários', true),
(4, 'Recursos Humanos', 'Indicadores de gestão de pessoas', true),
(5, 'Metas PAS', 'Metas do Plano Anual de Saúde', true)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao;

-- Inserir indicadores reais
INSERT INTO indicadores (id, nome, descricao, categoria_id, unidade_medida, meta_anual, fonte_dados, observacoes, ativo) VALUES
(1, 'Cobertura da Estratégia Saúde da Família', 'Percentual de cobertura populacional pela ESF', 1, '%', 95.0, 'e-Gestor AB', 'Extraído da aba: Atenção a Saúde', true)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    meta_anual = EXCLUDED.meta_anual,
    fonte_dados = EXCLUDED.fonte_dados;

INSERT INTO indicadores (id, nome, descricao, categoria_id, unidade_medida, meta_anual, fonte_dados, observacoes, ativo) VALUES
(2, 'Cobertura Vacinal Infantil', 'Percentual de crianças vacinadas conforme calendário', 1, '%', 95.0, 'SIPNI', 'Extraído da aba: Vigilância em Saúde', true)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    meta_anual = EXCLUDED.meta_anual,
    fonte_dados = EXCLUDED.fonte_dados;

INSERT INTO indicadores (id, nome, descricao, categoria_id, unidade_medida, meta_anual, fonte_dados, observacoes, ativo) VALUES
(3, 'Taxa de Mortalidade Infantil', 'Óbitos infantis por 1000 nascidos vivos', 1, '‰', 10.0, 'SIM/SINASC', 'Extraído da aba: Vigilância em Saúde', true)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    meta_anual = EXCLUDED.meta_anual,
    fonte_dados = EXCLUDED.fonte_dados;

INSERT INTO indicadores (id, nome, descricao, categoria_id, unidade_medida, meta_anual, fonte_dados, observacoes, ativo) VALUES
(4, 'Consultas Pré-natal', 'Número de consultas de pré-natal realizadas', 2, 'unidade', 2500.0, 'SISAB', 'Extraído da aba: Atenção a Saúde', true)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    meta_anual = EXCLUDED.meta_anual,
    fonte_dados = EXCLUDED.fonte_dados;

INSERT INTO indicadores (id, nome, descricao, categoria_id, unidade_medida, meta_anual, fonte_dados, observacoes, ativo) VALUES
(5, 'Exames Preventivos Realizados', 'Número de exames preventivos do câncer de colo uterino', 2, 'unidade', 1800.0, 'SISAB', 'Extraído da aba: Atenção a Saúde', true)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    meta_anual = EXCLUDED.meta_anual,
    fonte_dados = EXCLUDED.fonte_dados;

INSERT INTO indicadores (id, nome, descricao, categoria_id, unidade_medida, meta_anual, fonte_dados, observacoes, ativo) VALUES
(6, 'Execução Orçamentária da Saúde', 'Percentual de execução do orçamento da saúde', 3, '%', 95.0, 'SIOPS', 'Extraído da aba: Gestão', true)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    meta_anual = EXCLUDED.meta_anual,
    fonte_dados = EXCLUDED.fonte_dados;

INSERT INTO indicadores (id, nome, descricao, categoria_id, unidade_medida, meta_anual, fonte_dados, observacoes, ativo) VALUES
(7, 'Profissionais Capacitados', 'Número de profissionais que receberam capacitação', 4, 'unidade', 150.0, 'Sistema RH', 'Extraído da aba: Gestão', true)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    meta_anual = EXCLUDED.meta_anual,
    fonte_dados = EXCLUDED.fonte_dados;

INSERT INTO indicadores (id, nome, descricao, categoria_id, unidade_medida, meta_anual, fonte_dados, observacoes, ativo) VALUES
(8, 'Atendimentos de Urgência', 'Número de atendimentos de urgência realizados', 2, 'unidade', 3200.0, 'SISAB', 'Extraído da aba: Atenção a Saúde', true)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    meta_anual = EXCLUDED.meta_anual,
    fonte_dados = EXCLUDED.fonte_dados;

-- Inserir valores atuais dos indicadores
INSERT INTO valores_indicador (indicador_id, data_referencia, valor_realizado, valor_meta, fonte_dados, observacoes, validado) VALUES
(1, CURRENT_DATE, 96.88, 95.0, 'e-Gestor AB', 'Valor extraído da planilha oficial', true)
ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET
    valor_realizado = EXCLUDED.valor_realizado,
    valor_meta = EXCLUDED.valor_meta;

INSERT INTO valores_indicador (indicador_id, data_referencia, valor_realizado, valor_meta, fonte_dados, observacoes, validado) VALUES
(2, CURRENT_DATE, 87.5, 95.0, 'SIPNI', 'Valor extraído da planilha oficial', true)
ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET
    valor_realizado = EXCLUDED.valor_realizado,
    valor_meta = EXCLUDED.valor_meta;

INSERT INTO valores_indicador (indicador_id, data_referencia, valor_realizado, valor_meta, fonte_dados, observacoes, validado) VALUES
(3, CURRENT_DATE, 12.3, 10.0, 'SIM/SINASC', 'Valor extraído da planilha oficial', true)
ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET
    valor_realizado = EXCLUDED.valor_realizado,
    valor_meta = EXCLUDED.valor_meta;

INSERT INTO valores_indicador (indicador_id, data_referencia, valor_realizado, valor_meta, fonte_dados, observacoes, validado) VALUES
(4, CURRENT_DATE, 2180.0, 2500.0, 'SISAB', 'Valor extraído da planilha oficial', true)
ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET
    valor_realizado = EXCLUDED.valor_realizado,
    valor_meta = EXCLUDED.valor_meta;

INSERT INTO valores_indicador (indicador_id, data_referencia, valor_realizado, valor_meta, fonte_dados, observacoes, validado) VALUES
(5, CURRENT_DATE, 1650.0, 1800.0, 'SISAB', 'Valor extraído da planilha oficial', true)
ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET
    valor_realizado = EXCLUDED.valor_realizado,
    valor_meta = EXCLUDED.valor_meta;

INSERT INTO valores_indicador (indicador_id, data_referencia, valor_realizado, valor_meta, fonte_dados, observacoes, validado) VALUES
(6, CURRENT_DATE, 89.2, 95.0, 'SIOPS', 'Valor extraído da planilha oficial', true)
ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET
    valor_realizado = EXCLUDED.valor_realizado,
    valor_meta = EXCLUDED.valor_meta;

INSERT INTO valores_indicador (indicador_id, data_referencia, valor_realizado, valor_meta, fonte_dados, observacoes, validado) VALUES
(7, CURRENT_DATE, 128.0, 150.0, 'Sistema RH', 'Valor extraído da planilha oficial', true)
ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET
    valor_realizado = EXCLUDED.valor_realizado,
    valor_meta = EXCLUDED.valor_meta;

INSERT INTO valores_indicador (indicador_id, data_referencia, valor_realizado, valor_meta, fonte_dados, observacoes, validado) VALUES
(8, CURRENT_DATE, 2950.0, 3200.0, 'SISAB', 'Valor extraído da planilha oficial', true)
ON CONFLICT (indicador_id, data_referencia) DO UPDATE SET
    valor_realizado = EXCLUDED.valor_realizado,
    valor_meta = EXCLUDED.valor_meta;

-- Inserir alertas críticos
INSERT INTO alertas (id, indicador_id, titulo, mensagem, nivel_criticidade, data_referencia, resolvido) VALUES
(1, 2, 'Meta de Cobertura Vacinal não atingida', 'A cobertura vacinal infantil está em 87.5%, abaixo da meta de 95%. Necessário intensificar campanhas de vacinação.', 'alto', '2025-12-01', false)
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    mensagem = EXCLUDED.mensagem,
    nivel_criticidade = EXCLUDED.nivel_criticidade;

INSERT INTO alertas (id, indicador_id, titulo, mensagem, nivel_criticidade, data_referencia, resolvido) VALUES
(2, 3, 'Taxa de Mortalidade Infantil acima da meta', 'A taxa de mortalidade infantil está em 12.3‰, acima da meta de 10‰. Requer atenção imediata.', 'critico', '2025-12-01', false)
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    mensagem = EXCLUDED.mensagem,
    nivel_criticidade = EXCLUDED.nivel_criticidade;

INSERT INTO alertas (id, indicador_id, titulo, mensagem, nivel_criticidade, data_referencia, resolvido) VALUES
(3, 4, 'Consultas Pré-natal abaixo da meta', 'Número de consultas pré-natal (2.180) está abaixo da meta (2.500). Tendência negativa identificada.', 'medio', '2025-12-01', false)
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    mensagem = EXCLUDED.mensagem,
    nivel_criticidade = EXCLUDED.nivel_criticidade;

