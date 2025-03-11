import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  FormControlLabel,
  Switch,
  IconButton,
  Chip,
  Tab,
  Tabs,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { et } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

// Import settings actions
import { 
  getSettings, 
  updateSettings, 
  addHoliday, 
  removeHoliday,
  testEmailConfiguration 
} from '../../redux/slices/settingSlice';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [holidayDescription, setHolidayDescription] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const { 
    settings, 
    loading, 
    error, 
    emailTestStatus,
    emailTestLoading,
    emailTestError 
  } = useSelector((state) => state.settings);
  
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleSaveGeneralSettings = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const updatedSettings = {
      businessName: formData.get('businessName'),
      businessEmail: formData.get('businessEmail'),
      contactPhone: formData.get('contactPhone'),
      address: formData.get('address'),
      timeslotDuration: parseInt(formData.get('slotDuration')),
      maxAdvanceBookingDays: parseInt(formData.get('maxBookingDays')),
      maxKartsPerTimeslot: parseInt(formData.get('maxKartsPerTimeslot')),
      maxMinutesPerSession: parseInt(formData.get('maxMinutesPerSession')),
    };
    
    dispatch(updateSettings(updatedSettings))
      .unwrap()
      .then(() => {
        showSnackbar(t('settings_saved_successfully'));
      })
      .catch((error) => {
        showSnackbar(t('error_saving_settings'), 'error');
      });
  };
  
  const handleSaveEmailSettings = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const emailSettings = {
      emailHost: formData.get('emailHost'),
      emailPort: parseInt(formData.get('emailPort')),
      emailUser: formData.get('emailUser'),
      emailPass: formData.get('emailPass'),
      emailFrom: formData.get('emailFrom'),
      emailSecure: formData.get('emailSecure') === 'on',
    };
    
    dispatch(updateSettings({ emailSettings }))
      .unwrap()
      .then(() => {
        showSnackbar(t('email_settings_saved_successfully'));
      })
      .catch((error) => {
        showSnackbar(t('error_saving_email_settings'), 'error');
      });
  };
  
  const handleSaveWorkingHours = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const workingHours = [
      { day: 'monday', isOpen: formData.get('monday-open') === 'on', openTime: formData.get('monday-start'), closeTime: formData.get('monday-end') },
      { day: 'tuesday', isOpen: formData.get('tuesday-open') === 'on', openTime: formData.get('tuesday-start'), closeTime: formData.get('tuesday-end') },
      { day: 'wednesday', isOpen: formData.get('wednesday-open') === 'on', openTime: formData.get('wednesday-start'), closeTime: formData.get('wednesday-end') },
      { day: 'thursday', isOpen: formData.get('thursday-open') === 'on', openTime: formData.get('thursday-start'), closeTime: formData.get('thursday-end') },
      { day: 'friday', isOpen: formData.get('friday-open') === 'on', openTime: formData.get('friday-start'), closeTime: formData.get('friday-end') },
      { day: 'saturday', isOpen: formData.get('saturday-open') === 'on', openTime: formData.get('saturday-start'), closeTime: formData.get('saturday-end') },
      { day: 'sunday', isOpen: formData.get('sunday-open') === 'on', openTime: formData.get('sunday-start'), closeTime: formData.get('sunday-end') },
    ];
    
    dispatch(updateSettings({ workingHours }))
      .unwrap()
      .then(() => {
        showSnackbar(t('working_hours_saved_successfully'));
      })
      .catch((error) => {
        showSnackbar(t('error_saving_working_hours'), 'error');
      });
  };
  
  const handleAddHoliday = () => {
    if (!holidayDescription.trim()) {
      showSnackbar(t('please_enter_holiday_description'), 'error');
      return;
    }
    
    const holiday = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      description: holidayDescription,
    };
    
    dispatch(addHoliday(holiday))
      .unwrap()
      .then(() => {
        setHolidayDescription('');
        showSnackbar(t('holiday_added_successfully'));
      })
      .catch((error) => {
        showSnackbar(t('error_adding_holiday'), 'error');
      });
  };
  
  const handleRemoveHoliday = (holidayId) => {
    dispatch(removeHoliday(holidayId))
      .unwrap()
      .then(() => {
        showSnackbar(t('holiday_removed_successfully'));
      })
      .catch((error) => {
        showSnackbar(t('error_removing_holiday'), 'error');
      });
  };
  
  const handleTestEmailConfig = () => {
    if (!testEmail.trim()) {
      showSnackbar(t('please_enter_test_email'), 'error');
      return;
    }
    
    dispatch(testEmailConfiguration(testEmail))
      .unwrap()
      .then(() => {
        showSnackbar(t('test_email_sent_successfully'));
      })
      .catch((error) => {
        showSnackbar(t('error_sending_test_email'), 'error');
      });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('settings')}
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label={t('general')} id="settings-tab-0" />
          <Tab label={t('working_hours')} id="settings-tab-1" />
          <Tab label={t('holidays')} id="settings-tab-2" />
          <Tab label={t('email')} id="settings-tab-3" />
        </Tabs>
      </Box>
      
      {/* General Settings */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('general_settings')}
          </Typography>
          
          <Box component="form" onSubmit={handleSaveGeneralSettings} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('business_name')}
                  name="businessName"
                  defaultValue={settings?.businessName || ''}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('business_email')}
                  name="businessEmail"
                  type="email"
                  defaultValue={settings?.businessEmail || ''}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('contact_phone')}
                  name="contactPhone"
                  defaultValue={settings?.contactPhone || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('address')}
                  name="address"
                  defaultValue={settings?.address || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('slot_duration_minutes')}
                  name="slotDuration"
                  type="number"
                  defaultValue={settings?.timeslotDuration || 30}
                  InputProps={{ inputProps: { min: 10, step: 5 } }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('max_booking_days_ahead')}
                  name="maxBookingDays"
                  type="number"
                  defaultValue={settings?.maxAdvanceBookingDays || 30}
                  InputProps={{ inputProps: { min: 1 } }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('Maksimaalne kartide arv')}
                  name="maxKartsPerTimeslot"
                  type="number"
                  defaultValue={settings?.maxKartsPerTimeslot || 5}
                  InputProps={{ inputProps: { min: 1 } }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('Maksimaalne sõiduaeg (minutites)')}
                  name="maxMinutesPerSession"
                  type="number"
                  defaultValue={settings?.maxMinutesPerSession || 60}
                  InputProps={{ inputProps: { min: 30, step: 30 } }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained">
                  {t('save_changes')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </TabPanel>
      
      {/* Working Hours */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('working_hours')}
          </Typography>
          
          <Box component="form" onSubmit={handleSaveWorkingHours} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const daySettings = settings?.workingHours?.find(wh => wh.day === day) || { isOpen: false, openTime: '09:00', closeTime: '18:00' };
                
                return (
                  <Grid item xs={12} key={day}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            name={`${day}-open`}
                            defaultChecked={daySettings.isOpen}
                          />
                        }
                        label={t(day)}
                        sx={{ width: 150 }}
                      />
                      <TextField
                        label={t('start_time')}
                        name={`${day}-start`}
                        type="time"
                        defaultValue={daySettings.openTime || '09:00'}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150 }}
                      />
                      <TextField
                        label={t('end_time')}
                        name={`${day}-end`}
                        type="time"
                        defaultValue={daySettings.closeTime || '18:00'}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150 }}
                      />
                    </Box>
                  </Grid>
                );
              })}
              <Grid item xs={12}>
                <Button type="submit" variant="contained">
                  {t('save_changes')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </TabPanel>
      
      {/* Holidays */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('holidays')}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={et}>
                  <DatePicker
                    label={t('select_date')}
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={5}>
                <TextField
                  fullWidth
                  label={t('holiday_description')}
                  value={holidayDescription}
                  onChange={(e) => setHolidayDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  onClick={handleAddHoliday}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  {t('add_holiday')}
                </Button>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              {t('current_holidays')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {settings?.holidays && settings.holidays.length > 0 ? (
                settings.holidays.map((holiday) => (
                  <Chip
                    key={holiday._id}
                    label={`${holiday.date} - ${holiday.description}`}
                    onDelete={() => handleRemoveHoliday(holiday._id)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ mb: 1 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('no_holidays_defined')}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </TabPanel>
      
      {/* Email Settings */}
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('email_settings')}
          </Typography>
          
          <Box component="form" onSubmit={handleSaveEmailSettings} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('smtp_host')}
                  name="emailHost"
                  defaultValue={settings?.emailSettings?.emailHost || ''}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('smtp_port')}
                  name="emailPort"
                  type="number"
                  defaultValue={settings?.emailSettings?.emailPort || 587}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('smtp_username')}
                  name="emailUser"
                  defaultValue={settings?.emailSettings?.emailUser || ''}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('smtp_password')}
                  name="emailPass"
                  type="password"
                  defaultValue={settings?.emailSettings?.emailPass || ''}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('from_email')}
                  name="emailFrom"
                  defaultValue={settings?.emailSettings?.emailFrom || ''}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="emailSecure"
                      defaultChecked={settings?.emailSettings?.emailSecure || true}
                    />
                  }
                  label={t('use_secure_connection')}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained">
                  {t('save_changes')}
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('test_email_configuration')}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <TextField
              label={t('test_email_address')}
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleTestEmailConfig}
              disabled={emailTestLoading}
              endIcon={emailTestLoading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {t('send_test')}
            </Button>
          </Box>
          
          {emailTestStatus && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {t('test_email_sent_successfully')}
            </Alert>
          )}
          
          {emailTestError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {emailTestError}
            </Alert>
          )}
        </Paper>
      </TabPanel>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default SettingsPage;
