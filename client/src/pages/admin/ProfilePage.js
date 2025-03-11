import React, { useState } from 'react';
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
  Avatar,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';

// Import user actions (to be implemented)
// import { updateProfile, updatePassword } from '../../redux/slices/authSlice';

const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  
  // Get user info from auth state
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  
  const handleUpdateProfile = (values, { setSubmitting }) => {
    const profileData = {
      name: values.name,
      email: values.email,
    };
    
    // Implement when auth slice is ready
    // dispatch(updateProfile(profileData))
    //   .unwrap()
    //   .then(() => {
    //     setProfileUpdateSuccess(true);
    //     setTimeout(() => setProfileUpdateSuccess(false), 5000);
    //   })
    //   .catch((error) => {
    //     console.error('Update profile failed:', error);
    //   })
    //   .finally(() => {
    //     setSubmitting(false);
    //   });
    
    console.log('Update profile:', profileData);
    setProfileUpdateSuccess(true);
    setTimeout(() => setProfileUpdateSuccess(false), 5000);
    setSubmitting(false);
  };
  
  const handleUpdatePassword = (values, { setSubmitting, resetForm }) => {
    const passwordData = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };
    
    // Implement when auth slice is ready
    // dispatch(updatePassword(passwordData))
    //   .unwrap()
    //   .then(() => {
    //     setPasswordUpdateSuccess(true);
    //     setTimeout(() => setPasswordUpdateSuccess(false), 5000);
    //     resetForm();
    //   })
    //   .catch((error) => {
    //     console.error('Update password failed:', error);
    //   })
    //   .finally(() => {
    //     setSubmitting(false);
    //   });
    
    console.log('Update password:', passwordData);
    setPasswordUpdateSuccess(true);
    setTimeout(() => setPasswordUpdateSuccess(false), 5000);
    resetForm();
    setSubmitting(false);
  };
  
  // Validation schemas
  const profileValidationSchema = Yup.object({
    name: Yup.string().required(t('required_field')),
    email: Yup.string().email(t('invalid_email')).required(t('required_field')),
  });
  
  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string().required(t('required_field')),
    newPassword: Yup.string()
      .min(6, t('password_min_length'))
      .required(t('required_field')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], t('passwords_must_match'))
      .required(t('required_field')),
  });
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('profile')}
      </Typography>
      
      {/* Profile Information */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AccountCircleIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
          <Typography variant="h6">
            {t('profile_information')}
          </Typography>
        </Box>
        
        {profileUpdateSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('profile_updated_successfully')}
          </Alert>
        )}
        
        <Formik
          initialValues={{
            name: userInfo?.name || '',
            email: userInfo?.email || '',
          }}
          validationSchema={profileValidationSchema}
          onSubmit={handleUpdateProfile}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label={t('name')}
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label={t('email')}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      t('update_profile')
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
      
      {/* Change Password */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LockIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
          <Typography variant="h6">
            {t('change_password')}
          </Typography>
        </Box>
        
        {passwordUpdateSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('password_updated_successfully')}
          </Alert>
        )}
        
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={passwordValidationSchema}
          onSubmit={handleUpdatePassword}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    label={t('current_password')}
                    name="currentPassword"
                    type="password"
                    error={touched.currentPassword && Boolean(errors.currentPassword)}
                    helperText={touched.currentPassword && errors.currentPassword}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label={t('new_password')}
                    name="newPassword"
                    type="password"
                    error={touched.newPassword && Boolean(errors.newPassword)}
                    helperText={touched.newPassword && errors.newPassword}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label={t('confirm_new_password')}
                    name="confirmPassword"
                    type="password"
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      t('update_password')
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
