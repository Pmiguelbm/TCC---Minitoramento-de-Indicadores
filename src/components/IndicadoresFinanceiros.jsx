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
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Download, AttachMoney, TrendingUp, TrendingDown, Warning } from '@mui/icons-material'
import axios from 'axios'

const mockData = null

function IndicadoresFinanceiros() {
  const [filtroTempo, setFiltroTempo] = useState('ano')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await axios.get('/indicadores.json', { headers: { 'Cache-Control': 'no-cache' } })
        setDados(res.data)
      } catch (e) {
        setError('Falha ao carregar dados financeiros reais, exibindo dados de demonstração')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
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
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value)
          }
        }
      }
    }
  }

  return (
    <Box>
      {loading && <Alert severity="info" sx={{ mb: 2 }}>Carregando dados reais...</Alert>}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Indicadores Financeiros
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitoramento da execução orçamentária e gestão financeira da saúde
        </Typography>
      </Box>

      {/* Alerta de Execução */}
      <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Atenção: Execução orçamentária abaixo da meta
        </Typography>
        <Typography variant="body2">
          {(() => {
            const indicadorFinanceiro = (dados?.indicadores || []).find(i => i.categoria === 'financeiro')
            const valor = indicadorFinanceiro?.valor
            const meta = indicadorFinanceiro?.meta
            return `A execução orçamentária está em ${valor}%, abaixo da meta de ${meta}% para o período.`
          })()}
          Recomenda-se acelerar a execução dos recursos disponíveis.
        </Typography>
      </Alert>

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
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filtroCategoria}
                label="Categoria"
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <MenuItem value="todas">Todas as categorias</MenuItem>
                <MenuItem value="atencao-basica">Atenção Básica</MenuItem>
                <MenuItem value="media-complexidade">Média Complexidade</MenuItem>
                <MenuItem value="alta-complexidade">Alta Complexidade</MenuItem>
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

      {/* Cards de Resumo Orçamentário */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Execução Atual
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const indicadorFinanceiro = (dados?.indicadores || []).find(i => i.categoria === 'financeiro')
                  return indicadorFinanceiro ? `${indicadorFinanceiro.valor}%` : '-'
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Meta
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const indicadorFinanceiro = (dados?.indicadores || []).find(i => i.categoria === 'financeiro')
                  return indicadorFinanceiro ? `${indicadorFinanceiro.meta}%` : '-'
                })()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                {(() => {
                  const indicadorFinanceiro = (dados?.indicadores || []).find(i => i.categoria === 'financeiro')
                  const valor = indicadorFinanceiro?.valor
                  return valor != null ? `${valor}% do orçamento` : '-'
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Gap até a meta
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const ind = (dados?.indicadores || []).find(i => i.categoria === 'financeiro')
                  if (!ind || ind.valor == null || ind.meta == null) return '-'
                  const gap = Math.max(ind.meta - ind.valor, 0)
                  return `${gap.toFixed(1)}%`
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Última atualização
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const ind = (dados?.indicadores || []).find(i => i.categoria === 'financeiro')
                  const dt = ind?.ultimaAtualizacao
                  return dt ? new Date(dt).toLocaleDateString('pt-BR') : '-'
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Execução */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Execução Orçamentária
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Indicador</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Valor</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>% Execução</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Progresso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const ind = (dados?.indicadores || []).find(i => i.categoria === 'financeiro')
                  if (!ind) return null
                  const percentual = ind.meta ? Math.round((ind.valor / ind.meta) * 100) : 0
                  const status = ind.valor >= ind.meta ? 'success' : (ind.valor >= ind.meta * 0.9 ? 'warning' : 'error')
                  return (
                    <TableRow hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {ind.nome}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ind.valor}% (Meta: {ind.meta}%)
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {percentual}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={status === 'success' ? 'Adequado' : status === 'warning' ? 'Atenção' : 'Crítico'}
                          color={getStatusColor(status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ width: 150 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentual}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: status === 'success' ? '#28a745' : status === 'warning' ? '#ffc107' : '#dc3545'
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Comparativo Valor x Meta */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Execução Orçamentária: Valor x Meta
              </Typography>
              <Box sx={{ height: 400 }}>
                <Bar 
                  data={{
                    labels: (dados?.indicadores || []).filter(i => i.categoria === 'financeiro').map(i => i.nome),
                    datasets: [
                      { label: 'Valor', data: (dados?.indicadores || []).filter(i => i.categoria === 'financeiro').map(i => i.valor), backgroundColor: 'rgba(25, 118, 210, 0.8)' },
                      { label: 'Meta', data: (dados?.indicadores || []).filter(i => i.categoria === 'financeiro').map(i => i.meta), backgroundColor: 'rgba(220, 53, 69, 0.8)' }
                    ]
                  }}
                  options={chartOptions}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Distribuição de Status (Geral) */}
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
                        const inds = (dados?.indicadores || [])
                        const atingidas = inds.filter(i => (i.direcao_meta === 'menor_melhor') ? (i.valor <= i.meta) : (i.valor >= i.meta)).length
                        const proximas = inds.filter(i => (i.direcao_meta === 'menor_melhor') ? (i.valor > i.meta && i.valor <= i.meta * 1.1) : (i.valor < i.meta && i.valor >= i.meta * 0.9)).length
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
    </Box>
  )
}

export default IndicadoresFinanceiros
