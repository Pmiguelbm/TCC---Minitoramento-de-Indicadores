import React, { useState, useMemo } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Info,
  Assessment,
  Timeline,
  Analytics
} from '@mui/icons-material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Scatter } from 'react-chartjs-2'
import _ from 'lodash'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
)

// Funções de análise estatística
const calcularEstatisticas = (dados) => {
  const valores = dados.filter(v => v !== null && v !== undefined && !isNaN(v))
  
  if (valores.length === 0) return null
  
  const media = _.mean(valores)
  const mediana = valores.length % 2 === 0 
    ? (valores.sort((a, b) => a - b)[valores.length / 2 - 1] + valores.sort((a, b) => a - b)[valores.length / 2]) / 2
    : valores.sort((a, b) => a - b)[Math.floor(valores.length / 2)]
  
  const desvioPadrao = Math.sqrt(_.mean(valores.map(v => Math.pow(v - media, 2))))
  const coeficienteVariacao = (desvioPadrao / media) * 100
  
  return {
    media: media.toFixed(2),
    mediana: mediana.toFixed(2),
    desvioPadrao: desvioPadrao.toFixed(2),
    coeficienteVariacao: coeficienteVariacao.toFixed(2),
    minimo: Math.min(...valores).toFixed(2),
    maximo: Math.max(...valores).toFixed(2),
    amplitude: (Math.max(...valores) - Math.min(...valores)).toFixed(2)
  }
}

const calcularTendencia = (dados) => {
  if (dados.length < 2) return { tendencia: 'insuficiente', taxa: 0, r2: 0 }
  
  const n = dados.length
  const x = Array.from({length: n}, (_, i) => i + 1)
  const y = dados
  
  const sumX = _.sum(x)
  const sumY = _.sum(y)
  const sumXY = _.sum(x.map((xi, i) => xi * y[i]))
  const sumX2 = _.sum(x.map(xi => xi * xi))
  const sumY2 = _.sum(y.map(yi => yi * yi))
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  // Coeficiente de determinação (R²)
  const yMean = _.mean(y)
  const ssRes = _.sum(y.map((yi, i) => Math.pow(yi - (slope * x[i] + intercept), 2)))
  const ssTot = _.sum(y.map(yi => Math.pow(yi - yMean, 2)))
  const r2 = 1 - (ssRes / ssTot)
  
  let tendencia = 'estável'
  if (Math.abs(slope) > 0.1) {
    tendencia = slope > 0 ? 'crescente' : 'decrescente'
  }
  
  return {
    tendencia,
    taxa: (slope * 100).toFixed(2),
    r2: (r2 * 100).toFixed(2),
    equacao: `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`
  }
}

const calcularCorrelacao = (dados1, dados2) => {
  if (dados1.length !== dados2.length || dados1.length < 2) return 0
  
  const n = dados1.length
  const sumX = _.sum(dados1)
  const sumY = _.sum(dados2)
  const sumXY = _.sum(dados1.map((x, i) => x * dados2[i]))
  const sumX2 = _.sum(dados1.map(x => x * x))
  const sumY2 = _.sum(dados2.map(y => y * y))
  
  const numerador = n * sumXY - sumX * sumY
  const denominador = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  return denominador === 0 ? 0 : numerador / denominador
}

