import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const ConfirmationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get booking data from location state
  const { bookingId, bookingData } = location.state || {};
  
  // If no booking data, show error
  if (!bookingData) {
    return (
      <Container maxWidth="md" sx={{ my: 8 }}>
        <Alert severity="error">
          <AlertTitle>{t('error')}</AlertTitle>
          {t('booking_data_not_found')}
        </Alert>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
          >
            {t('return_home')}
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <CheckCircleOutlineIcon 
          color="success" 
          sx={{ fontSize: 64, mb: 2 }} 
        />
        <Typography variant="h4" component="h1" gutterBottom>
          {t('booking_confirmed')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {t('booking_confirmation_message')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('booking_reference')}: <strong>{bookingId}</strong>
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('booking_details')}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('date')}
                </Typography>
                <Typography variant="body1">
                  {bookingData.date}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('time')}
                </Typography>
                <Typography variant="body1">
                  {bookingData.timeslot}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <DirectionsCarIcon sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('karts')}
                </Typography>
                <Typography variant="body1">
                  {bookingData.karts && bookingData.karts.map(kart => kart.name).join(', ')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          {t('your_details')}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('name')}
                </Typography>
                <Typography variant="body1">
                  {bookingData.customerName}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('email')}
                </Typography>
                <Typography variant="body1">
                  {bookingData.customerEmail}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('phone')}
                </Typography>
                <Typography variant="body1">
                  {bookingData.customerPhone}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {bookingData.notes && (
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('notes')}
                </Typography>
                <Typography variant="body1">
                  {bookingData.notes}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          {t('return_home')}
        </Button>
        <Button 
          variant="outlined"
          onClick={() => window.print()}
        >
          {t('print_confirmation')}
        </Button>
      </Box>
    </Container>
  );
};

export default ConfirmationPage;
