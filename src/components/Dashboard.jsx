import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Analytics,
  Timeline,
  Assessment,
  FilterList,
  Download,
  Insights,
  ChevronLeft,
  ChevronRight,
  PlayArrow,
  ShowChart,
  Schedule
} from '@mui/icons-material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import _ from 'lodash'
import axios from 'axios'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
)

const demonstrationData = null

// Funções de análise
const calcularPerformanceGeral = (indicadores) => {
  const indicadoresComMeta = indicadores.filter(ind => ind.meta != null && ind.valor != null)
  const atingidas = indicadoresComMeta.filter(ind => {
    const dir = ind.direcao_meta || ind.direcao || 'maior_melhor'
    return dir === 'menor_melhor' ? (ind.valor <= ind.meta) : (ind.valor >= ind.meta)
  }).length
  const proximasMeta = indicadoresComMeta.filter(ind => {
    const dir = ind.direcao_meta || ind.direcao || 'maior_melhor'
    if (dir === 'menor_melhor') {
      return ind.valor > ind.meta && ind.valor <= ind.meta * 1.1
    }
    return ind.valor < ind.meta && ind.valor >= ind.meta * 0.9
  }).length
  const criticas = indicadoresComMeta.filter(ind => {
    const dir = ind.direcao_meta || ind.direcao || 'maior_melhor'
    if (dir === 'menor_melhor') {
      return ind.valor > ind.meta * 1.1
    }
    return ind.valor < ind.meta * 0.9
  }).length
  return {
    total: indicadoresComMeta.length,
    atingidas,
    proximasMeta,
    criticas,
    percentualAtingidas: indicadoresComMeta.length ? (atingidas / indicadoresComMeta.length * 100).toFixed(1) : '0.0'
  }
}

const calcularTendenciaGeral = (indicadores) => {
  const tendencias = indicadores.map(ind => {
    const historico = ind.historico || []
    if (historico.length < 2) return 0
    
    const ultimoValor = historico[historico.length - 1]
    const penultimoValor = historico[historico.length - 2]
    return ultimoValor - penultimoValor
  })
  
  const tendenciaMedia = _.mean(tendencias)
  return tendenciaMedia > 0 ? 'positiva' : tendenciaMedia < 0 ? 'negativa' : 'estável'
}

const chartData = null

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}

