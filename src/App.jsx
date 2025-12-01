import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp
} from '@mui/icons-material'

// Importar componentes das páginas
import Dashboard from './components/Dashboard'
import IndicadoresEpidemiologicos from './components/IndicadoresEpidemiologicos'
import AnaliseEstatistica from './components/AnaliseEstatistica'
import IndicadoresProducao from './components/IndicadoresProducao'
import IndicadoresFinanceiros from './components/IndicadoresFinanceiros'
import IndicadoresRH from './components/IndicadoresRH'
import MetasPAS from './components/MetasPAS'
import Alertas from './components/Alertas'
import Configuracoes from './components/Configuracoes'

const drawerWidth = 280

// Dados mockados para demonstração
const mockUser = {
  nome: 'Dr. João Silva',
  cargo: 'Secretário de Saúde',
  avatar: '/avatar.jpg'
}

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    color: '#1976d2'
  },
  {
    text: 'Epidemiológicos',
    icon: <BarChartIcon />,
    path: '/epidemiologicos',
    color: '#dc3545'
  },
  {
    text: 'Análise Estatística',
    icon: <TrendingUpIcon />,
    path: '/analise',
    color: '#9c27b0'
  },
  {
    text: 'Produção',
    icon: <TrendingUpIcon />,
    path: '/producao',
    color: '#28a745'
  },
  {
    text: 'Financeiros',
    icon: <AttachMoneyIcon />,
    path: '/financeiros',
    color: '#ffc107'
  },
  {
    text: 'Recursos Humanos',
    icon: <PeopleIcon />,
    path: '/recursos-humanos',
    color: '#17a2b8'
  },
  {
    text: 'Metas PAS/PMS',
    icon: <AssignmentIcon />,
    path: '/metas-pas',
    color: '#6f42c1'
  }
]

function App() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [alertasCount, setAlertasCount] = useState(3) // Mock de alertas
  const [currentPath, setCurrentPath] = useState('/')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [window.location.pathname])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    // Implementar logout
    console.log('Logout')
    handleProfileMenuClose()
  }

  const drawer = (
    <Box>
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          SMS - Monitoramento
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Indicadores de Saúde
        </Typography>
      </Box>
      
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component="a"
              href={item.path}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                backgroundColor: currentPath === item.path ? `${item.color}15` : 'transparent',
                borderLeft: currentPath === item.path ? `4px solid ${item.color}` : 'none',
                '&:hover': {
                  backgroundColor: `${item.color}10`,
                }
              }}
            >
              <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: currentPath === item.path ? 600 : 400,
                  color: currentPath === item.path ? item.color : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="/alertas"
            sx={{ mx: 1, borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Badge badgeContent={alertasCount} color="error">
                <NotificationsIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Alertas" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="/configuracoes"
            sx={{ mx: 1, borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configurações" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === currentPath)?.text || 'Dashboard'}
          </Typography>
          
          <IconButton
            color="inherit"
            component="a"
            href="/alertas"
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={alertasCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">{mockUser.nome}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {mockUser.cargo}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Configurações
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid #e0e0e0'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/epidemiologicos" element={<IndicadoresEpidemiologicos />} />
          <Route path="/analise" element={<AnaliseEstatistica />} />
          <Route path="/producao" element={<IndicadoresProducao />} />
          <Route path="/financeiros" element={<IndicadoresFinanceiros />} />
          <Route path="/recursos-humanos" element={<IndicadoresRH />} />
          <Route path="/metas-pas" element={<MetasPAS />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App