// Dados simulados mais robustos
const dadosIndicadores = {
  coberturaVacinal: {
    nome: 'Cobertura Vacinal Infantil',
    dados: [82, 85, 88, 86, 89, 87.5, 90, 88, 91, 89, 92, 90],
    meta: 95,
    unidade: '%',
    categoria: 'epidemiologico'
  },
  incidenciaDengue: {
    nome: 'Incidência de Dengue',
    dados: [35, 38, 42, 44, 46, 45.2, 48, 50, 47, 45, 43, 41],
    meta: 30,
    unidade: 'casos/100k hab',
    categoria: 'epidemiologico'
  },
  consultasRealizadas: {
    nome: 'Consultas Realizadas',
    dados: [11200, 11800, 12100, 12450, 12800, 13200, 13500, 13100, 12900, 13400, 13800, 14200],
    meta: 15000,
    unidade: 'consultas',
    categoria: 'producao'
  },
  execucaoOrcamentaria: {
    nome: 'Execução Orçamentária',
    dados: [65, 68, 72, 75, 78.2, 80, 82, 79, 81, 83, 85, 87],
    meta: 85,
    unidade: '%',
    categoria: 'financeiro'
  },
  absenteismo: {
    nome: 'Taxa de Absenteísmo',
    dados: [5.2, 4.8, 4.5, 4.2, 4.0, 4.2, 3.8, 4.1, 3.9, 3.7, 3.5, 3.3],
    meta: 3.0,
    unidade: '%',
    categoria: 'rh'
  }
}

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function AnaliseEstatistica() {
  const [indicadorSelecionado, setIndicadorSelecionado] = useState('coberturaVacinal')
  const [periodoAnalise, setPeriodoAnalise] = useState(12)

  const dadosIndicador = dadosIndicadores[indicadorSelecionado]
  const dadosRecentes = dadosIndicador.dados.slice(-periodoAnalise)
  const mesesRecentes = meses.slice(-periodoAnalise)

  const estatisticas = useMemo(() => calcularEstatisticas(dadosRecentes), [dadosRecentes])
  const tendencia = useMemo(() => calcularTendencia(dadosRecentes), [dadosRecentes])

  // Análise de correlação entre indicadores
  const correlacoes = useMemo(() => {
    const indicadores = Object.keys(dadosIndicadores)
    const matriz = []
    
    indicadores.forEach(ind1 => {
      const linha = []
      indicadores.forEach(ind2 => {
        const corr = calcularCorrelacao(
          dadosIndicadores[ind1].dados.slice(-periodoAnalise),
          dadosIndicadores[ind2].dados.slice(-periodoAnalise)
        )
        linha.push({
          indicador1: ind1,
          indicador2: ind2,
          correlacao: corr.toFixed(3),
          intensidade: Math.abs(corr) > 0.7 ? 'forte' : Math.abs(corr) > 0.3 ? 'moderada' : 'fraca'
        })
      })
      matriz.push(linha)
    })
    
    return matriz
  }, [periodoAnalise])

  // Dados para gráfico de tendência
  const dadosTendencia = {
    labels: mesesRecentes,
    datasets: [
      {
        label: dadosIndicador.nome,
        data: dadosRecentes,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Linha de Tendência',
        data: dadosRecentes.map((_, i) => {
          const slope = parseFloat(tendencia.taxa) / 100
          const intercept = dadosRecentes[0]
          return slope * i + intercept
        }),
        borderColor: '#dc3545',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        pointRadius: 0
      },
      {
        label: 'Meta',
        data: Array(dadosRecentes.length).fill(dadosIndicador.meta),
        borderColor: '#28a745',
        backgroundColor: 'transparent',
        borderDash: [10, 5],
        pointRadius: 0
      }
    ]
  }

  // Dados para análise de distribuição
  const dadosDistribuicao = {
    labels: mesesRecentes,
    datasets: [
      {
        label: 'Valores',
        data: dadosRecentes.map((valor, i) => ({ x: i + 1, y: valor })),
        backgroundColor: dadosRecentes.map(valor => 
          valor >= dadosIndicador.meta ? '#28a745' : 
          valor >= dadosIndicador.meta * 0.9 ? '#ffc107' : '#dc3545'
        ),
        borderColor: '#1976d2',
        borderWidth: 1
      }
    ]
  }

  const getTendenciaIcon = (tend) => {
    switch (tend) {
      case 'crescente': return <TrendingUp color="success" />
      case 'decrescente': return <TrendingDown color="error" />
      default: return <TrendingFlat color="warning" />
    }
  }

  const getCorrelacaoColor = (intensidade) => {
    switch (intensidade) {
      case 'forte': return '#dc3545'
      case 'moderada': return '#ffc107'
      default: return '#28a745'
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Analytics color="primary" />
        Análise Estatística Avançada
      </Typography>

      {/* Controles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Indicador</InputLabel>
            <Select
              value={indicadorSelecionado}
              onChange={(e) => setIndicadorSelecionado(e.target.value)}
            >
              {Object.entries(dadosIndicadores).map(([key, indicador]) => (
                <MenuItem key={key} value={key}>
                  {indicador.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Período de Análise</InputLabel>
            <Select
              value={periodoAnalise}
              onChange={(e) => setPeriodoAnalise(e.target.value)}
            >
              <MenuItem value={6}>Últimos 6 meses</MenuItem>
              <MenuItem value={12}>Últimos 12 meses</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Estatísticas Descritivas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                Estatísticas Descritivas
              </Typography>
              {estatisticas && (
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">{estatisticas.media}</Typography>
                      <Typography variant="body2">Média</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">{estatisticas.mediana}</Typography>
                      <Typography variant="body2">Mediana</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">{estatisticas.desvioPadrao}</Typography>
                      <Typography variant="body2">Desvio Padrão</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">{estatisticas.coeficienteVariacao}%</Typography>
                      <Typography variant="body2">Coef. Variação</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline />
                Análise de Tendência
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {getTendenciaIcon(tendencia.tendencia)}
                <Chip 
                  label={tendencia.tendencia.toUpperCase()} 
                  color={tendencia.tendencia === 'crescente' ? 'success' : 
                         tendencia.tendencia === 'decrescente' ? 'error' : 'warning'}
                />
              </Box>
              <Typography variant="body2" gutterBottom>
                Taxa de variação: <strong>{tendencia.taxa}%</strong> por período
              </Typography>
              <Typography variant="body2" gutterBottom>
                Confiabilidade (R²): <strong>{tendencia.r2}%</strong>
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {tendencia.equacao}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico de Tendência */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolução Temporal com Linha de Tendência
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line 
                  data={dadosTendencia} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.dataset.label}: ${context.parsed.y} ${dadosIndicador.unidade}`
                        }
                      }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição de Performance
              </Typography>
              <Box sx={{ height: 400 }}>
                <Scatter 
                  data={dadosDistribuicao}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      x: { 
                        title: { display: true, text: 'Período' },
                        beginAtZero: true
                      },
                      y: { 
                        title: { display: true, text: dadosIndicador.unidade },
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Matriz de Correlação */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Matriz de Correlação entre Indicadores
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Valores próximos a 1 ou -1 indicam correlação forte. Valores próximos a 0 indicam correlação fraca.
          </Alert>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Indicador</TableCell>
                  {Object.values(dadosIndicadores).map(ind => (
                    <TableCell key={ind.nome} align="center">
                      <Tooltip title={ind.nome}>
                        <Typography variant="caption">
                          {ind.nome.split(' ')[0]}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {correlacoes.map((linha, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Typography variant="body2">
                        {Object.values(dadosIndicadores)[i].nome.split(' ')[0]}
                      </Typography>
                    </TableCell>
                    {linha.map((celula, j) => (
                      <TableCell key={j} align="center">
                        <Chip
                          label={celula.correlacao}
                          size="small"
                          sx={{
                            backgroundColor: getCorrelacaoColor(celula.intensidade),
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AnaliseEstatistica