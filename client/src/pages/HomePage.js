import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { getSettings } from '../redux/slices/settingSlice';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SpeedIcon from '@mui/icons-material/Speed';

const HomePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.settings);
  
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);
  
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          {settings?.businessName || t('karts')}
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          {t('home_page_description')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/booking"
          sx={{ mt: 4 }}
        >
          Book Now
        </Button>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <DirectionsCarIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                {t('multiple_kart_types')}
              </Typography>
              <Typography>
                {t('kart_types_description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventAvailableIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                {t('easy_booking')}
              </Typography>
              <Typography>
                {t('easy_booking_description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SpeedIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                {t('exciting_experience')}
              </Typography>
              <Typography>
                {t('exciting_experience_description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      {/* Call to Action */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('ready_to_book')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/booking"
          sx={{ mt: 2 }}
        >
          {t('book_now')}
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;
