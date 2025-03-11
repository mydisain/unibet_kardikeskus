import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as KartIcon,
  CalendarToday as BookingIcon,
  Settings as SettingsIcon,
  People as UsersIcon,
  Person as ProfileIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { logout } from '../../redux/slices/authSlice';
import { getSettings } from '../../redux/slices/settingSlice';

const drawerWidth = 240;

const AdminLayout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { settings } = useSelector((state) => state.settings);
  
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };
  
  const menuItems = [
    {
      text: t('dashboard'),
      icon: <DashboardIcon />,
      path: '/admin',
    },
    {
      text: t('karts'),
      icon: <KartIcon />,
      path: '/admin/karts',
    },
    {
      text: t('bookings'),
      icon: <BookingIcon />,
      path: '/admin/bookings',
    },
    {
      text: t('settings'),
      icon: <SettingsIcon />,
      path: '/admin/settings',
    },
    {
      text: t('users'),
      icon: <UsersIcon />,
      path: '/admin/users',
    },
  ];
  
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {settings?.businessName ? `${settings.businessName}` : t('admin_panel')}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#343a40',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {settings?.businessName ? `${settings.businessName} - ${t('admin')}` : t('karts')}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }} />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem
              onClick={() => {
                navigate('/admin/profile');
                handleProfileMenuClose();
              }}
            >
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('profile')}</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('logout')}</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#7367F0',
              color: '#ffffff',
            },
            '& .MuiListItemIcon-root': {
              color: '#ffffff',
            },
            '& .MuiDivider-root': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#7367F0',
              color: '#ffffff',
            },
            '& .MuiListItemIcon-root': {
              color: '#ffffff',
            },
            '& .MuiDivider-root': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;
