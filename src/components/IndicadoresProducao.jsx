import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert
} from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Download, TrendingUp, TrendingDown } from '@mui/icons-material'
import axios from 'axios'

const mockData = null

function IndicadoresProducao() {
  const [filtroTempo, setFiltroTempo] = useState('mes')
  const [filtroUnidade, setFiltroUnidade] = useState('todas')
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await axios.get('/indicadores.json', { headers: { 'Cache-Control': 'no-cache' } })
        setDados(res.data)
      } catch (e) {
        setError('Falha ao carregar dados de produção reais, exibindo dados de demonstração')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const getStatusColor = (percentual) => {
    if (percentual >= 95) return 'success'
    if (percentual >= 80) return 'warning'
    return 'error'
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  )

  return (
    <Box>
      {loading && <Alert severity="info" sx={{ mb: 2 }}>Carregando dados reais...</Alert>}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Indicadores de Produção
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitoramento da produção assistencial e capacidade de atendimento
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={filtroTempo}
                label="Período"
                onChange={(e) => setFiltroTempo(e.target.value)}
              >
                <MenuItem value="mes">Este mês</MenuItem>
                <MenuItem value="trimestre">Trimestre</MenuItem>
                <MenuItem value="ano">Ano</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Unidade</InputLabel>
              <Select
                value={filtroUnidade}
                label="Unidade"
                onChange={(e) => setFiltroUnidade(e.target.value)}
              >
                <MenuItem value="todas">Todas as unidades</MenuItem>
                <MenuItem value="ubs">UBS</MenuItem>
                <MenuItem value="hospital">Hospital</MenuItem>
                <MenuItem value="especialidades">Especialidades</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              size="small"
            >
              Exportar
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {(dados?.indicadores || []).filter(i => i.categoria === 'producao').map(i => ({
          nome: i.nome,
          realizado: i.valor,
          meta: i.meta,
          percentual: i.meta ? Math.round((i.valor / i.meta) * 100) : 0
        })).map((indicador, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {indicador.nome}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mr: 1 }}>
                    {indicador.realizado.toLocaleString('pt-BR')}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Meta: {indicador.meta.toLocaleString('pt-BR')}
                </Typography>
                
                <LinearProgress 
                  variant="determinate" 
                  value={indicador.percentual}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getStatusColor(indicador.percentual) === 'success' ? '#28a745' :
                                     getStatusColor(indicador.percentual) === 'warning' ? '#ffc107' : '#dc3545'
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {indicador.percentual}% da meta
                  </Typography>
                  <Chip 
                    label={getStatusColor(indicador.percentual) === 'success' ? 'Atingida' :
                           getStatusColor(indicador.percentual) === 'warning' ? 'Próxima' : 'Crítica'}
                    color={getStatusColor(indicador.percentual)}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Comparativo Produção */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Produção: Realizado x Meta
              </Typography>
              <Box sx={{ height: 400 }}>
                <Bar 
                  data={{
                    labels: (dados?.indicadores || []).filter(i => i.categoria === 'producao').map(i => i.nome),
                    datasets: [
                      { label: 'Realizado', data: (dados?.indicadores || []).filter(i => i.categoria === 'producao').map(i => i.valor), backgroundColor: 'rgba(25, 118, 210, 0.8)' },
                      { label: 'Meta', data: (dados?.indicadores || []).filter(i => i.categoria === 'producao').map(i => i.meta), backgroundColor: 'rgba(220, 53, 69, 0.8)' }
                    ]
                  }}
                  options={chartOptions}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribuição de Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Status dos Indicadores
              </Typography>
              <Box sx={{ height: 400 }}>
                <Doughnut 
                  data={{
                    labels: ['Atingiu Meta', 'Próxima da Meta', 'Abaixo da Meta'],
                    datasets: [{
                      data: (() => {
                        const inds = (dados?.indicadores || []).filter(i => i.categoria === 'producao')
                        const atingidas = inds.filter(i => i.valor >= i.meta).length
                        const proximas = inds.filter(i => i.valor < i.meta && i.valor >= i.meta * 0.9).length
                        const criticas = inds.length - atingidas - proximas
                        return [atingidas, proximas, criticas]
                      })(),
                      backgroundColor: ['#4caf50', '#ff9800', '#f44336']
                    }]
                  }}
                  options={{ ...chartOptions, plugins: { legend: { position: 'bottom' } } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela Detalhada */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Detalhamento por Procedimento
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Procedimento</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Realizado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Meta</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>% Execução</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Tendência</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(dados?.indicadores || []).filter(i => i.categoria === 'producao').map(i => ({
                  nome: i.nome,
                  realizado: i.valor,
                  meta: i.meta,
                  percentual: i.meta ? Math.round((i.valor / i.meta) * 100) : 0,
                })).map((indicador, index) => (
              <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {indicador.nome}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {indicador.realizado.toLocaleString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {indicador.meta.toLocaleString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {indicador.percentual}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={getStatusColor(indicador.percentual) === 'success' ? 'Meta Atingida' :
                               getStatusColor(indicador.percentual) === 'warning' ? 'Próximo à Meta' : 'Abaixo da Meta'}
                        color={getStatusColor(indicador.percentual)}
                        size="small"
                      />
                    </TableCell>
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

export default IndicadoresProducao
