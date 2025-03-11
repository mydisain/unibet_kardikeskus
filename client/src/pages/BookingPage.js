import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { et } from 'date-fns/locale';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Import actions
import { getAvailableTimeslots, createBooking } from '../redux/slices/bookingSlice';
import { getKarts } from '../redux/slices/kartSlice';
import { getSettings } from '../redux/slices/settingSlice';

// Define steps using translation keys
const getSteps = (t) => [t('select_date_and_time'), t('your_details')];

const BookingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get translated steps
  const steps = getSteps(t);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeslots, setSelectedTimeslots] = useState([]);
  const [selectedKarts, setSelectedKarts] = useState([]);
  const [kartQuantities, setKartQuantities] = useState({});
  
  // Dialog state
  const [kartDialogOpen, setKartDialogOpen] = useState(false);
  const [currentTimeslot, setCurrentTimeslot] = useState(null);
  const [initialKartSelection, setInitialKartSelection] = useState(null);
  const [maxRideDuration, setMaxRideDuration] = useState(60); // Default 60 minutes
  
  const { 
    timeslots: availableTimeslots = [], 
    loading: timeslotsLoading, 
    error: timeslotsError 
  } = useSelector((state) => state.bookings) || {};
  
  const { 
    karts = [], 
    loading: kartsLoading, 
    error: kartsError 
  } = useSelector((state) => state.karts) || {};
  
  const {
    settings,
    loading: settingsLoading
  } = useSelector((state) => state.settings) || {};
  
  // Fetch available timeslots when component mounts and when date changes
  useEffect(() => {
    dispatch(getAvailableTimeslots(format(selectedDate, 'yyyy-MM-dd')));
  }, [dispatch, selectedDate]);
  
  // Fetch karts when component mounts
  useEffect(() => {
    dispatch(getKarts());
  }, [dispatch]);
  
  // Fetch settings when component mounts
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);
  
  // Update maxRideDuration when settings are loaded
  useEffect(() => {
    if (settings && settings.maxMinutesPerSession) {
      setMaxRideDuration(settings.maxMinutesPerSession);
    }
  }, [settings]);
  
  // Reset kart selections when dialog opens or closes
  useEffect(() => {
    // When dialog opens and we have initial selection
    if (kartDialogOpen && selectedTimeslots.length > 0 && initialKartSelection) {
      // Only set if not already set
      if (selectedKarts.length === 0) {
        setSelectedKarts(initialKartSelection.karts);
        setKartQuantities(initialKartSelection.quantities);
      }
    }
    // When dialog closes, reset selections if no timeslots are selected
    if (!kartDialogOpen && selectedTimeslots.length === 0) {
      setSelectedKarts([]);
      setKartQuantities({});
    }
  }, [kartDialogOpen, selectedTimeslots.length, initialKartSelection, selectedKarts.length]);
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedTimeslots([]);
    setSelectedKarts([]);
    setKartQuantities({});
    setInitialKartSelection(null);
  };
  
  // Calculate total duration of selected timeslots in minutes
  const calculateTotalDuration = (timeslots) => {
    if (!timeslots || timeslots.length === 0) return 0;
    
    return timeslots.reduce((total, timeslotStartTime) => {
      const timeslot = availableTimeslots.find(t => t.startTime === timeslotStartTime);
      if (!timeslot) return total;
      
      // Calculate duration in minutes
      const [startHour, startMinute] = timeslot.startTime.split(':').map(Number);
      const [endHour, endMinute] = timeslot.endTime.split(':').map(Number);
      const duration = ((endHour - startHour) * 60) + (endMinute - startMinute);
      
      return total + duration;
    }, 0);
  };
  
  // Check if a timeslot is in the past
  const isTimeslotInPast = (timeslotStartTime) => {
    // Get the timeslot object
    const timeslot = availableTimeslots.find(t => t.startTime === timeslotStartTime);
    if (!timeslot) return true; // If not found, consider it in the past
    
    // For today, check if the timeslot's start time is in the past
    const today = new Date();
    const selectedDay = new Date(selectedDate);
    
    // If selected date is in the future, timeslot is not in the past
    if (selectedDay.getDate() !== today.getDate() || 
        selectedDay.getMonth() !== today.getMonth() || 
        selectedDay.getFullYear() !== today.getFullYear()) {
      return false;
    }
    
    // For today, compare the timeslot's start time with current time
    const [startHour, startMinute] = timeslot.startTime.split(':').map(Number);
    const now = new Date();
    
    // Create a date object for the timeslot's start time today
    const timeslotDate = new Date();
    timeslotDate.setHours(startHour, startMinute, 0, 0);
    
    // Return true if the timeslot's start time is in the past
    return timeslotDate < now;
  };
  
  const handleTimeslotSelect = (timeslot) => {
    // Check if the timeslot is in the past
    if (isTimeslotInPast(timeslot)) {
      alert(t('timeslot_in_past'));
      return;
    }
    
    // Check if adding this timeslot would exceed the maximum ride duration
    const newSelectedTimeslots = [...selectedTimeslots, timeslot].sort();
    const totalDuration = calculateTotalDuration(newSelectedTimeslots);
    
    if (totalDuration > maxRideDuration) {
      alert(`${t('max_ride_duration_exceeded')} ${maxRideDuration} ${t('minutes')}`);
      return;
    }
    
    // Set the current timeslot and open the dialog
    setCurrentTimeslot(timeslot);
    setKartDialogOpen(true);
  };
  
  const handleKartDialogClose = () => {
    setKartDialogOpen(false);
    setCurrentTimeslot(null);
  };
  
  const handleKartDialogConfirm = () => {
    if (currentTimeslot && selectedKarts.length > 0) {
      // If this is the first timeslot selection, save the initial kart selection
      if (selectedTimeslots.length === 0) {
        setInitialKartSelection({
          karts: [...selectedKarts],
          quantities: {...kartQuantities}
        });
      }
      
      // Add the timeslot to selected timeslots
      setSelectedTimeslots([...selectedTimeslots, currentTimeslot]);
      setKartDialogOpen(false);
      setCurrentTimeslot(null);
    }
  };
  
  // Format timeslot for display
  const formatTimeslot = (startTime, endTime) => {
    return `${startTime} - ${endTime}`;
  };
  
  // Get total available places for a timeslot
  const getTotalAvailability = (timeslot) => {
    // Use the totalAvailability property if available, otherwise calculate it
    if (timeslot.totalAvailability !== undefined) {
      return timeslot.totalAvailability;
    }
    
    // Fallback calculation if the server doesn't provide totalAvailability
    if (!timeslot.kartAvailability) return 0;
    return timeslot.kartAvailability.reduce((total, kart) => total + kart.available, 0);
  };
  
  const handleKartSelect = (kartId, isSelected) => {
    if (isSelected) {
      // Check if adding this kart would exceed the maximum allowed
      const totalCurrentKarts = Object.values(kartQuantities).reduce((sum, qty) => sum + qty, 0);
      if (totalCurrentKarts < (settings?.maxKartsPerTimeslot || 5)) {
        setSelectedKarts([...selectedKarts, kartId]);
        setKartQuantities(prev => ({ ...prev, [kartId]: 1 }));
      } else {
        // Could add a notification here that max karts limit is reached
        alert(t('maximum_karts_reached', { max: settings?.maxKartsPerTimeslot || 5 }));
      }
    } else {
      setSelectedKarts(selectedKarts.filter((id) => id !== kartId));
      setKartQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[kartId];
        return newQuantities;
      });
    }
  };
  
  const handleQuantityChange = (kartId, newQuantity) => {
    // Calculate the total quantity of all karts after this change
    const otherKartsQuantity = Object.entries(kartQuantities)
      .filter(([id]) => id !== kartId)
      .reduce((sum, [, qty]) => sum + qty, 0);
    
    const totalAfterChange = otherKartsQuantity + newQuantity;
    
    // Check if the new total would exceed the maximum allowed
    if (totalAfterChange <= (settings?.maxKartsPerTimeslot || 5)) {
      setKartQuantities(prev => ({ ...prev, [kartId]: newQuantity }));
    } else {
      alert(t('maximum_karts_reached', { max: settings?.maxKartsPerTimeslot || 5 }));
    }
  };
  
  const handleSubmit = (values) => {
    if (selectedTimeslots.length === 0) return;
    
    // Get the first and last timeslot to determine booking start and end time
    const sortedTimeslots = [...selectedTimeslots].sort();
    const firstTimeslotObj = availableTimeslots.find(t => t.startTime === sortedTimeslots[0]);
    const lastTimeslotObj = availableTimeslots.find(t => t.startTime === sortedTimeslots[sortedTimeslots.length - 1]);
    
    if (!firstTimeslotObj || !lastTimeslotObj) return;
    
    // Create kartSelections array with proper format
    const kartSelections = selectedKarts.map(kartId => {
      const kart = karts.find(k => k._id === kartId);
      return {
        kart: kartId,
        quantity: kartQuantities[kartId] || 1, // Use the selected quantity or default to 1
        pricePerSlot: kart ? kart.pricePerSlot : 0
      };
    });
    
    // Calculate total duration
    const totalDuration = calculateTotalDuration(selectedTimeslots);
    
    const bookingData = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: firstTimeslotObj.startTime,
      endTime: lastTimeslotObj.endTime,
      duration: totalDuration,
      timeslots: selectedTimeslots, // Include all selected timeslots
      kartSelections: kartSelections,
      customerName: values.name,
      customerEmail: values.email,
      customerPhone: values.phone,
      notes: values.notes,
    };
    
    console.log('Sending booking data:', bookingData);
    
    dispatch(createBooking(bookingData))
      .unwrap()
      .then((result) => {
        navigate('/confirmation', { 
          state: { 
            bookingId: result._id,
            bookingData: result 
          } 
        });
      })
      .catch((error) => {
        console.error('Booking failed:', error);
      });
  };
  
  // Validation schema for customer details form
  const validationSchema = Yup.object({
    name: Yup.string().required(t('required_field')),
    email: Yup.string().email(t('invalid_email')).required(t('required_field')),
    phone: Yup.string().required(t('required_field')),
  });
  
  // Render date selection step
  const renderDateSelection = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('select_time')}
        </Typography>
        
        <Card sx={{ mb: 4, p: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('select_date')}
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={et}>
              <DatePicker
                label={t('select_date')}
                value={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                maxDate={addDays(new Date(), settings?.maxAdvanceBookingDays || 30)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </CardContent>
        </Card>
        
        {/* Show selected timeslots if any */}
        {selectedTimeslots.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('selected_timeslots')}
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {selectedTimeslots.map((timeslotStartTime) => {
                  const timeslot = availableTimeslots.find(t => t.startTime === timeslotStartTime);
                  if (!timeslot) return null;
                  
                  return (
                    <Grid item xs={6} sm={4} md={3} key={timeslotStartTime}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'primary.main', 
                          color: 'primary.contrastText',
                          textAlign: 'center'
                        }}
                      >
                        {formatTimeslot(timeslot.startTime, timeslot.endTime)}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {t('total_duration')}: {calculateTotalDuration(selectedTimeslots)} {t('minutes')}
                </Typography>
                <Typography variant="body2">
                  {t('max_duration')}: {maxRideDuration} {t('minutes')}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
        
        {/* Removed 'available_timeslots' text as requested */}
        
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
              availableTimeslots.map((timeslot) => {
                const isSelected = selectedTimeslots.includes(timeslot.startTime);
                const isPast = isTimeslotInPast(timeslot.startTime);
                
                return (
                  <Grid item xs={6} sm={4} md={3} key={timeslot.startTime}>
                    <Button
                      fullWidth
                      variant={isSelected ? 'contained' : 'outlined'}
                      color={isPast ? 'error' : 'primary'}
                      onClick={() => !isSelected && !isPast && handleTimeslotSelect(timeslot.startTime)}
                      sx={{ 
                        py: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        opacity: isSelected ? 0.7 : (isPast ? 0.5 : 1),
                        textDecoration: isPast ? 'line-through' : 'none'
                      }}
                      disabled={isSelected || isPast}
                    >
                      <Box>{formatTimeslot(timeslot.startTime, timeslot.endTime)}</Box>
                      <Box 
                        sx={{ 
                          fontSize: '0.75rem', 
                          mt: 1,
                          color: isSelected ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' 
                        }}
                      >
                        {t('available_places')}: {getTotalAvailability(timeslot)}
                      </Box>
                    </Button>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">
                  {t('no_available_timeslots')}
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          {selectedTimeslots.length > 0 && (
            <Button 
              color="secondary" 
              onClick={() => {
                setSelectedTimeslots([]);
                setSelectedKarts([]);
                setKartQuantities({});
                setInitialKartSelection(null);
              }}
            >
              {t('clear_selection')}
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={selectedTimeslots.length === 0}
            sx={{ ml: 'auto' }}
          >
            {t('next')}
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Kart selection dialog component as a memoized component
  const KartSelectionDialog = React.memo(() => {
    // Get the current timeslot object
    const timeslotObj = currentTimeslot ? availableTimeslots.find(t => t.startTime === currentTimeslot) : null;
    
    return (
      <Dialog
        open={kartDialogOpen}
        onClose={handleKartDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('select_karts_for_timeslot', { timeslot: timeslotObj ? formatTimeslot(timeslotObj.startTime, timeslotObj.endTime) : '' })}
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
              <DialogContentText sx={{ mb: 2 }}>
                {selectedTimeslots.length === 0 
                  ? t('first_timeslot_selection_info') 
                  : t('additional_timeslot_selection_info')}
              </DialogContentText>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {karts && karts.map((kart) => {
                  // Get availability for this kart in the current timeslot
                  const kartAvailability = timeslotObj?.kartAvailability?.find(k => k._id === kart._id);
                  const availableQuantity = kartAvailability?.available || 0;
                  
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
                                <Typography variant="body2" sx={{ mr: 1 }}>{t('Kogus')}:</Typography>
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
                                      const maxAvailable = Math.min(availableQuantity, kart.quantity || 1);
                                      
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
    );
  });
  
  // Render kart selection step (this will be skipped in the new flow)
  const renderKartSelection = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('selected_timeslots_and_karts')}
        </Typography>
        
        <Grid container spacing={3}>
          {selectedTimeslots.map((timeslotStartTime) => {
            const timeslot = availableTimeslots.find(t => t.startTime === timeslotStartTime);
            if (!timeslot) return null;
            
            return (
              <Grid item xs={12} key={timeslotStartTime}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6">
                    {formatTimeslot(timeslot.startTime, timeslot.endTime)}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    {t('selected_karts')}:
                  </Typography>
                  <List>
                    {selectedKarts.map(kartId => {
                      const kart = karts.find(k => k._id === kartId);
                      if (!kart) return null;
                      
                      return (
                        <ListItem key={kartId}>
                          <ListItemText 
                            primary={kart.name} 
                            secondary={`${t('quantity')}: ${kartQuantities[kartId] || 1} | ${t('price')}: ${kart.pricePerSlot * (kartQuantities[kartId] || 1)} €`} 
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={handleBack}>
            {t('back')}
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
          >
            {t('next')}
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render booking summary
  const renderBookingSummary = () => {
    // Calculate total price
    const totalPrice = selectedTimeslots.reduce((total, timeslotStartTime) => {
      return total + selectedKarts.reduce((kartTotal, kartId) => {
        const kart = karts.find(k => k._id === kartId);
        if (!kart) return kartTotal;
        return kartTotal + (kart.pricePerSlot * (kartQuantities[kartId] || 1));
      }, 0);
    }, 0);

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('booking_summary')}
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                {t('booking_date')}:
              </Typography>
              <Typography variant="body1">
                {format(selectedDate, 'dd.MM.yyyy')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                {t('booking_duration')}:
              </Typography>
              <Typography variant="body1">
                {calculateTotalDuration(selectedTimeslots)} {t('minutes')}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('selected_timeslots')}:
          </Typography>
          
          <Grid container spacing={2}>
            {selectedTimeslots.map((timeslotStartTime) => {
              const timeslot = availableTimeslots.find(t => t.startTime === timeslotStartTime);
              if (!timeslot) return null;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={timeslotStartTime}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'primary.main', 
                      color: 'primary.contrastText',
                      textAlign: 'center'
                    }}
                  >
                    {formatTimeslot(timeslot.startTime, timeslot.endTime)}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('selected_karts')}:
          </Typography>
          
          <List>
            {selectedKarts.map(kartId => {
              const kart = karts.find(k => k._id === kartId);
              if (!kart) return null;
              
              return (
                <ListItem key={kartId}>
                  <ListItemText 
                    primary={kart.name} 
                    secondary={`${t('quantity')}: ${kartQuantities[kartId] || 1} | ${t('price')}: ${kart.pricePerSlot * (kartQuantities[kartId] || 1)} €`} 
                  />
                </ListItem>
              );
            })}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              {t('booking_total')}:
            </Typography>
            <Typography variant="h6" color="primary.main">
              {totalPrice} €
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // Render customer details form
  const renderCustomerDetails = () => {
    return (
      <Box sx={{ mt: 4 }}>
        {/* Display booking summary first */}
        {renderBookingSummary()}
        
        <Typography variant="h6" gutterBottom>
          {t('your_details')}
        </Typography>
        
        <Formik
          initialValues={{
            name: '',
            email: '',
            phone: '',
            notes: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} key="name-field">
                  <Field
                    as={TextField}
                    fullWidth
                    label={t('name')}
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6} key="email-field">
                  <Field
                    as={TextField}
                    fullWidth
                    label={t('email')}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6} key="phone-field">
                  <Field
                    as={TextField}
                    fullWidth
                    label={t('phone')}
                    name="phone"
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>
                <Grid item xs={12} key="notes-field">
                  <Field
                    as={TextField}
                    fullWidth
                    label={t('notes')}
                    name="notes"
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack}>
                  {t('back')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    t('confirm_booking')
                  )}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        {t('book_now')}
      </Typography>
      

      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === 0 && renderDateSelection()}
      {activeStep === 1 && renderCustomerDetails()}
      
      {/* Kart selection dialog */}
      <KartSelectionDialog />
    </Container>
  );
};

export default BookingPage;
