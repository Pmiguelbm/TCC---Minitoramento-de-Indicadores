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
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Notifications,
  NotificationsOff,
  Settings,
  Delete,
  Edit,
  Add,
  FilterList,
  Refresh,
  TrendingDown,
  TrendingUp,
  Schedule,
  Assignment,
  ChevronLeft,
  ChevronRight,
  PlayArrow
} from '@mui/icons-material'
import axios from 'axios'


function Alertas() {
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [filtroLido, setFiltroLido] = useState('todos')
  const [dialogConfig, setDialogConfig] = useState(false)
  const [configSelecionada, setConfigSelecionada] = useState(null)
  const [carrosselIndex, setCarrosselIndex] = useState(0)
  const [novaConfig, setNovaConfig] = useState({
    nome: '',
    categoria: '',
    condicao: '',
    tipo: 'aviso',
    ativo: true,
    email: true,
    sms: false
  })
  const [configs, setConfigs] = useState([])
  const [lidos, setLidos] = useState([])

  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await axios.get('/indicadores.json', { headers: { 'Cache-Control': 'no-cache' } })
        setDados(res.data)
      } catch (e) {
        setError('Falha ao carregar alertas reais, exibindo dados de demonstração')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('alertConfigs')
      if (saved) setConfigs(JSON.parse(saved))
      const readIds = localStorage.getItem('alertReadIds')
      if (readIds) setLidos(JSON.parse(readIds))
    } catch {}
  }, [])

  const parseCondicao = (cond) => {
    const m = (cond || '').match(/(<=|>=|<|>|==|=)\s*([0-9]+(?:[.,][0-9]+)?)/)
    if (!m) return null
    const op = m[1]
    const num = parseFloat(m[2].replace(',', '.'))
    return { op, num }
  }

  const mapCategoriaKey = (cat) => {
    if (cat === 'Epidemiológico') return 'epidemiologico'
    if (cat === 'Produção') return 'producao'
    if (cat === 'Financeiro') return 'financeiro'
    if (cat === 'RH') return 'recursos_humanos'
    if (cat === 'Meta') return 'meta'
    return null
  }

  const avaliarConfigs = () => {
    const inds = dados?.indicadores || []
    const out = []
    configs.filter(c => c.ativo && c.categoria && c.condicao && c.tipo).forEach((cfg) => {
      const parsed = parseCondicao(cfg.condicao)
      if (!parsed) return
      const catKey = mapCategoriaKey(cfg.categoria)
      const lista = catKey === 'meta' ? inds : inds.filter(i => i.categoria === catKey)
      lista.forEach((i, idx) => {
        const valorBase = catKey === 'meta' ? (i.meta ? (i.valor / i.meta * 100) : null) : i.valor
        if (valorBase == null) return
        const v = Number(valorBase)
        const n = parsed.num
        const ok = parsed.op === '<' ? v < n
          : parsed.op === '<=' ? v <= n
          : parsed.op === '>' ? v > n
          : parsed.op === '>=' ? v >= n
          : v === n
        if (ok) {
          out.push({
            id: `cfg-${cfg.id}-${i.id || idx}`,
            titulo: cfg.nome || `Regra ${cfg.id}`,
            mensagem: `${i.nome}: ${catKey === 'meta' ? Math.round((v)*100)/100 + '%' : v} ${cfg.condicao}`,
            nivel_criticidade: cfg.tipo === 'critico' ? 'critico' : cfg.tipo === 'aviso' ? 'alto' : 'baixo',
            tipo: 'valor_critico',
            categoria: cfg.categoria,
            data_referencia: new Date().toISOString().split('T')[0],
            resolvido: false,
            responsavel: 'Coordenação de Saúde',
            acoes_sugeridas: ['Verificar situação'],
            canais: { email: !!cfg.email, sms: !!cfg.sms }
          })
        }
      })
    })
    return out
  }

  const transformarAlerta = (alerta) => ({
    ...alerta,
    tipo: alerta.nivel_criticidade ? (alerta.nivel_criticidade === 'critico' ? 'critico' : alerta.nivel_criticidade === 'alto' ? 'aviso' : 'informativo') : (alerta.nivel === 'critico' ? 'critico' : alerta.nivel === 'alto' ? 'aviso' : 'informativo'),
    categoria: alerta.categoria ? alerta.categoria : (alerta.tipo === 'meta_nao_atingida' ? 'Meta' : alerta.tipo === 'valor_critico' ? 'Epidemiológico' : alerta.tipo === 'tendencia_negativa' ? 'Produção' : 'Financeiro'),
    descricao: alerta.mensagem || alerta.descricao,
    dataHora: (alerta.data_referencia || alerta.dataReferencia || new Date().toISOString().split('T')[0]) + 'T10:00:00',
    lido: (lidos.includes(alerta.id)) ? true : (alerta.resolvido || false),
    responsavel: alerta.responsavel || 'Coordenação de Saúde',
    acao: alerta.acoes_sugeridas ? alerta.acoes_sugeridas[0] : 'Verificar situação'
  })

  const alertasOriginais = (dados?.alertas || []).map(transformarAlerta)
  const alertasGerados = avaliarConfigs().map(transformarAlerta)
  const alertasAtivos = [...alertasOriginais, ...alertasGerados]

  const resumoAlertas = {
    total: alertasAtivos.length,
    criticos: alertasAtivos.filter(a => a.nivel === 'critico').length,
    avisos: alertasAtivos.filter(a => a.nivel === 'alto' || a.nivel === 'medio').length,
    informativos: alertasAtivos.filter(a => a.nivel === 'baixo').length,
    naoLidos: alertasAtivos.filter(a => !a.resolvido).length
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'critico': return 'error'
      case 'aviso': return 'warning'
      case 'informativo': return 'info'
      default: return 'default'
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'critico': return <Error sx={{ color: '#dc3545' }} />
      case 'aviso': return <Warning sx={{ color: '#ffc107' }} />
      case 'informativo': return <Info sx={{ color: '#17a2b8' }} />
      default: return <Info />
    }
  }

  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case 'Meta': return <Assignment />
      case 'Financeiro': return <TrendingUp />
      case 'Produção': return <TrendingDown />
      case 'RH': return <Schedule />
      case 'Epidemiológico': return <Warning />
      case 'Sistema': return <Settings />
      default: return <Info />
    }
  }

  const formatarDataHora = (dataHora) => {
    return new Date(dataHora).toLocaleString('pt-BR')
  }

  const handleAbrirConfig = (config = null) => {
    if (config) {
      setConfigSelecionada(config)
      setNovaConfig(config)
    } else {
      setConfigSelecionada(null)
      setNovaConfig({
        nome: '',
        categoria: '',
        condicao: '',
        tipo: 'aviso',
        ativo: true,
        email: true,
        sms: false
      })
    }
    setDialogConfig(true)
  }

  const handleFecharConfig = () => {
    setDialogConfig(false)
    setConfigSelecionada(null)
    if (novaConfig && novaConfig.nome) {
      setConfigs(prev => {
        const next = configSelecionada
          ? prev.map(c => c.id === configSelecionada.id ? { ...novaConfig, id: configSelecionada.id } : c)
          : [...prev, { ...novaConfig, id: Date.now() }]
        try { localStorage.setItem('alertConfigs', JSON.stringify(next)) } catch {}
        return next
      })
    }
  }

  const toggleLido = (id) => {
    setLidos(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try { localStorage.setItem('alertReadIds', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const toggleAtivoConfig = (config) => {
    setConfigs(prev => {
      const next = prev.map(c => c.id === config.id ? { ...c, ativo: !c.ativo } : c)
      try { localStorage.setItem('alertConfigs', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const excluirConfig = (id) => {
    setConfigs(prev => {
      const next = prev.filter(c => c.id !== id)
      try { localStorage.setItem('alertConfigs', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const proximoCard = () => {
    setCarrosselIndex((prevIndex) => 
      prevIndex === alertasAtivos.length - 1 ? 0 : prevIndex + 1
    )
  }

  const cardAnterior = () => {
    setCarrosselIndex((prevIndex) => 
      prevIndex === 0 ? alertasAtivos.length - 1 : prevIndex - 1
    )
  }

  const irParaCard = (index) => {
    setCarrosselIndex(index)
  }

  const alertasFiltrados = alertasAtivos.filter(alerta => {
    if (filtroTipo !== 'todos' && alerta.tipo !== filtroTipo) return false
    if (filtroCategoria !== 'todos' && alerta.categoria !== filtroCategoria) return false
    if (filtroLido === 'lidos' && !alerta.lido) return false
    if (filtroLido === 'nao-lidos' && alerta.lido) return false
    return true
  })

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Central de Alertas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitoramento de alertas automáticos e configurações de notificação
        </Typography>
      </Box>

      {/* Carrossel de Alertas */}
      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', height: 300 }}>
            {/* Card do Alerta Atual */}
            {alertasAtivos.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: alertasAtivos[carrosselIndex].nivel === 'critico' 
                    ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                    : alertasAtivos[carrosselIndex].nivel === 'alto'
                    ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                    : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 4
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getTipoIcon(alertasAtivos[carrosselIndex].tipo)}
                  <Chip 
                    label={alertasAtivos[carrosselIndex].categoria}
                    sx={{ 
                      ml: 2, 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {alertasAtivos[carrosselIndex].titulo}
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  {alertasAtivos[carrosselIndex].mensagem}
                </Typography>
                
                {alertasAtivos[carrosselIndex].acoes_sugeridas && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Ações Sugeridas:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {alertasAtivos[carrosselIndex].acoes_sugeridas.slice(0, 2).map((acao, index) => (
                        <Chip 
                          key={index}
                          label={acao}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            color: 'white'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {formatarDataHora(alertasAtivos[carrosselIndex].dataHora)}
                </Typography>
              </Box>
            )}

            {/* Botões de Navegação */}
            <IconButton
              onClick={cardAnterior}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={proximoCard}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              <ChevronRight />
            </IconButton>

            {/* Indicadores de Posição */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1
              }}
            >
              {alertasAtivos.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => irParaCard(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: index === carrosselIndex 
                      ? 'white' 
                      : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Cards de Resumo Estatístico */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total de Alertas
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {resumoAlertas.total}
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
                  Críticos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {resumoAlertas.criticos}
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
                  Avisos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {resumoAlertas.avisos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Badge badgeContent={resumoAlertas.naoLidos} color="error">
                  <Info sx={{ mr: 1 }} />
                </Badge>
                <Typography variant="body2" sx={{ opacity: 0.9, ml: 1 }}>
                  Não Lidos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {resumoAlertas.naoLidos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros e Ações */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filtroTipo}
                  label="Tipo"
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="critico">Críticos</MenuItem>
                  <MenuItem value="aviso">Avisos</MenuItem>
                  <MenuItem value="informativo">Informativos</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={filtroCategoria}
                  label="Categoria"
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <MenuItem value="todos">Todas</MenuItem>
                  <MenuItem value="Meta">Metas</MenuItem>
                  <MenuItem value="Financeiro">Financeiro</MenuItem>
                  <MenuItem value="Produção">Produção</MenuItem>
                  <MenuItem value="RH">Recursos Humanos</MenuItem>
                  <MenuItem value="Epidemiológico">Epidemiológico</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroLido}
                  label="Status"
                  onChange={(e) => setFiltroLido(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="lidos">Lidos</MenuItem>
                  <MenuItem value="nao-lidos">Não Lidos</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                size="small"
              >
                Atualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<Settings />}
                size="small"
                onClick={() => handleAbrirConfig()}
              >
                Configurar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Lista de Alertas */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Alertas Ativos ({alertasFiltrados.length})
          </Typography>
          
          {alertasFiltrados.length === 0 ? (
            <Alert severity="info">
              Nenhum alerta encontrado com os filtros selecionados.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Alerta</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Responsável</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Data/Hora</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alertasFiltrados.map((alerta) => (
                    <TableRow 
                      key={alerta.id} 
                      hover
                      sx={{ 
                        backgroundColor: !alerta.lido ? 'rgba(25, 118, 210, 0.04)' : 'inherit',
                        borderLeft: !alerta.lido ? '4px solid #1976d2' : 'none'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getTipoIcon(alerta.tipo)}
                          <Chip 
                            label={alerta.tipo.charAt(0).toUpperCase() + alerta.tipo.slice(1)}
                            color={getTipoColor(alerta.tipo)}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getCategoriaIcon(alerta.categoria)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {alerta.categoria}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: !alerta.lido ? 600 : 400 }}>
                            {alerta.titulo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alerta.descricao}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {alerta.responsavel}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatarDataHora(alerta.dataHora)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={alerta.lido ? 'Lido' : 'Não Lido'}
                          color={alerta.lido ? 'success' : 'primary'}
                          size="small"
                          variant={alerta.lido ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={alerta.lido ? 'Desmarcar como lido' : 'Marcar como lido'}>
                          <IconButton size="small" onClick={() => toggleLido(alerta.id)}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Alertas */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Configurações de Alertas
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={() => handleAbrirConfig()}
            >
              Nova Configuração
            </Button>
          </Box>
          
          <List>
            {configs.map((config) => (
              <ListItem key={config.id} divider>
                <ListItemIcon>
                  {config.ativo ? 
                    <Notifications color="primary" /> : 
                    <NotificationsOff color="disabled" />
                  }
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {config.nome}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {config.condicao}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          label={config.categoria}
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          label={config.tipo}
                          color={getTipoColor(config.tipo)}
                          size="small"
                        />
                        {config.email && (
                          <Chip label="Email" size="small" color="info" variant="outlined" />
                        )}
                        {config.sms && (
                          <Chip label="SMS" size="small" color="success" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch 
                      checked={config.ativo}
                      size="small"
                      onChange={() => toggleAtivoConfig(config)}
                    />
                    <IconButton 
                      size="small"
                      onClick={() => handleAbrirConfig(config)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => excluirConfig(config.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Dialog de Configuração */}
      <Dialog open={dialogConfig} onClose={handleFecharConfig} maxWidth="md" fullWidth>
        <DialogTitle>
          {configSelecionada ? 'Editar Configuração' : 'Nova Configuração de Alerta'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Configuração"
                value={novaConfig.nome}
                onChange={(e) => setNovaConfig({...novaConfig, nome: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={novaConfig.categoria}
                  label="Categoria"
                  onChange={(e) => setNovaConfig({...novaConfig, categoria: e.target.value})}
                >
                  <MenuItem value="Meta">Metas</MenuItem>
                  <MenuItem value="Financeiro">Financeiro</MenuItem>
                  <MenuItem value="Produção">Produção</MenuItem>
                  <MenuItem value="RH">Recursos Humanos</MenuItem>
                  <MenuItem value="Epidemiológico">Epidemiológico</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Alerta</InputLabel>
                <Select
                  value={novaConfig.tipo}
                  label="Tipo de Alerta"
                  onChange={(e) => setNovaConfig({...novaConfig, tipo: e.target.value})}
                >
                  <MenuItem value="informativo">Informativo</MenuItem>
                  <MenuItem value="aviso">Aviso</MenuItem>
                  <MenuItem value="critico">Crítico</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Condição do Alerta"
                value={novaConfig.condicao}
                onChange={(e) => setNovaConfig({...novaConfig, condicao: e.target.value})}
                placeholder="Ex: Cobertura vacinal < 90%"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Notificações
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={novaConfig.ativo}
                    onChange={(e) => setNovaConfig({...novaConfig, ativo: e.target.checked})}
                  />
                }
                label="Alerta Ativo"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={novaConfig.email}
                    onChange={(e) => setNovaConfig({...novaConfig, email: e.target.checked})}
                  />
                }
                label="Notificação por Email"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={novaConfig.sms}
                    onChange={(e) => setNovaConfig({...novaConfig, sms: e.target.checked})}
                  />
                }
                label="Notificação por SMS"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharConfig}>Cancelar</Button>
          <Button variant="contained" onClick={handleFecharConfig}>
            {configSelecionada ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Alertas
