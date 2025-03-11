import React, { useEffect } from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { getSettings } from '../../redux/slices/settingSlice';

const Footer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.settings);
  
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' '}
          <Link color="inherit" href="/">
            {settings?.businessName || t('karts')}
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
