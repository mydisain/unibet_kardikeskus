import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  Button,
  Divider,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Import components
import DatePicker from '../components/booking/DatePicker';
import KartSelectionDialog from '../components/booking/KartSelectionDialog';

// Import actions
import { getKarts } from '../redux/slices/kartSlice';

const BookingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Define steps using translation keys
  const steps = [t('select_date_and_time'), t('your_details')];
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTimeslots, setSelectedTimeslots] = useState([]);
  const [selectedKarts, setSelectedKarts] = useState([]);
  const [kartQuantities, setKartQuantities] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // State to track per-timeslot kart quantities
  const [timeslotKartQuantities, setTimeslotKartQuantities] = useState({});
  
  // Dialog state
  const [kartDialogOpen, setKartDialogOpen] = useState(false);
  const [currentTimeslot, setCurrentTimeslot] = useState(null);
  const [initialKartSelection, setInitialKartSelection] = useState(null);
  
  // Store kart selections for each timeslot separately
  const [timeslotKartSelections, setTimeslotKartSelections] = useState({});
  
  const { 
    karts = [], 
    loading: kartsLoading, 
    error: kartsError 
  } = useSelector((state) => state.karts) || {};
  
  const {
    settings,
  } = useSelector((state) => state.settings) || {};
  
  // Fetch karts when component mounts
  useEffect(() => {
    dispatch(getKarts());
  }, [dispatch]);
  
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
  
  const handleTimeslotSelect = (timeslot) => {
    // Set the current timeslot
    setCurrentTimeslot(timeslot);
    
    // Check if this timeslot already has saved kart selections
    const timeslotKey = `${timeslot.startTime}-${timeslot.endTime}`;
    const savedKartSelections = timeslotKartSelections[timeslotKey];
    const savedKartQuantities = timeslotKartQuantities[timeslotKey];
    
    if (savedKartSelections && savedKartQuantities) {
      // Load the saved kart selections for this timeslot
      setSelectedKarts(savedKartSelections);
      setKartQuantities(savedKartQuantities);
      console.log('Loaded saved kart selections for timeslot:', timeslotKey);
    } else if (initialKartSelection && selectedTimeslots.length > 0) {
      // Use the initial kart selection as a starting point for new timeslots
      setSelectedKarts(initialKartSelection.karts);
      setKartQuantities(initialKartSelection.quantities);
      console.log('Using initial kart selection for new timeslot');
    } else {
      // Reset kart selections for new timeslots
      setSelectedKarts([]);
      setKartQuantities({});
      console.log('Reset kart selections for new timeslot');
    }
    
    // Open the kart selection dialog
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
      
      // Check if this timeslot is already selected (editing an existing selection)
      const existingIndex = selectedTimeslots.findIndex(
        ts => ts.startTime === currentTimeslot.startTime && ts.endTime === currentTimeslot.endTime
      );
      
      // Store the kart quantities for this specific timeslot
      const timeslotKey = `${currentTimeslot.startTime}-${currentTimeslot.endTime}`;
      setTimeslotKartQuantities(prev => ({
        ...prev,
        [timeslotKey]: {...kartQuantities}
      }));
      
      // Store kart selections for this timeslot
      setTimeslotKartSelections(prev => ({
        ...prev,
        [timeslotKey]: [...selectedKarts]
      }));
      
      // Add the timeslot to selected timeslots only if it's not already there
      if (existingIndex === -1) {
        setSelectedTimeslots([...selectedTimeslots, currentTimeslot]);
        console.log('Added new timeslot:', currentTimeslot);
      } else {
        console.log('Updated existing timeslot:', currentTimeslot);
      }
      
      console.log('Timeslot key:', timeslotKey);
      console.log('Kart selections for this timeslot:', [...selectedKarts]);
      console.log('Kart quantities for this timeslot:', {...kartQuantities});
      console.log('All timeslot kart selections:', {
        ...timeslotKartSelections,
        [timeslotKey]: [...selectedKarts]
      });
      
      setKartDialogOpen(false);
      setCurrentTimeslot(null);
    }
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
  
  // Handle date change from DatePicker
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  // Format timeslot for display
  const formatTimeslot = (startTime, endTime) => {
    return `${startTime} - ${endTime}`;
  };
  
  // Handle removing a timeslot
  const handleRemoveTimeslot = (index) => {
    const timeslotToRemove = selectedTimeslots[index];
    const timeslotKey = `${timeslotToRemove.startTime}-${timeslotToRemove.endTime}`;
    
    // Remove the timeslot from selected timeslots
    const newSelectedTimeslots = [...selectedTimeslots];
    newSelectedTimeslots.splice(index, 1);
    setSelectedTimeslots(newSelectedTimeslots);
    
    // Remove the timeslot-specific kart quantities
    setTimeslotKartQuantities(prev => {
      const newQuantities = {...prev};
      delete newQuantities[timeslotKey];
      return newQuantities;
    });
    
    // Remove kart selections for this timeslot
    setTimeslotKartSelections(prev => {
      const newSelections = {...prev};
      delete newSelections[timeslotKey];
      return newSelections;
    });
    
    // If all timeslots are removed, reset kart selections
    if (newSelectedTimeslots.length === 0) {
      setSelectedKarts([]);
      setKartQuantities({});
      setInitialKartSelection(null);
    }
  };
  
  // Handle proceeding to the next step
  const handleProceedToDetails = () => {
    if (selectedTimeslots.length > 0) {
      // Prepare data to pass to the next step
      const bookingData = {
        timeslots: selectedTimeslots,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeslotKartSelections: timeslotKartSelections,
        timeslotKartQuantities: timeslotKartQuantities,
        karts: selectedKarts.map(kartId => {
          const kart = karts.find(k => k._id === kartId);
          return {
            id: kartId,
            name: kart?.name || 'Unknown Kart',
            quantity: kartQuantities[kartId] || 1,
            price: kart?.pricePerSlot || 0
          };
        }),
        kartQuantities
      };
      
      // Navigate to the confirmation page with the booking data
      navigate('/confirmation', { state: { bookingData } });
    }
  };
  
  // Get the selected kart details for a timeslot
  const getKartDetails = () => {
    return selectedKarts.map(kartId => {
      const kart = karts.find(k => k._id === kartId);
      return {
        id: kartId,
        name: kart?.name || 'Unknown Kart',
        quantity: kartQuantities[kartId] || 1,
        price: kart?.pricePerSlot || 0
      };
    });
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
      
      <Box sx={{ mt: 4 }}>
        <DatePicker 
          onTimeslotSelect={handleTimeslotSelect} 
          selectedTimeslots={selectedTimeslots}
          kartQuantities={kartQuantities}
          timeslotKartQuantities={timeslotKartQuantities}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </Box>
      
      {/* Selected Timeslots Section */}
      {selectedTimeslots.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('selected_timeslots')}
          </Typography>
          
          <Card sx={{ mb: 4 }}>
            <CardContent>
              {selectedTimeslots.map((timeslot, index) => (
                <Paper 
                  key={`${timeslot.startTime}-${index}`} 
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={10}>
                      <Typography variant="subtitle1">
                        {formatTimeslot(timeslot.startTime, timeslot.endTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getKartDetails().map(kart => `${kart.name} (${kart.quantity})`).join(', ')}
                      </Typography>
                    </Grid>
                    <Grid item xs={2} sx={{ textAlign: 'right' }}>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveTimeslot(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProceedToDetails}
                  size="large"
                >
                  {t('proceed_to_details')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Kart selection dialog */}
      <KartSelectionDialog
        open={kartDialogOpen}
        onClose={handleKartDialogClose}
        onConfirm={handleKartDialogConfirm}
        timeslot={currentTimeslot}
        karts={karts}
        selectedKarts={selectedKarts}
        kartQuantities={kartQuantities}
        handleKartSelect={handleKartSelect}
        handleQuantityChange={handleQuantityChange}
        kartsLoading={kartsLoading}
        kartsError={kartsError}
        isFirstTimeslot={selectedTimeslots.length === 0}
      />
    </Container>
  );
};

export default BookingPage;
