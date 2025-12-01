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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Download,
  People,
  PersonAdd,
  PersonRemove,
  Schedule,
  Warning,
  CheckCircle,
  School,
  Work
} from '@mui/icons-material'
import axios from 'axios'

const mockData = null

function IndicadoresRH() {
  const [filtroTempo, setFiltroTempo] = useState('mes')
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
        setError('Falha ao carregar dados de RH reais, exibindo dados de demonstração')
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
      case 'success': return 'Adequado'
      case 'warning': return 'Atenção'
      case 'error': return 'Crítico'
      default: return 'Normal'
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

  return (
    <Box>
      {loading && <Alert severity="info" sx={{ mb: 2 }}>Carregando dados reais...</Alert>}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Indicadores de Recursos Humanos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitoramento da força de trabalho, capacitação e gestão de pessoas
        </Typography>
      </Box>

      {/* Alerta de RH */}
      <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Atenção: Indicadores críticos em RH
        </Typography>
        <Typography variant="body2">
          {(() => {
            const inds = (dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos')
            const criticos = inds.filter(i => i.valor < i.meta * 0.9).length
            const proximas = inds.filter(i => i.valor >= i.meta * 0.9 && i.valor < i.meta).length
            const atingidas = inds.filter(i => i.valor >= i.meta).length
            return `Atingidas: ${atingidas}, Atenção: ${proximas}, Críticas: ${criticos}.`
          })()}
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
                <MenuItem value="medicos">Médicos</MenuItem>
                <MenuItem value="enfermagem">Enfermagem</MenuItem>
                <MenuItem value="administrativo">Administrativo</MenuItem>
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
                <People sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Indicadores RH
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonAdd sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Metas atingidas
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const inds = (dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos')
                  return inds.filter(i => i.valor >= i.meta).length
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Críticos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const inds = (dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos')
                  return inds.filter(i => i.valor < i.meta * 0.9).length
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonRemove sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Atenção
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const inds = (dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos')
                  return inds.filter(i => i.valor >= i.meta * 0.9 && i.valor < i.meta).length
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Última atualização
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(() => {
                  const inds = (dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos')
                  const dt = inds[0]?.ultimaAtualizacao
                  return dt ? new Date(dt).toLocaleDateString('pt-BR') : '-'
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Funcionários por Categoria */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Funcionários por Categoria Profissional
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Vagas Abertas</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Absenteísmo (%)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Ocupação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos').map(i => ({
                  categoria: i.nome,
                  total: i.valor,
                  vagas: 0,
                  absenteismo: 0,
                  status: (i.valor >= i.meta) ? 'success' : (i.valor >= (i.meta || 0) * 0.9) ? 'warning' : 'error'
                })).map((indicador, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {indicador.categoria}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {indicador.total}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {indicador.vagas}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: indicador.absenteismo > 4 ? '#dc3545' : '#28a745'
                        }}
                      >
                        {indicador.absenteismo}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={getStatusText(indicador.status)}
                        color={getStatusColor(indicador.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ width: 150 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(indicador.total / (indicador.total + indicador.vagas)) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: indicador.status === 'success' ? '#28a745' :
                                           indicador.status === 'warning' ? '#ffc107' : '#dc3545'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {Math.round((indicador.total / (indicador.total + indicador.vagas)) * 100)}% ocupado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Comparativo Valor x Meta */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                RH: Valor x Meta
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={{
                    labels: (dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos').map(i => i.nome),
                    datasets: [
                      { label: 'Valor', data: (dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos').map(i => i.valor), backgroundColor: 'rgba(25, 118, 210, 0.8)' },
                      { label: 'Meta', data: (dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos').map(i => i.meta), backgroundColor: 'rgba(220, 53, 69, 0.8)' }
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
              <Box sx={{ height: 300 }}>
                <Doughnut 
                  data={{
                    labels: ['Atingiu Meta', 'Próxima da Meta', 'Abaixo da Meta'],
                    datasets: [{
                      data: (() => {
                        const inds = (dados?.indicadores || []).filter(i => i.categoria === 'recursos_humanos')
                        const atingidas = inds.filter(i => i.valor >= i.meta).length
                        const proximas = inds.filter(i => i.valor < i.meta && i.valor >= i.meta * 0.9).length
                        const criticas = inds.length - atingidas - proximas
                        return [atingidas, proximas, criticas]
                      })(),
                      backgroundColor: ['#4caf50', '#ff9800', '#f44336']
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

export default IndicadoresRH
