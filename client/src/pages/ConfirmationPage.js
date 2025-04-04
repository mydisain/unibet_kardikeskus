import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
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
  TextField,
  FormControl,
  FormHelperText,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { format } from 'date-fns';

// Import the createBooking action
import { createBooking } from '../redux/slices/bookingSlice';
import { getSettings } from '../redux/slices/settingSlice';

const ConfirmationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get booking data from location state
  const { bookingData } = location.state || {};
  
  // Get booking and settings state from Redux
  const { loading, error, success, booking } = useSelector((state) => state.bookings);
  const { settings } = useSelector((state) => state.settings);
  
  // Load settings when component mounts
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
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
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('name_required');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('invalid_email');
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('phone_required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Extract the first timeslot for start/end time
      const firstTimeslot = bookingData.timeslots[0] || {};
      const lastTimeslot = bookingData.timeslots[bookingData.timeslots.length - 1] || {};
      
      // Calculate duration in minutes
      const duration = bookingData.timeslots.length * (settings?.timeslotDuration || 30);
      
      let kartSelections = [];
      
      // Check if we have per-timeslot kart selections
      if (bookingData.timeslotKartSelections && bookingData.timeslotKartQuantities) {
        console.log('Using per-timeslot kart selections');
        
        // Create a map of all karts for easy lookup
        const kartMap = {};
        bookingData.karts.forEach(kart => {
          kartMap[kart.id] = kart;
        });
        
        // Format timeslots as strings (e.g., "10:00-10:30")
        const formattedTimeslots = bookingData.timeslots.map(timeslot => {
          const timeslotKey = `${timeslot.startTime}-${timeslot.endTime}`;
          const timeslotSelections = bookingData.timeslotKartSelections[timeslotKey] || [];
          const timeslotQuantities = bookingData.timeslotKartQuantities[timeslotKey] || {};
          
          // Add kart selections for this timeslot
          timeslotSelections.forEach(kartId => {
            const kart = kartMap[kartId];
            if (kart) {
              kartSelections.push({
                kart: kartId,
                quantity: timeslotQuantities[kartId] || 1,
                pricePerSlot: kart.price,
                timeslot: timeslotKey
              });
            }
          });
          
          return timeslotKey;
        });
        
        console.log('Formatted timeslots for booking:', formattedTimeslots);
        console.log('Per-timeslot kart selections:', kartSelections);
        
        console.log('Preparing booking data with the following timeslot kart selections:');
        console.log('Timeslots:', formattedTimeslots);
        console.log('TimeslotKartSelections:', bookingData.timeslotKartSelections);
        console.log('TimeslotKartQuantities:', bookingData.timeslotKartQuantities);
        
        // Calculate total price based on per-timeslot selections
        const totalPrice = kartSelections.reduce((total, selection) => 
          total + (selection.pricePerSlot * selection.quantity), 0
        );
        
        // Prepare complete booking data
        const completeBookingData = {
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          date: bookingData.date || format(new Date(), 'yyyy-MM-dd'),
          startTime: firstTimeslot.startTime,
          endTime: lastTimeslot.endTime,
          duration: duration,
          selectedTimeslots: formattedTimeslots,
          kartSelections: kartSelections,
          timeslotKartSelections: bookingData.timeslotKartSelections,
          timeslotKartQuantities: bookingData.timeslotKartQuantities,
          totalPrice: totalPrice,
          notes: formData.notes,
          status: 'confirmed'
        };
        
        // Dispatch the createBooking action to save the booking to the database
        dispatch(createBooking(completeBookingData))
          .unwrap()
          .then((result) => {
            // Log the complete booking data for debugging
            console.log('Booking created successfully:', result);
            console.log('Complete booking data being passed to success page:', {
              bookingId: result._id,
              bookingData: {
                ...result,
                // Ensure we pass the timeslots and karts data in a format the success page can use
                selectedTimeslots: formattedTimeslots,
                kartSelections: kartSelections,
                // Include the original booking data for reference
                originalBookingData: bookingData
              }
            });
            
            // Navigate to success page with the booking ID from the response
            navigate('/booking-success', { 
              state: { 
                bookingId: result._id,
                bookingData: {
                  ...result,
                  // Ensure we pass the timeslots and karts data in a format the success page can use
                  selectedTimeslots: formattedTimeslots,
                  kartSelections: kartSelections,
                  // Include the original booking data for reference
                  originalBookingData: bookingData
                }
              } 
            });
          })
          .catch((error) => {
            console.error('Booking creation failed:', error);
            // You could set an error state here to display to the user
          });
      } else {
        // Fallback to the original code for backward compatibility
        console.log('Using legacy kart selection method');
        
        // Format kart selections as expected by the server
        const kartSelections = bookingData.karts.map(kart => ({
          kart: kart.id, // Reference to the kart ID
          quantity: kart.quantity,
          pricePerSlot: kart.price
        }));
        
        // Format timeslots as strings (e.g., "10:00-10:30")
        const formattedTimeslots = bookingData.timeslots.map(timeslot => 
          `${timeslot.startTime}-${timeslot.endTime}`
        );
        
        console.log('Formatted timeslots for booking:', formattedTimeslots);
        
        // Calculate total price
        const totalPrice = bookingData.karts.reduce((total, kart) => 
          total + (kart.price * kart.quantity * bookingData.timeslots.length), 0
        );
        
        // Prepare complete booking data
        const completeBookingData = {
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          date: bookingData.date || format(new Date(), 'yyyy-MM-dd'),
          startTime: firstTimeslot.startTime,
          endTime: lastTimeslot.endTime,
          duration: duration,
          selectedTimeslots: formattedTimeslots,
          kartSelections: kartSelections,
          totalPrice: totalPrice,
          notes: formData.notes,
          status: 'confirmed'
        };
        
        // Dispatch the createBooking action to save the booking to the database
        dispatch(createBooking(completeBookingData))
          .unwrap()
          .then((result) => {
            // Log the complete booking data for debugging
            console.log('Booking created successfully:', result);
            console.log('Complete booking data being passed to success page:', {
              bookingId: result._id,
              bookingData: {
                ...result,
                // Ensure we pass the timeslots and karts data in a format the success page can use
                selectedTimeslots: formattedTimeslots,
                kartSelections: kartSelections,
                // Include the original booking data for reference
                originalBookingData: bookingData
              }
            });
            
            // Navigate to success page with the booking ID from the response
            navigate('/booking-success', { 
              state: { 
                bookingId: result._id,
                bookingData: {
                  ...result,
                  // Ensure we pass the timeslots and karts data in a format the success page can use
                  selectedTimeslots: formattedTimeslots,
                  kartSelections: kartSelections,
                  // Include the original booking data for reference
                  originalBookingData: bookingData
                }
              } 
            });
          })
          .catch((error) => {
            console.error('Booking creation failed:', error);
            // You could set an error state here to display to the user
          });
      }
    }
  };
  
  // Format timeslot for display
  const formatTimeslot = (startTime, endTime) => {
    return `${startTime} - ${endTime}`;
  };
  
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        {t('your_details')}
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('selected_timeslots')}
        </Typography>
        
        {bookingData.timeslots.map((timeslot, index) => {
          const timeslotKey = `${timeslot.startTime}-${timeslot.endTime}`;
          const timeslotSelections = bookingData.timeslotKartSelections?.[timeslotKey] || [];
          const timeslotQuantities = bookingData.timeslotKartQuantities?.[timeslotKey] || {};
          
          // Get karts for this specific timeslot
          const timeslotKarts = timeslotSelections.map(kartId => {
            const kart = bookingData.karts.find(k => k.id === kartId);
            return kart ? {
              ...kart,
              quantity: timeslotQuantities[kartId] || 1
            } : null;
          }).filter(Boolean);
          
          return (
            <Box key={`timeslot-${index}`} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {formatTimeslot(timeslot.startTime, timeslot.endTime)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                    {t('karts_for_this_timeslot', 'Karts for this timeslot')}:
                  </Typography>
                  
                  {bookingData.timeslotKartSelections ? (
                    // Display karts specific to this timeslot
                    timeslotKarts.length > 0 ? (
                      <List dense>
                        {timeslotKarts.map((kart, kartIndex) => (
                          <ListItem key={`kart-${kartIndex}`}>
                            <ListItemIcon>
                              <DirectionsCarIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`${kart.name} x ${kart.quantity}`} 
                              secondary={`${(kart.price * kart.quantity).toFixed(2)} €`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('no_karts_selected')}
                      </Typography>
                    )
                  ) : (
                    // Legacy display for backward compatibility
                    <List dense>
                      {bookingData.karts.map((kart, kartIndex) => (
                        <ListItem key={`kart-${kartIndex}`}>
                          <ListItemIcon>
                            <DirectionsCarIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${kart.name} x ${kart.quantity}`} 
                            secondary={`${(kart.price * kart.quantity).toFixed(2)} €`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>
              </Grid>
            </Box>
          );
        })}
        
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6" align="right">
            {t('total')}: {bookingData.karts.reduce((total, kart) => total + (kart.price * kart.quantity * bookingData.timeslots.length), 0).toFixed(2)} €
          </Typography>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('enter_your_details')}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.name}>
                <TextField
                  label={t('name')}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  error={!!errors.name}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.email}>
                <TextField
                  label={t('email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  error={!!errors.email}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.phone}>
                <TextField
                  label={t('phone')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  error={!!errors.phone}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                {errors.phone && <FormHelperText>{errors.phone}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label={t('notes')}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/booking')}
              >
                {t('back')}
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : t('confirm_booking')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ConfirmationPage;
