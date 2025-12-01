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
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert
} from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Download, FilterList } from '@mui/icons-material'
import axios from 'axios'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const mockData = null

function IndicadoresEpidemiologicos() {
  const [filtroTempo, setFiltroTempo] = useState('6meses')
  const [filtroRegiao, setFiltroRegiao] = useState('todas')
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await axios.get('/indicadores.json', { headers: { 'Cache-Control': 'no-cache' } })
        setDados(res.data)
      } catch (e) {
        setError('Falha ao carregar dados reais, exibindo dados de demonstração')
      } finally {
        setLoading(false)
      }
    }
    carregarDados()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'critical': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Meta Atingida'
      case 'warning': return 'Atenção'
      case 'critical': return 'Crítico'
      default: return 'Normal'
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false
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
      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>Carregando dados reais...</Alert>
      )}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Indicadores Epidemiológicos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitoramento de indicadores de saúde populacional e vigilância epidemiológica
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterList color="action" />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={filtroTempo}
                label="Período"
                onChange={(e) => setFiltroTempo(e.target.value)}
              >
                <MenuItem value="3meses">Últimos 3 meses</MenuItem>
                <MenuItem value="6meses">Últimos 6 meses</MenuItem>
                <MenuItem value="1ano">Último ano</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Região</InputLabel>
              <Select
                value={filtroRegiao}
                label="Região"
                onChange={(e) => setFiltroRegiao(e.target.value)}
              >
                <MenuItem value="todas">Todas as regiões</MenuItem>
                <MenuItem value="centro">Centro</MenuItem>
                <MenuItem value="norte">Norte</MenuItem>
                <MenuItem value="sul">Sul</MenuItem>
                <MenuItem value="leste">Leste</MenuItem>
                <MenuItem value="oeste">Oeste</MenuItem>
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

      {/* Alertas */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Atenção: Incidência de Dengue acima da meta
        </Typography>
        <Typography variant="body2">
          A incidência de dengue está 50% acima da meta estabelecida. Recomenda-se intensificar as ações de controle vetorial.
        </Typography>
      </Alert>

      {/* Tabela de Indicadores */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Resumo dos Indicadores
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Indicador</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Valor Atual</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Meta</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Tendência</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Última Atualização</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(dados?.indicadores || []).filter(i => i.categoria === 'epidemiologico').map((indicador, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {indicador.nome}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {indicador.valor}{indicador.unidade || '%'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {indicador.meta}{indicador.unidade || '%'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {(() => {
                        const dir = indicador.direcao_meta || 'maior_melhor'
                        const success = dir === 'menor_melhor' ? (indicador.valor <= indicador.meta) : (indicador.valor >= indicador.meta)
                        const warning = dir === 'menor_melhor' ? (indicador.valor > indicador.meta && indicador.valor <= indicador.meta * 1.1) : (indicador.valor < indicador.meta && indicador.valor >= (indicador.meta || 0) * 0.9)
                        const status = success ? 'success' : (warning ? 'warning' : 'critical')
                        return (
                          <Chip 
                            label={getStatusText(status)}
                            color={getStatusColor(status)}
                            size="small"
                          />
                        )
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body2"
                        sx={{
                          color: '#6c757d'
                        }}
                      >
                        {'-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {new Date(indicador.ultimaAtualizacao || new Date().toISOString()).toLocaleDateString('pt-BR')}
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
      <Grid container spacing={3}>
        {/* Evolução Temporal */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Evolução Temporal dos Indicadores
              </Typography>
              <Box sx={{ height: 400 }}>
                <Bar 
                  data={{
                    labels: (dados?.indicadores || []).filter(i => i.categoria === 'epidemiologico').map(i => i.nome),
                    datasets: [
                      { label: 'Valor', data: (dados?.indicadores || []).filter(i => i.categoria === 'epidemiologico').map(i => i.valor), backgroundColor: 'rgba(25, 118, 210, 0.8)' },
                      { label: 'Meta', data: (dados?.indicadores || []).filter(i => i.categoria === 'epidemiologico').map(i => i.meta), backgroundColor: 'rgba(220, 53, 69, 0.8)' }
                    ]
                  }}
                  options={chartOptions}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribuição Territorial */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Distribuição por Região
              </Typography>
              <Box sx={{ height: 400 }}>
                <Doughnut 
                  data={{
                    labels: ['Atingiu Meta', 'Próxima da Meta', 'Abaixo da Meta'],
                    datasets: [{
                      data: (() => {
                        const inds = (dados?.indicadores || []).filter(i => i.categoria === 'epidemiologico')
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

export default IndicadoresEpidemiologicos
