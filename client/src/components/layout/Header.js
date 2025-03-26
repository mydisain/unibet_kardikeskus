import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { getSettings } from '../../redux/slices/settingSlice';

const Header = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.settings);
  
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);
  return (
    <AppBar position="static" sx={{ bgcolor: '#343a40' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <DirectionsCarIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
            {settings?.businessName || 'KART BOOKING'}
          </Typography>

          {/* Admin button removed as users don't need admin rights to make bookings */}
          <RouterLink to="/admin/login">Admin Login</RouterLink>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
