import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material'
import {
  Settings,
  Notifications,
  Security,
  Storage,
  Palette,
  Language,
  Schedule,
  Email,
  Sms,
  Edit,
  Delete,
  Add,
  Save,
  Refresh,
  Download,
  Upload,
  Person,
  Group,
  AdminPanelSettings,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import axios from 'axios'

/*
  configuracaoSistema: {
    nomeInstituicao: 'Secretaria Municipal de Saúde',
    cidade: 'Município Exemplo',
    estado: 'Estado Exemplo',
    cnpj: '12.345.678/0001-90',
    telefone: '(11) 1234-5678',
    email: 'saude@municipio.gov.br',
    endereco: 'Rua da Saúde, 123 - Centro',
    logoUrl: '/logo-municipio.png'
  },
  usuarios: [
    {
      id: 1,
      nome: 'Ana Clara Silva',
      email: 'ana.clara@saude.gov.br',
      perfil: 'Administrador',
      departamento: 'Coordenação Geral',
      ativo: true,
      ultimoAcesso: '2024-01-15T10:30:00'
    },
    {
      id: 2,
      nome: 'Carlos Santos',
      email: 'carlos.santos@saude.gov.br',
      perfil: 'Gestor',
      departamento: 'Atenção Básica',
      ativo: true,
      ultimoAcesso: '2024-01-15T09:15:00'
    },
    {
      id: 3,
      nome: 'Maria Oliveira',
      email: 'maria.oliveira@saude.gov.br',
      perfil: 'Analista',
      departamento: 'Vigilância Epidemiológica',
      ativo: true,
      ultimoAcesso: '2024-01-14T16:45:00'
    },
    {
      id: 4,
      nome: 'João Pereira',
      email: 'joao.pereira@saude.gov.br',
      perfil: 'Visualizador',
      departamento: 'Financeiro',
      ativo: false,
      ultimoAcesso: '2024-01-10T14:20:00'
    }
  ],
  perfisAcesso: [
    {
      id: 1,
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema',
      permissoes: ['criar', 'editar', 'excluir', 'visualizar', 'configurar'],
      usuarios: 1
    },
    {
      id: 2,
      nome: 'Gestor',
      descricao: 'Acesso de gestão aos módulos',
      permissoes: ['criar', 'editar', 'visualizar'],
      usuarios: 3
    },
    {
      id: 3,
      nome: 'Analista',
      descricao: 'Acesso para análise e edição',
      permissoes: ['editar', 'visualizar'],
      usuarios: 5
    },
    {
      id: 4,
      nome: 'Visualizador',
      descricao: 'Apenas visualização',
      permissoes: ['visualizar'],
      usuarios: 8
    }
  ]
*/

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function Configuracoes() {
  const [tabAtiva, setTabAtiva] = useState(0)
  const [dialogUsuario, setDialogUsuario] = useState(false)
  const [dialogPerfil, setDialogPerfil] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [perfilSelecionado, setPerfilSelecionado] = useState(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [instituicao, setInstituicao] = useState({
    nomeInstituicao: '',
    cidade: '',
    estado: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    logoUrl: ''
  })
  const [usuarios, setUsuarios] = useState([])
  const [perfis, setPerfis] = useState([])
  const [configuracoes, setConfiguracoes] = useState({
    notificacoes: {
      email: true,
      sms: false,
      push: true,
      frequencia: 'imediata'
    },
    sistema: {
      tema: 'claro',
      idioma: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      autoSave: true,
      sessionTimeout: 30
    },
    seguranca: {
      senhaComplexidade: true,
      autenticacao2FA: false,
      logAuditoria: true,
      tentativasLogin: 3
    }
  })
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    perfil: '',
    departamento: '',
    senha: '',
    ativo: true
  })

  const handleTabChange = (event, newValue) => {
    setTabAtiva(newValue)
  }

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await axios.get('/indicadores.json', { headers: { 'Cache-Control': 'no-cache' } })
        const d = res.data || {}
        if (d.configuracaoSistema || d.instituicao) {
          setInstituicao(d.configuracaoSistema || d.instituicao)
        }
        if (Array.isArray(d.usuarios)) setUsuarios(d.usuarios)
        if (Array.isArray(d.perfisAcesso)) setPerfis(d.perfisAcesso)
      } catch (e) {
      }
    }
    carregar()
  }, [])

  useEffect(() => {
    try {
      const inst = localStorage.getItem('instituicao')
      if (inst) setInstituicao(JSON.parse(inst))
      const us = localStorage.getItem('usuarios')
      if (us) setUsuarios(JSON.parse(us))
      const pf = localStorage.getItem('perfis')
      if (pf) setPerfis(JSON.parse(pf))
      const cfg = localStorage.getItem('configuracoes')
      if (cfg) setConfiguracoes(JSON.parse(cfg))
    } catch {}
  }, [])

  const handleAbrirUsuario = (usuario = null) => {
    if (usuario) {
      setUsuarioSelecionado(usuario)
      setNovoUsuario({
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        departamento: usuario.departamento,
        senha: '',
        ativo: usuario.ativo
      })
    } else {
      setUsuarioSelecionado(null)
      setNovoUsuario({
        nome: '',
        email: '',
        perfil: '',
        departamento: '',
        senha: '',
        ativo: true
      })
    }
    setDialogUsuario(true)
  }

  const handleFecharUsuario = () => {
    setDialogUsuario(false)
    setUsuarioSelecionado(null)
  }

  const getPerfilColor = (perfil) => {
    switch (perfil) {
      case 'Administrador': return 'error'
      case 'Gestor': return 'warning'
      case 'Analista': return 'info'
      case 'Visualizador': return 'success'
      default: return 'default'
    }
  }

  const formatarUltimoAcesso = (dataHora) => {
    return new Date(dataHora).toLocaleString('pt-BR')
  }

  const handleSalvarInstituicao = () => {
    try { localStorage.setItem('instituicao', JSON.stringify(instituicao)) } catch {}
  }

  const handleRestaurarInstituicao = () => {
    setInstituicao({
      nomeInstituicao: '',
      cidade: '',
      estado: '',
      cnpj: '',
      telefone: '',
      email: '',
      endereco: '',
      logoUrl: ''
    })
  }

  const handleSalvarUsuario = () => {
    setUsuarios((prev) => {
      if (usuarioSelecionado) {
        const next = prev.map((u) =>
          u.id === usuarioSelecionado.id
            ? {
                ...u,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                perfil: novoUsuario.perfil,
                departamento: novoUsuario.departamento,
                ativo: novoUsuario.ativo
              }
            : u
        )
        try { localStorage.setItem('usuarios', JSON.stringify(next)) } catch {}
        return next
      }
      const novo = {
        id: Date.now(),
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,
        departamento: novoUsuario.departamento,
        ativo: novoUsuario.ativo,
        ultimoAcesso: new Date().toISOString()
      }
      const next = [...prev, novo]
      try { localStorage.setItem('usuarios', JSON.stringify(next)) } catch {}
      return next
    })
    handleFecharUsuario()
  }

  const handleExcluirUsuario = (id) => {
    setUsuarios((prev) => {
      const next = prev.filter(u => u.id !== id)
      try { localStorage.setItem('usuarios', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const handleSalvarConfiguracoes = () => {
    try { localStorage.setItem('configuracoes', JSON.stringify(configuracoes)) } catch {}
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Configurações do Sistema
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie configurações gerais, usuários e permissões do sistema
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabAtiva} onChange={handleTabChange}>
            <Tab icon={<Settings />} label="Geral" />
            <Tab icon={<Notifications />} label="Notificações" />
            <Tab icon={<Group />} label="Usuários" />
            <Tab icon={<AdminPanelSettings />} label="Perfis" />
            <Tab icon={<Security />} label="Segurança" />
            <Tab icon={<Storage />} label="Sistema" />
          </Tabs>
        </Box>

        {/* Aba Geral */}
        <TabPanel value={tabAtiva} index={0}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Informações da Instituição
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome da Instituição"
                value={instituicao.nomeInstituicao}
                margin="normal"
                onChange={(e) => setInstituicao({ ...instituicao, nomeInstituicao: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CNPJ"
                value={instituicao.cnpj}
                margin="normal"
                onChange={(e) => setInstituicao({ ...instituicao, cnpj: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cidade"
                value={instituicao.cidade}
                margin="normal"
                onChange={(e) => setInstituicao({ ...instituicao, cidade: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estado"
                value={instituicao.estado}
                margin="normal"
                onChange={(e) => setInstituicao({ ...instituicao, estado: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={instituicao.telefone}
                margin="normal"
                onChange={(e) => setInstituicao({ ...instituicao, telefone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={instituicao.email}
                margin="normal"
                onChange={(e) => setInstituicao({ ...instituicao, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Endereço"
                value={instituicao.endereco}
                margin="normal"
                onChange={(e) => setInstituicao({ ...instituicao, endereco: e.target.value })}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<Save />} onClick={handleSalvarInstituicao}>
              Salvar Alterações
            </Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={handleRestaurarInstituicao}>
              Restaurar
            </Button>
          </Box>
        </TabPanel>

        {/* Aba Notificações */}
        <TabPanel value={tabAtiva} index={1}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Configurações de Notificação
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Canais de Notificação
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText primary="Email" secondary="Notificações por email" />
                      <ListItemSecondaryAction>
                        <Switch 
                          checked={configuracoes.notificacoes.email}
                          onChange={(e) => setConfiguracoes({
                            ...configuracoes,
                            notificacoes: {
                              ...configuracoes.notificacoes,
                              email: e.target.checked
                            }
                          })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Sms />
                      </ListItemIcon>
                      <ListItemText primary="SMS" secondary="Notificações por SMS" />
                      <ListItemSecondaryAction>
                        <Switch 
                          checked={configuracoes.notificacoes.sms}
                          onChange={(e) => setConfiguracoes({
                            ...configuracoes,
                            notificacoes: {
                              ...configuracoes.notificacoes,
                              sms: e.target.checked
                            }
                          })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Notifications />
                      </ListItemIcon>
                      <ListItemText primary="Push" secondary="Notificações push no navegador" />
                      <ListItemSecondaryAction>
                        <Switch 
                          checked={configuracoes.notificacoes.push}
                          onChange={(e) => setConfiguracoes({
                            ...configuracoes,
                            notificacoes: {
                              ...configuracoes.notificacoes,
                              push: e.target.checked
                            }
                          })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Frequência
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Frequência de Notificações</InputLabel>
                    <Select
                      value={configuracoes.notificacoes.frequencia}
                      label="Frequência de Notificações"
                      onChange={(e) => setConfiguracoes({
                        ...configuracoes,
                        notificacoes: {
                          ...configuracoes.notificacoes,
                          frequencia: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="imediata">Imediata</MenuItem>
                      <MenuItem value="diaria">Diária</MenuItem>
                      <MenuItem value="semanal">Semanal</MenuItem>
                      <MenuItem value="mensal">Mensal</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Alertas críticos sempre serão enviados imediatamente, independente da configuração.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<Save />} onClick={handleSalvarConfiguracoes}>
              Salvar Configurações
            </Button>
          </Box>
        </TabPanel>

        {/* Aba Usuários */}
        <TabPanel value={tabAtiva} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Gerenciamento de Usuários
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleAbrirUsuario()}
            >
              Novo Usuário
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Usuário</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Perfil</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Departamento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Último Acesso</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {usuario.nome.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {usuario.nome}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {usuario.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.perfil}
                        color={getPerfilColor(usuario.perfil)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {usuario.departamento}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatarUltimoAcesso(usuario.ultimoAcesso)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.ativo ? 'Ativo' : 'Inativo'}
                        color={usuario.ativo ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small"
                        onClick={() => handleAbrirUsuario(usuario)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleExcluirUsuario(usuario.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Aba Perfis */}
        <TabPanel value={tabAtiva} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Perfis de Acesso
            </Typography>
            <Button variant="contained" startIcon={<Add />}>
              Novo Perfil
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {perfis.map((perfil) => (
              <Grid item xs={12} md={6} key={perfil.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {perfil.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {perfil.descricao}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Permissões:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {perfil.permissoes.map((permissao) => (
                        <Chip 
                          key={permissao}
                          label={permissao}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {perfil.usuarios} usuário(s) com este perfil
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Aba Segurança */}
        <TabPanel value={tabAtiva} index={4}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Configurações de Segurança
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Políticas de Senha
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Complexidade de Senha"
                        secondary="Exigir senhas complexas (maiúsculas, minúsculas, números e símbolos)"
                      />
                      <ListItemSecondaryAction>
                        <Switch 
                          checked={configuracoes.seguranca.senhaComplexidade}
                          onChange={(e) => setConfiguracoes({
                            ...configuracoes,
                            seguranca: {
                              ...configuracoes.seguranca,
                              senhaComplexidade: e.target.checked
                            }
                          })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText 
                        primary="Autenticação de Dois Fatores"
                        secondary="Exigir segundo fator de autenticação"
                      />
                      <ListItemSecondaryAction>
                        <Switch 
                          checked={configuracoes.seguranca.autenticacao2FA}
                          onChange={(e) => setConfiguracoes({
                            ...configuracoes,
                            seguranca: {
                              ...configuracoes.seguranca,
                              autenticacao2FA: e.target.checked
                            }
                          })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  
                  <TextField
                    fullWidth
                    type="number"
                    label="Máximo de Tentativas de Login"
                    value={configuracoes.seguranca.tentativasLogin}
                    margin="normal"
                    inputProps={{ min: 1, max: 10 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Auditoria e Logs
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Log de Auditoria"
                        secondary="Registrar todas as ações dos usuários"
                      />
                      <ListItemSecondaryAction>
                        <Switch 
                          checked={configuracoes.seguranca.logAuditoria}
                          onChange={(e) => setConfiguracoes({
                            ...configuracoes,
                            seguranca: {
                              ...configuracoes.seguranca,
                              logAuditoria: e.target.checked
                            }
                          })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" startIcon={<Download />} fullWidth>
                      Exportar Logs de Auditoria
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<Save />} onClick={handleSalvarConfiguracoes}>
              Salvar Configurações
            </Button>
          </Box>
        </TabPanel>

        {/* Aba Sistema */}
        <TabPanel value={tabAtiva} index={5}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Configurações do Sistema
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Interface
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Tema</InputLabel>
                    <Select
                      value={configuracoes.sistema.tema}
                      label="Tema"
                      onChange={(e) => setConfiguracoes({
                        ...configuracoes,
                        sistema: {
                          ...configuracoes.sistema,
                          tema: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="claro">Claro</MenuItem>
                      <MenuItem value="escuro">Escuro</MenuItem>
                      <MenuItem value="auto">Automático</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Idioma</InputLabel>
                    <Select
                      value={configuracoes.sistema.idioma}
                      label="Idioma"
                      onChange={(e) => setConfiguracoes({
                        ...configuracoes,
                        sistema: {
                          ...configuracoes.sistema,
                          idioma: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                      <MenuItem value="en-US">English (US)</MenuItem>
                      <MenuItem value="es-ES">Español</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Sessão e Performance
                  </Typography>
                  
                  <TextField
                    fullWidth
                    type="number"
                    label="Timeout da Sessão (minutos)"
                    value={configuracoes.sistema.sessionTimeout}
                    margin="normal"
                    inputProps={{ min: 5, max: 480 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={configuracoes.sistema.autoSave}
                        onChange={(e) => setConfiguracoes({
                          ...configuracoes,
                          sistema: {
                            ...configuracoes.sistema,
                            autoSave: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Salvamento Automático"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Backup e Manutenção
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button variant="outlined" startIcon={<Download />} fullWidth>
                        Backup Completo
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button variant="outlined" startIcon={<Upload />} fullWidth>
                        Restaurar Backup
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button variant="outlined" startIcon={<Refresh />} fullWidth>
                        Limpar Cache
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button variant="outlined" startIcon={<Storage />} fullWidth>
                        Otimizar BD
                      </Button>
                    </Grid>
                  </Grid>
                  
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Operações de manutenção podem afetar a performance do sistema temporariamente.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<Save />} onClick={handleSalvarConfiguracoes}>
              Salvar Configurações
            </Button>
          </Box>
        </TabPanel>
      </Card>

      {/* Dialog de Usuário */}
      <Dialog open={dialogUsuario} onClose={handleFecharUsuario} maxWidth="md" fullWidth>
        <DialogTitle>
          {usuarioSelecionado ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={novoUsuario.nome}
                onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Perfil de Acesso</InputLabel>
                <Select
                  value={novoUsuario.perfil}
                  label="Perfil de Acesso"
                  onChange={(e) => setNovoUsuario({...novoUsuario, perfil: e.target.value})}
                >
                  <MenuItem value="Administrador">Administrador</MenuItem>
                  <MenuItem value="Gestor">Gestor</MenuItem>
                  <MenuItem value="Analista">Analista</MenuItem>
                  <MenuItem value="Visualizador">Visualizador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departamento"
                value={novoUsuario.departamento}
                onChange={(e) => setNovoUsuario({...novoUsuario, departamento: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={usuarioSelecionado ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                type={mostrarSenha ? 'text' : 'password'}
                value={novoUsuario.senha}
                onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      edge="end"
                    >
                      {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={novoUsuario.ativo}
                    onChange={(e) => setNovoUsuario({...novoUsuario, ativo: e.target.checked})}
                  />
                }
                label="Usuário Ativo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharUsuario}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvarUsuario}>
            {usuarioSelecionado ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Configuracoes
