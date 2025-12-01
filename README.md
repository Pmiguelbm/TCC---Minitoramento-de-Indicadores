# Sistema de Monitoramento de Indicadores de Saúde Municipal

## 📋 Descrição

Sistema web para monitoramento de indicadores de saúde pública municipal, desenvolvido com React.js e dados reais extraídos de planilhas oficiais de metas da Secretaria Municipal de Saúde.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React.js + Vite
- **UI Framework**: Material-UI (MUI)
- **Gráficos**: Chart.js + React-Chartjs-2
- **Banco de Dados**: PostgreSQL (schema definido)
- **Dados**: Extraídos de planilha Excel oficial

## 📊 Funcionalidades

### Dashboard Principal
- Visualização de 8 indicadores reais de saúde
- Gráficos interativos de evolução mensal
- Sistema de alertas críticos
- Distribuição de recursos e performance

### Módulos Específicos
- **Epidemiológicos**: Indicadores de vigilância e controle
- **Produção**: Atendimentos, consultas e procedimentos
- **Financeiros**: Execução orçamentária e custos
- **Recursos Humanos**: Gestão de pessoal e capacitação
- **Metas PAS/PMS**: Acompanhamento de planos municipais
- **Análise Estatística**: Relatórios e tendências
- **Alertas**: Sistema de notificações automáticas
- **Configurações**: Gestão do sistema

## 📈 Indicadores Monitorados

1. **Cobertura Vacinal Infantil**: 87.5% (Meta: 95%)
2. **Taxa de Mortalidade Infantil**: 12.3‰ (Meta: 10‰)
3. **Consultas Pré-natal**: 2.180 (Meta: 2.500)
4. **Exames Preventivos**: 1.650 (Meta: 1.800)
5. **Execução Orçamentária**: 89.2% (Meta: 95%)
6. **Capacitação de Profissionais**: 128 (Meta: 150)
7. **Atendimentos de Urgência**: 2.950 (Meta: 3.200)
8. **Cobertura ESF**: 78.4% (Meta: 85%)

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para execução

1. **Clone ou baixe o projeto**
```bash
cd TCC---Minitoramento-de-Indicadores
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Acesse o sistema**
```
http://localhost:3000
```

## 🗄️ Banco de Dados

### Estado Atual
- **Frontend**: Totalmente funcional com dados reais
- **Banco**: Schema PostgreSQL definido (não conectado)
- **Dados**: Extraídos da planilha "Dados - Metas.xlsx"

### Para implementar o banco de dados:

1. **Instale PostgreSQL**
2. **Execute o script de criação**:
```sql
-- Execute o arquivo: database_schema.sql
-- Execute o arquivo: inserir_dados_reais.sql
```

## 📁 Estrutura do Projeto

```
TCC---Minitoramento-de-Indicadores/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Dashboard.jsx    # Dashboard principal
│   │   ├── IndicadoresEpidemiologicos.jsx
│   │   ├── IndicadoresProducao.jsx
│   │   ├── IndicadoresFinanceiros.jsx
│   │   ├── IndicadoresRH.jsx
│   │   ├── MetasPAS.jsx
│   │   ├── AnaliseEstatistica.jsx
│   │   ├── Alertas.jsx
│   │   └── Configuracoes.jsx
│   ├── data/
│   │   └── dadosReais.js    # Dados reais extraídos
│   ├── App.jsx              # Componente principal
│   └── main.jsx             # Ponto de entrada
├── database_schema.sql      # Schema do banco PostgreSQL
├── inserir_dados_reais.sql  # Script de inserção de dados
├── Dados - Metas.xlsx       # Planilha fonte dos dados
└── package.json             # Dependências do projeto
```

## 📋 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build de produção

## 🎯 Dados Reais

Os dados utilizados no sistema foram extraídos da planilha oficial **"Dados - Metas.xlsx"** da Secretaria Municipal de Saúde, contendo:

- 8 indicadores principais de saúde
- 3 alertas críticos baseados em análise real
- Metas oficiais estabelecidas
- Dados de performance atual

## 🚨 Alertas Implementados

1. **Meta de Cobertura Vacinal não atingida** (Nível Alto)
2. **Tendência negativa em Consultas Pré-natal** (Nível Médio)
3. **Valor crítico em Taxa de Mortalidade Infantil** (Nível Crítico)

## 📞 Suporte

Para dúvidas ou suporte técnico, consulte a documentação adicional:
- `especificacao_modulo_monitoramento.md` - Especificação técnica completa
- `BANCO_DE_DADOS_E_MIGRACAO.md` - Guia de implementação do banco

---

**Desenvolvido para Secretaria Municipal de Saúde**  
*Sistema de Monitoramento de Indicadores v1.0*
