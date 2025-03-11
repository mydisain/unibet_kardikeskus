import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Snackbar,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Import booking-related actions
import { getAvailableTimeslots, createBooking } from '../../redux/slices/bookingSlice';
import { getKarts } from '../../redux/slices/kartSlice';

const DashboardPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // State for booking functionality
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [kartDialogOpen, setKartDialogOpen] = useState(false);
  const [currentTimeslot, setCurrentTimeslot] = useState(null);
  const [selectedKarts, setSelectedKarts] = useState([]);
  const [kartQuantities, setKartQuantities] = useState({});
  
  // Customer information state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Get timeslots and karts from Redux store
  const { timeslots: availableTimeslots, loading: timeslotsLoading, error: timeslotsError, success: bookingSuccess, loading: bookingLoading } = useSelector((state) => state.bookings);
  const { karts, loading: kartsLoading, error: kartsError } = useSelector((state) => state.karts);
  
  // Fetch available timeslots when date changes
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      dispatch(getAvailableTimeslots(formattedDate))
        .unwrap()
        .then(result => {
          console.log('Available timeslots:', result);
        });
    }
  }, [selectedDate, dispatch]);
  
  // Fetch karts when component mounts
  useEffect(() => {
    dispatch(getKarts());
  }, [dispatch]);
  
  // Format timeslot for display
  const formatTimeslot = (startTime, endTime) => {
    return `${startTime} - ${endTime}`;
  };
  
  // Handle timeslot selection
  const handleTimeslotSelect = (timeslot) => {
    // Find the selected timeslot object
    const foundTimeslot = availableTimeslots.find(t => t.startTime === timeslot);
    
    if (!foundTimeslot) {
      console.error('Timeslot not found:', timeslot);
      return;
    }
    
    // Create a new object with all properties from the original timeslot
    const selectedTimeslotObj = { ...foundTimeslot };
    
    // Calculate duration in minutes
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMinutes = parseTime(selectedTimeslotObj.startTime);
    const endMinutes = parseTime(selectedTimeslotObj.endTime);
    
    // Handle case where end time is on the next day
    const durationMinutes = endMinutes < startMinutes 
      ? (24 * 60) - startMinutes + endMinutes 
      : endMinutes - startMinutes;
      
    // Add the duration to our new object
    selectedTimeslotObj.durationMinutes = durationMinutes;
    
    console.log('Selected timeslot with duration:', selectedTimeslotObj);
    setCurrentTimeslot(selectedTimeslotObj);
    setKartDialogOpen(true);
  };
  
  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Handle kart selection
  const handleKartSelect = (kartId, isSelected) => {
    if (isSelected) {
      setSelectedKarts([...selectedKarts, kartId]);
      // Initialize quantity to 1
      setKartQuantities(prev => ({ ...prev, [kartId]: 1 }));
    } else {
      setSelectedKarts(selectedKarts.filter(id => id !== kartId));
      // Remove quantity
      const newQuantities = { ...kartQuantities };
      delete newQuantities[kartId];
      setKartQuantities(newQuantities);
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (kartId, quantity) => {
    setKartQuantities(prev => ({
      ...prev,
      [kartId]: quantity
    }));
  };
  
  // Handle kart dialog close
  const handleKartDialogClose = () => {
    setKartDialogOpen(false);
    setSelectedKarts([]);
    setKartQuantities({});
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
  };
  
  // Handle kart dialog confirm
  const handleKartDialogConfirm = () => {
    // Validate customer information
    if (!customerName || !customerPhone) {
      alert(t('please_fill_required_fields'));
      return;
    }
    
    // Create booking
    const booking = {
      date: selectedDate.toISOString().split('T')[0],
      startTime: currentTimeslot.startTime,
      endTime: currentTimeslot.endTime,
      // Ensure duration is a number in minutes
      duration: parseInt(currentTimeslot.durationMinutes || 30, 10),
      kartSelections: selectedKarts.map(kartId => {
        const kart = karts.find(k => k._id === kartId);
        return {
          kart: kartId,
          quantity: kartQuantities[kartId] || 1,
          pricePerSlot: kart ? parseFloat(kart.pricePerSlot || 0) : 0
        };
      }),
      // Calculate totalPrice to avoid NaN on the server
      totalPrice: selectedKarts.reduce((total, kartId) => {
        const kart = karts.find(k => k._id === kartId);
        const quantity = kartQuantities[kartId] || 1;
        const price = kart && kart.pricePerSlot ? parseFloat(kart.pricePerSlot) : 0;
        return total + (price * quantity);
      }, 0),
      customerName,
      customerEmail,
      customerPhone
    };
    
    // Ensure we have a valid duration and totalPrice
    if (!booking.duration || isNaN(booking.duration)) {
      booking.duration = 30; // Default to 30 minutes if calculation failed
    }
    
    if (isNaN(booking.totalPrice)) {
      booking.totalPrice = 0; // Default to 0 if calculation failed
    }
    
    console.log('Sending booking data:', booking);
    
    // Dispatch the createBooking action
    dispatch(createBooking(booking))
      .unwrap()
      .then(() => {
        // Close dialog and reset form
        setKartDialogOpen(false);
        setSelectedKarts([]);
        setKartQuantities({});
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        
        // Refresh timeslots for the selected date
        const formattedDate = selectedDate.toISOString().split('T')[0];
        dispatch(getAvailableTimeslots(formattedDate));
        
        // Show success notification
        setNotification({
          open: true,
          message: t('booking_created_successfully'),
          severity: 'success'
        });
      })
      .catch((error) => {
        // Show error notification
        setNotification({
          open: true,
          message: t('booking_creation_failed', { error: error.toString() }),
          severity: 'error'
        });
      });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('dashboard')}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {t('create_booking')}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {/* Date Picker */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('select_date')}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Box>
        
        {/* Timeslot Selection */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('select_time')}
          </Typography>
          
          {timeslotsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : timeslotsError ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {timeslotsError}
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {availableTimeslots && availableTimeslots.length > 0 ? (
                availableTimeslots.map((timeslot) => (
                  <Grid item xs={6} sm={4} md={3} key={timeslot.startTime}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={() => handleTimeslotSelect(timeslot.startTime)}
                      sx={{ 
                        py: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                      }}
                    >
                      <Box>{formatTimeslot(timeslot.startTime, timeslot.endTime)}</Box>
                      <Box 
                        sx={{ 
                          fontSize: '0.75rem', 
                          mt: 1,
                          color: 'rgba(0, 0, 0, 0.6)' 
                        }}
                      >
                        {t('available_places')}: {timeslot.kartAvailability.reduce((total, kart) => total + kart.available, 0)}
                      </Box>
                    </Button>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">
                    {t('no_available_timeslots')}
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </Paper>
      
      {/* Kart Selection Dialog with Customer Details */}
      <Dialog
        open={kartDialogOpen}
        onClose={handleKartDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('select_karts_for_timeslot', { timeslot: currentTimeslot ? formatTimeslot(
            currentTimeslot.startTime || '',
            currentTimeslot.endTime || ''
          ) : '' })}
        </DialogTitle>
        <DialogContent>
          {kartsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : kartsError ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {kartsError}
            </Alert>
          ) : (
            <>
              {/* Customer Information Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('customer_details')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label={t('customer_name')}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label={t('customer_phone')}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('customer_email')}
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      margin="normal"
                      type="email"
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Kart Selection Section */}
              <Typography variant="h6" gutterBottom>
                {t('select_karts')}
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {karts && karts.map((kart) => {
                  // Get availability for this kart in the current timeslot
                  const timeslotObj = currentTimeslot ? availableTimeslots.find(t => t.startTime === currentTimeslot) : null;
                  const kartAvailability = timeslotObj?.kartAvailability?.find(k => k._id === kart._id);
                  const availableQuantity = kartAvailability?.available || 0;
                  const maxAvailable = Math.min(availableQuantity, kart.quantity || 1);
                  
                  return (
                    <Grid item xs={12} key={kart._id}>
                      <Paper
                        sx={{
                          p: 3,
                          border: selectedKarts.includes(kart._id) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                          '&:hover': {
                            boxShadow: 3,
                          },
                        }}
                      >
                        <Box 
                          onClick={() => handleKartSelect(kart._id, !selectedKarts.includes(kart._id))} 
                          sx={{ cursor: availableQuantity > 0 ? 'pointer' : 'not-allowed' }}
                        >
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6">{kart.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {kart.description}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="subtitle1">
                                {t('price')}: {kart.pricePerSlot} €
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('available')}: {availableQuantity}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>{t('quantity')}:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // If kart is selected and quantity > 1, decrease quantity
                                      if (selectedKarts.includes(kart._id) && kartQuantities[kart._id] > 1) {
                                        handleQuantityChange(kart._id, kartQuantities[kart._id] - 1);
                                      } else if (selectedKarts.includes(kart._id) && kartQuantities[kart._id] === 1) {
                                        // If quantity is 1, deselect the kart
                                        handleKartSelect(kart._id, false);
                                      }
                                    }}
                                    disabled={!selectedKarts.includes(kart._id) || kartQuantities[kart._id] <= 0}
                                  >
                                    -
                                  </Button>
                                  <Typography sx={{ mx: 1 }}>
                                    {selectedKarts.includes(kart._id) ? (kartQuantities[kart._id] || 1) : 0}
                                  </Typography>
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // If kart is not selected, select it with quantity 1
                                      if (!selectedKarts.includes(kart._id)) {
                                        handleKartSelect(kart._id, true);
                                      }
                                      // If kart is already selected, increase quantity if possible
                                      else if (kartQuantities[kart._id] < maxAvailable) {
                                        handleQuantityChange(kart._id, kartQuantities[kart._id] + 1);
                                      }
                                    }}
                                    disabled={selectedKarts.includes(kart._id) && kartQuantities[kart._id] >= Math.min(availableQuantity, kart.quantity || 1) || availableQuantity <= 0}
                                  >
                                    +
                                  </Button>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleKartDialogClose}>
            {t('cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleKartDialogConfirm}
            disabled={selectedKarts.length === 0}
          >
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DashboardPage;