function Dashboard() {
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [periodoAnalise, setPeriodoAnalise] = useState('6m')
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date())
  const [carrosselIndex, setCarrosselIndex] = useState(0)
  
  // Referências para os gráficos
  const lineChartRef = useRef(null)
  const barChartRef = useRef(null)
  const doughnutChartRef = useRef(null)
  const radarChartRef = useRef(null)

  // Configurações do carrossel
  const indicadoresPorPagina = 3
  const totalPaginas = Math.ceil((dados?.indicadores ? dados.indicadores.length : 0) / indicadoresPorPagina)

  // Funções de navegação do carrossel
  const proximaPagina = () => {
    setCarrosselIndex((prev) => (prev + 1) % totalPaginas)
  }

  const paginaAnterior = () => {
    setCarrosselIndex((prev) => (prev - 1 + totalPaginas) % totalPaginas)
  }

  const irParaPagina = (index) => {
    setCarrosselIndex(index)
  }

  // Cleanup dos gráficos ao desmontar o componente
  useEffect(() => {
    return () => {
      // Destruir gráficos se existirem
      if (lineChartRef.current) {
        lineChartRef.current.destroy()
      }
      if (barChartRef.current) {
        barChartRef.current.destroy()
      }
      if (doughnutChartRef.current) {
        doughnutChartRef.current.destroy()
      }
      if (radarChartRef.current) {
        radarChartRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await axios.get('/indicadores.json', { headers: { 'Cache-Control': 'no-cache' } })
        setDados(res.data)
      } catch (e) {
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const indicadoresFiltrados = useMemo(() => {
    const base = dados?.indicadores ? dados.indicadores : []
    if (filtroCategoria === 'todos') return base
    return base.filter(ind => ind.categoria === filtroCategoria)
  }, [filtroCategoria, dados])

  const computePercent = (i) => {
    if (i.meta == null || i.meta === 0 || i.valor == null) return null
    return (i.direcao_meta === 'menor_melhor') ? (i.meta / i.valor * 100) : (i.valor / i.meta * 100)
  }

  const chartDataDistribuicao = useMemo(() => {
    const inds = indicadoresFiltrados
    const atingidas = inds.filter(i => {
      const dir = i.direcao_meta || 'maior_melhor'
      return dir === 'menor_melhor' ? (i.valor <= i.meta) : (i.valor >= i.meta)
    }).length
    const proximas = inds.filter(i => {
      const dir = i.direcao_meta || 'maior_melhor'
      if (i.meta == null || i.valor == null) return false
      return dir === 'menor_melhor' ? (i.valor > i.meta && i.valor <= i.meta * 1.1) : (i.valor < i.meta && i.valor >= i.meta * 0.9)
    }).length
    const criticas = inds.filter(i => {
      const dir = i.direcao_meta || 'maior_melhor'
      if (i.meta == null || i.valor == null) return true
      return dir === 'menor_melhor' ? (i.valor > i.meta * 1.1) : (i.valor < i.meta * 0.9)
    }).length
    return {
      labels: ['Atingiu Meta', 'Próxima da Meta', 'Abaixo da Meta'],
      datasets: [{
        data: [atingidas, proximas, criticas],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    }
  }, [indicadoresFiltrados])

  const chartDataBars = useMemo(() => {
    const inds = indicadoresFiltrados
    const labels = inds.map(i => i.nome)
    const valores = inds.map(i => i.valor)
    const metas = inds.map(i => i.meta)
    return {
      todos: {
        labels,
        datasets: [
          { label: 'Valor', data: valores, backgroundColor: 'rgba(25, 118, 210, 0.8)' },
          { label: 'Meta', data: metas, backgroundColor: 'rgba(220, 53, 69, 0.8)' }
        ]
      },
      producao: {
        labels: inds.filter(i => i.categoria === 'producao').map(i => i.nome),
        datasets: [
          { label: 'Valor', data: inds.filter(i => i.categoria === 'producao').map(i => i.valor), backgroundColor: 'rgba(25, 118, 210, 0.8)' },
          { label: 'Meta', data: inds.filter(i => i.categoria === 'producao').map(i => i.meta), backgroundColor: 'rgba(220, 53, 69, 0.8)' }
        ]
      }
    }
  }, [indicadoresFiltrados])

  const chartDataRadar = useMemo(() => {
    const inds = dados?.indicadores || []
    const categorias = ['epidemiologico', 'producao', 'financeiro', 'recursos_humanos']
    const labelMap = {
      epidemiologico: 'Epidemiológicos',
      producao: 'Produção',
      financeiro: 'Financeiro',
      recursos_humanos: 'RH'
    }
    const labels = categorias.map(c => labelMap[c])
    const percentMedio = categorias.map(cat => {
      const arr = inds.filter(i => i.categoria === cat).map(i => computePercent(i)).filter(p => p != null)
      return arr.length ? Math.max(0, Math.min(100, Number(_.mean(arr).toFixed(1)))) : 0
    })
    return {
      labels,
      datasets: [
        {
          label: 'Execução média (%)',
          data: percentMedio,
          backgroundColor: 'rgba(25, 118, 210, 0.2)',
          borderColor: '#1976d2'
        }
      ]
    }
  }, [dados])

  const performanceGeral = useMemo(() => 
    calcularPerformanceGeral(indicadoresFiltrados), [indicadoresFiltrados]
  )

  const tendenciaGeral = useMemo(() => 
    calcularTendenciaGeral(indicadoresFiltrados), [indicadoresFiltrados]
  )

  const handleRefresh = () => {
    setUltimaAtualizacao(new Date())
    // Aqui seria feita a atualização dos dados
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745'
      case 'warning': return '#ffc107'
      case 'error': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getTendenciaIcon = (tendencia) => {
    switch (tendencia) {
      case 'up': return <TrendingUp color="success" />
      case 'down': return <TrendingDown color="error" />
      default: return <TrendingFlat color="warning" />
    }
  }

  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'error': return <Error color="error" />
      case 'warning': return <Warning color="warning" />
      case 'info': return <Info color="info" />
      default: return <CheckCircle color="success" />
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho com controles */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Analytics color="primary" />
          Dashboard Executivo
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="epidemiologico">Epidemiológicos</MenuItem>
              <MenuItem value="producao">Produção</MenuItem>
              <MenuItem value="financeiro">Financeiros</MenuItem>
              <MenuItem value="rh">Recursos Humanos</MenuItem>
              <MenuItem value="qualidade">Qualidade</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={periodoAnalise}
              onChange={(e) => setPeriodoAnalise(e.target.value)}
            >
              <MenuItem value="3m">3 meses</MenuItem>
              <MenuItem value="6m">6 meses</MenuItem>
              <MenuItem value="12m">12 meses</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Atualizar dados">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Resumo Executivo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
            color: 'white',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
            borderRadius: 3,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)'
            }
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ fontSize: '1.5rem', mr: 1, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                  Performance Geral
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h2" sx={{ 
                  fontSize: '3.5rem', 
                  fontWeight: 700,
                  lineHeight: 1,
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {performanceGeral.percentualAtingidas}%
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontSize: '1rem',
                  opacity: 0.95,
                  fontWeight: 500,
                  mb: 2
                }}>
                  das metas atingidas
                </Typography>
                
                <Box sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  borderRadius: 2, 
                  p: 1.5,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    mb: 0.5
                  }}>
                    Indicadores Monitorados
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontSize: '1.3rem',
                    fontWeight: 700
                  }}>
                    {performanceGeral.atingidas} / {performanceGeral.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #28a745 0%, #4caf50 100%)', 
            color: 'white',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(40, 167, 69, 0.3)',
            borderRadius: 3,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(40, 167, 69, 0.4)'
            }
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShowChart sx={{ fontSize: '1.5rem', mr: 1, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                  Tendência Geral
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 1, 
                  mb: 2
                }}>
                  {tendenciaGeral === 'positiva' ? 
                    <TrendingUp sx={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} /> : 
                    tendenciaGeral === 'negativa' ? 
                    <TrendingDown sx={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} /> : 
                    <TrendingFlat sx={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                  }
                  <Typography variant="h2" sx={{ 
                    textTransform: 'capitalize', 
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {tendenciaGeral}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ 
                  fontSize: '1rem',
                  opacity: 0.95,
                  fontWeight: 500,
                  mb: 2
                }}>
                  nos últimos meses
                </Typography>
                
                <Box sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  borderRadius: 2, 
                  p: 1.5,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    mb: 0.5
                  }}>
                    Status da Tendência
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontSize: '1.3rem',
                    fontWeight: 700
                  }}>
                    {tendenciaGeral === 'positiva' ? '↗ Crescimento' : 
                     tendenciaGeral === 'negativa' ? '↘ Declínio' : '→ Estável'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)', 
            color: 'white',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
            borderRadius: 3,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(255, 152, 0, 0.4)'
            }
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ fontSize: '1.5rem', mr: 1, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                  Alertas Ativos
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h2" sx={{ 
                  fontSize: '3.5rem', 
                  fontWeight: 700,
                  lineHeight: 1,
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {performanceGeral.criticas}
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontSize: '1rem',
                  opacity: 0.95,
                  fontWeight: 500,
                  mb: 2
                }}>
                  requerem atenção
                </Typography>
                
                <Box sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  borderRadius: 2, 
                  p: 1.5,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    mb: 0.5
                  }}>
                    Alertas Críticos
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#ffebee'
                  }}>
                    {performanceGeral.criticas}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #6f42c1 0%, #9c27b0 100%)', 
            color: 'white',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(111, 66, 193, 0.3)',
            borderRadius: 3,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(111, 66, 193, 0.4)'
            }
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ fontSize: '1.5rem', mr: 1, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                  Última Atualização
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h2" sx={{ 
                  fontSize: '3.5rem', 
                  fontWeight: 700,
                  lineHeight: 1,
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {ultimaAtualizacao.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontSize: '1rem',
                  opacity: 0.95,
                  fontWeight: 500,
                  mb: 2
                }}>
                  às {ultimaAtualizacao.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
                
                <Box sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  borderRadius: 2, 
                  p: 1.5,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    mb: 0.5
                  }}>
                    Status do Sistema
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontSize: '1.3rem',
                    fontWeight: 700
                  }}>
                    🟢 Online
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Indicadores Principais - Carrossel */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment />
            Indicadores Principais
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={paginaAnterior}
              disabled={totalPaginas <= 1}
              sx={{ 
                backgroundColor: 'primary.main', 
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' },
                '&:disabled': { backgroundColor: 'grey.300' }
              }}
            >
              <ChevronLeft />
            </IconButton>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {Array.from({ length: totalPaginas }, (_, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={() => irParaPagina(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: carrosselIndex === index ? 'primary.main' : 'grey.300',
                    '&:hover': { backgroundColor: carrosselIndex === index ? 'primary.dark' : 'grey.400' }
                  }}
                />
              ))}
            </Box>
            <IconButton 
              onClick={proximaPagina}
              disabled={totalPaginas <= 1}
              sx={{ 
                backgroundColor: 'primary.main', 
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' },
                '&:disabled': { backgroundColor: 'grey.300' }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ overflow: 'hidden', position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              transform: `translateX(-${carrosselIndex * 100}%)`,
              transition: 'transform 0.5s ease-in-out',
            }}
          >
            {Array.from({ length: totalPaginas }, (_, pageIndex) => (
              <Box
                key={pageIndex}
                sx={{
                  minWidth: '100%',
                  display: 'flex',
                  gap: 3,
                }}
              >
                <Grid container spacing={3}>
                  {(dados?.indicadores || [])
                    .slice(pageIndex * indicadoresPorPagina, (pageIndex + 1) * indicadoresPorPagina)
                    .map((indicador, index) => (
                      <Grid item xs={12} sm={6} md={4} key={`${pageIndex}-${index}`}>
                        <Card sx={{ height: '100%', position: 'relative' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                {indicador.nome}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                              <Typography variant="h4">
                                {indicador.valor}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {indicador.unidade || ''}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="body2" color="textSecondary">
                                Meta: {indicador.meta} {indicador.unidade || ''}
                              </Typography>
                            </Box>

                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(((indicador.direcao_meta === 'menor_melhor' ? indicador.meta / indicador.valor : indicador.valor / indicador.meta) * 100), 100)}
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: '#1976d2',
                                  borderRadius: 4
                                }
                              }}
                            />

                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="textSecondary">
                                Fonte: {indicador.fonte || '-'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {(((indicador.direcao_meta === 'menor_melhor' ? indicador.meta / indicador.valor : indicador.valor / indicador.meta) * 100)).toFixed(1)}% da meta
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Gráficos Analíticos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline />
                Evolução Temporal dos Indicadores
              </Typography>
              <Box sx={{ height: 400 }}>
                <Bar ref={lineChartRef} data={chartDataBars.todos} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição de Performance
              </Typography>
              <Box sx={{ height: 200 }}>
                <Doughnut 
                  ref={doughnutChartRef}
                  data={chartDataDistribuicao} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Radar de Performance
              </Typography>
              <Box sx={{ height: 200 }}>
                <Radar 
                  ref={radarChartRef}
                  data={chartDataRadar}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    },
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Produção e Alertas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                Indicadores de Produção
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  ref={barChartRef}
                  data={chartDataBars.producao} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`
                        }
                      }
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
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning />
                Alertas Críticos
              </Typography>
              <List dense>
                {(dados?.alertas || []).map((alerta) => (
                  <ListItem key={alerta.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getAlertIcon((alerta.nivel_criticidade === 'critico' ? 'error' : alerta.nivel_criticidade === 'alto' ? 'warning' : 'info'))}
                    </ListItemIcon>
                    <ListItemText
                      primary={alerta.titulo}
                      secondary={`${alerta.mensagem} • ${alerta.data_referencia} • ${alerta.tipo}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<Insights />}
                size="small"
              >
                Ver Análise Completa
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
