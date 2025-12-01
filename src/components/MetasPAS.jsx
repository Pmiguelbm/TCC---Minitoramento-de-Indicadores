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
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { Doughnut, Bar } from 'react-chartjs-2'
import axios from 'axios'
import {
  Download,
  Assignment,
  CheckCircle,
  Warning,
  Error,
  ExpandMore,
  TrendingUp,
  TrendingDown,
  Schedule,
  Flag
} from '@mui/icons-material'


function MetasPAS() {
  const [filtroEixo, setFiltroEixo] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [expandedMeta, setExpandedMeta] = useState(false)
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await axios.get('/indicadores.json', { headers: { 'Cache-Control': 'no-cache' } })
        setDados(res.data)
      } catch (e) {
        setError('Falha ao carregar dados reais do ETL')
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

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'No Prazo'
      case 'warning': return 'Atenção'
      case 'error': return 'Atrasada'
      default: return 'Normal'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle sx={{ color: '#28a745' }} />
      case 'warning': return <Warning sx={{ color: '#ffc107' }} />
      case 'error': return <Error sx={{ color: '#dc3545' }} />
      default: return <Schedule />
    }
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

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedMeta(isExpanded ? panel : false)
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Metas PAS e PMS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitoramento das metas do Plano Anual de Saúde e Plano Municipal de Saúde
        </Typography>
      </Box>

      {/* Alerta de Metas */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<Flag />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Acompanhamento do PAS 2024
        </Typography>
        <Typography variant="body2">
          {(() => {
            const inds = (dados?.indicadores || [])
            const atingidas = inds.filter(i => (i.direcao_meta === 'menor_melhor') ? (i.valor <= i.meta) : (i.valor >= i.meta)).length
            const total = inds.length
            const perc = total ? ((atingidas / total) * 100).toFixed(1) : '0.0'
            return `${perc}% das metas foram atingidas até o momento.`
          })()}
        </Typography>
      </Alert>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Eixo Estratégico</InputLabel>
              <Select
                value={filtroEixo}
                label="Eixo Estratégico"
                onChange={(e) => setFiltroEixo(e.target.value)}
              >
                <MenuItem value="todos">Todos os eixos</MenuItem>
                <MenuItem value="atencao-basica">Atenção Básica</MenuItem>
                <MenuItem value="especializada">Atenção Especializada</MenuItem>
                <MenuItem value="vigilancia">Vigilância em Saúde</MenuItem>
                <MenuItem value="farmaceutica">Assistência Farmacêutica</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                label="Status"
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <MenuItem value="todos">Todos os status</MenuItem>
                <MenuItem value="atingidas">Atingidas</MenuItem>
                <MenuItem value="andamento">Em Andamento</MenuItem>
                <MenuItem value="atrasadas">Atrasadas</MenuItem>
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
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total de Metas
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(dados?.indicadores || []).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Metas Atingidas
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const inds = (dados?.indicadores || [])
                  return inds.filter(i => (i.direcao_meta === 'menor_melhor') ? (i.valor <= i.meta) : (i.valor >= i.meta)).length
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Em Andamento
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const inds = (dados?.indicadores || [])
                  return inds.filter(i => {
                    const dir = i.direcao_meta || 'maior_melhor'
                    if (i.meta == null || i.valor == null) return false
                    return dir === 'menor_melhor' ? (i.valor > i.meta && i.valor <= i.meta * 1.1) : (i.valor < i.meta && i.valor >= i.meta * 0.9)
                  }).length
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Error sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Atrasadas
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const inds = (dados?.indicadores || [])
                  return inds.filter(i => {
                    const dir = i.direcao_meta || 'maior_melhor'
                    if (i.meta == null || i.valor == null) return true
                    return dir === 'menor_melhor' ? (i.valor > i.meta * 1.1) : (i.valor < i.meta * 0.9)
                  }).length
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Metas por Eixo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Metas por Eixo Estratégico
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Eixo Estratégico</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Total de Metas</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Atingidas</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>% Execução</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Progresso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const inds = (dados?.indicadores || [])
                  const grupos = {
                    epidemiologico: 'Epidemiológicos',
                    producao: 'Produção',
                    financeiro: 'Financeiro',
                    recursos_humanos: 'RH'
                  }
                  return Object.entries(grupos).map(([cat, label]) => {
                    const arr = inds.filter(i => i.categoria === cat)
                    const total = arr.length
                    const atingidas = arr.filter(i => (i.direcao_meta === 'menor_melhor') ? (i.valor <= i.meta) : (i.valor >= i.meta)).length
                    const percMedio = (() => {
                      const vals = arr.map(i => {
                        if (i.meta == null || i.valor == null) return null
                        return (i.direcao_meta === 'menor_melhor') ? (i.meta / i.valor * 100) : (i.valor / i.meta * 100)
                      }).filter(v => v != null)
                      return vals.length ? Math.max(0, Math.min(100, Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)))) : 0
                    })()
                    const status = percMedio >= 100 ? 'success' : (percMedio >= 90 ? 'warning' : 'error')
                    return (
                      <TableRow key={cat} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {label}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {total}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {atingidas}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {percMedio}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={getStatusText(status)}
                            color={getStatusColor(status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ width: 150 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={percMedio}
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
                  })
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Metas Detalhadas (ETL) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Detalhamento dos Indicadores (ETL)
          </Typography>
          {(dados?.indicadores || []).map((ind, idx) => {
            const perc = ind.meta ? Math.round(((ind.direcao_meta === 'menor_melhor' ? ind.meta / ind.valor : ind.valor / ind.meta) * 100)) : 0
            const status = ind.direcao_meta === 'menor_melhor' ? (ind.valor <= ind.meta ? 'success' : (ind.valor <= ind.meta * 1.1 ? 'warning' : 'error')) : (ind.valor >= ind.meta ? 'success' : (ind.valor >= ind.meta * 0.9 ? 'warning' : 'error'))
            return (
              <Accordion key={idx} expanded={expandedMeta === `ind${idx}`} onChange={handleAccordionChange(`ind${idx}`)} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                    {getStatusIcon(status)}
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {ind.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ind.categoria} • {perc}% da meta
                      </Typography>
                    </Box>
                    <Chip label={getStatusText(status)} color={getStatusColor(status)} size="small" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Meta:</strong> {ind.meta} {ind.unidade || ''}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Atual:</strong> {ind.valor} {ind.unidade || ''}
                      </Typography>
                      <LinearProgress variant="determinate" value={perc} sx={{ height: 10, borderRadius: 5, mb: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {perc}% da meta atingida
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Observações
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dados orgânicos carregados via ETL.
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </CardContent>
      </Card>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Metas por Eixo (Execução Média) */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Execução Média por Eixo
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={{
                    labels: ['Epidemiológicos', 'Produção', 'Financeiro', 'RH'],
                    datasets: [{
                      label: 'Execução média (%)',
                      data: (() => {
                        const inds = (dados?.indicadores || [])
                        const calc = (cat) => {
                          const arr = inds.filter(i => i.categoria === cat)
                          const vals = arr.map(i => {
                            if (i.meta == null || i.valor == null) return null
                            return (i.direcao_meta === 'menor_melhor') ? (i.meta / i.valor * 100) : (i.valor / i.meta * 100)
                          }).filter(v => v != null)
                          return vals.length ? Math.max(0, Math.min(100, Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)))) : 0
                        }
                        return [calc('epidemiologico'), calc('producao'), calc('financeiro'), calc('recursos_humanos')]
                      })(),
                      backgroundColor: 'rgba(25, 118, 210, 0.8)'
                    }]
                  }}
                  options={chartOptions}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribuição por Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Distribuição por Status
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut 
                  data={{
                    labels: ['Atingidas', 'Em Andamento', 'Atrasadas'],
                    datasets: [{
                      data: (() => {
                        const inds = (dados?.indicadores || [])
                        const atingidas = inds.filter(i => (i.direcao_meta === 'menor_melhor') ? (i.valor <= i.meta) : (i.valor >= i.meta)).length
                        const andamento = inds.filter(i => {
                          const dir = i.direcao_meta || 'maior_melhor'
                          if (i.meta == null || i.valor == null) return false
                          return dir === 'menor_melhor' ? (i.valor > i.meta && i.valor <= i.meta * 1.1) : (i.valor < i.meta && i.valor >= i.meta * 0.9)
                        }).length
                        const atrasadas = inds.length - atingidas - andamento
                        return [atingidas, andamento, atrasadas]
                      })(),
                      backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MetasPAS
