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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const BookingSuccessPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get booking data from location state
  const { bookingId, bookingData } = location.state || {};
  
  // Debug: Log the received booking data
  console.log('BookingSuccessPage received data:', { bookingId, bookingData });
  
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
  
  // Format timeslot for display
  const formatTimeslot = (timeslotStr) => {
    // Handle different formats of timeslot data
    if (typeof timeslotStr === 'string') {
      // If it's a string like "10:00-10:30", split it
      const [start, end] = timeslotStr.split('-');
      return `${start} - ${end}`;
    } else if (timeslotStr && timeslotStr.startTime && timeslotStr.endTime) {
      // If it's an object with startTime and endTime properties
      return `${timeslotStr.startTime} - ${timeslotStr.endTime}`;
    }
    return '';
  };
  
  // Extract timeslots from bookingData, handling different formats
  const timeslots = bookingData.selectedTimeslots || bookingData.timeslots || [];
  
  // Extract karts from bookingData, handling different formats
  const karts = bookingData.kartSelections || bookingData.karts || [];
  
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
        <Typography variant="body2" color="text.secondary">
          {t('booking_reference')}: <strong>{bookingId}</strong>
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('booking_details')}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('date')}
                </Typography>
                <Typography variant="body1">
                  {bookingData.date ? bookingData.date.split('T')[0] : bookingData.date}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
              {t('timeslots_and_karts', 'Timeslots and Karts')}
            </Typography>
            
            {/* If we have selectedTimeslots array, display each timeslot with its karts */}
            {Array.isArray(timeslots) && timeslots.length > 0 ? (
              timeslots.map((timeslot, index) => {
                // Format the timeslot for display
                const formattedTimeslot = formatTimeslot(timeslot);
                
                // Get the timeslot key (for looking up kart selections)
                let timeslotKey = '';
                if (typeof timeslot === 'string') {
                  timeslotKey = timeslot;
                } else if (timeslot && timeslot.startTime && timeslot.endTime) {
                  timeslotKey = `${timeslot.startTime}-${timeslot.endTime}`;
                }
                
                // Find karts for this specific timeslot
                let timeslotKarts = [];
                
                // Check if we have per-timeslot kart data
                if (Array.isArray(karts)) {
                  // First try to find karts with matching timeslot property
                  timeslotKarts = karts.filter(kart => 
                    kart.timeslot === timeslotKey
                  );
                  
                  // If no karts found and this is the first timeslot, show all karts without timeslot property
                  if (timeslotKarts.length === 0 && index === 0) {
                    timeslotKarts = karts.filter(kart => !kart.timeslot);
                    
                    // If still no karts found, show all karts for the first timeslot
                    if (timeslotKarts.length === 0) {
                      timeslotKarts = karts;
                    }
                  }
                }
                
                console.log(`Timeslot ${timeslotKey} has ${timeslotKarts.length} karts:`, timeslotKarts);
                
                return (
                  <Card key={`timeslot-${index}`} sx={{ mb: 2, border: '1px solid #eee' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6">
                          {formattedTimeslot}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                        {t('karts_for_this_timeslot', 'Karts for this timeslot')}:
                      </Typography>
                      
                      {timeslotKarts.length > 0 ? (
                        <List dense>
                          {timeslotKarts.map((kart, kartIndex) => {
                            // Handle different kart data structures
                            const kartName = kart.name || 
                              (kart.kart && typeof kart.kart === 'object' ? kart.kart.name : 
                               (typeof kart.kart === 'string' ? 
                                 // Try to find the kart name from the original booking data
                                 (bookingData.originalBookingData && 
                                  bookingData.originalBookingData.karts && 
                                  bookingData.originalBookingData.karts.find(k => k.id === kart.kart)?.name) || 
                                 'Kart' : 'Kart'));
                            const quantity = kart.quantity || 1;
                            const price = kart.price || kart.pricePerSlot || 0;
                            
                            return (
                              <ListItem key={`kart-${kartIndex}`}>
                                <ListItemIcon>
                                  <DirectionsCarIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={`${kartName} x ${quantity}`} 
                                  secondary={price ? `${(price * quantity).toFixed(2)} €` : ''}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {t('no_karts_selected', 'No karts selected')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // Fallback display if no timeslots array
              <Card sx={{ mb: 2, border: '1px solid #eee' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {bookingData.startTime && bookingData.endTime 
                        ? `${bookingData.startTime} - ${bookingData.endTime}` 
                        : 'Time not specified'}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                    {t('karts_for_this_timeslot', 'Karts for this timeslot')}:
                  </Typography>
                  
                  {Array.isArray(karts) && karts.length > 0 ? (
                    <List dense>
                      {karts.map((kart, kartIndex) => {
                        // Handle different kart data structures
                        const kartName = kart.name || 
                          (kart.kart && typeof kart.kart === 'object' ? kart.kart.name : 
                           (typeof kart.kart === 'string' ? 
                             // Try to find the kart name from the original booking data
                             (bookingData.originalBookingData && 
                              bookingData.originalBookingData.karts && 
                              bookingData.originalBookingData.karts.find(k => k.id === kart.kart)?.name) || 
                             'Kart' : 'Kart'));
                        const quantity = kart.quantity || 1;
                        const price = kart.price || kart.pricePerSlot || 0;
                        
                        return (
                          <ListItem key={`kart-${kartIndex}`}>
                            <ListItemIcon>
                              <DirectionsCarIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`${kartName} x ${quantity}`} 
                              secondary={price ? `${(price * quantity).toFixed(2)} €` : ''}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('no_karts_selected', 'No karts selected')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
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
        
        <Grid item xs={12}>
          <Typography variant="h6" align="right">
            {t('total')}: {bookingData.totalPrice ? bookingData.totalPrice.toFixed(2) : '0.00'} €
          </Typography>
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

export default BookingSuccessPage;
