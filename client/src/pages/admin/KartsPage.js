import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Import kart actions
import { getKarts, getKartsAdmin, createKart, updateKart, deleteKart } from '../../redux/slices/kartSlice';
import { getKartTypesAdmin, createKartType, updateKartType, deleteKartType } from '../../redux/slices/kartTypeSlice';

const KartsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedKart, setSelectedKart] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [kartToDelete, setKartToDelete] = useState(null);
  
  // Kart Types state
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [typeDialogMode, setTypeDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedKartType, setSelectedKartType] = useState(null);
  const [deleteTypeConfirmOpen, setDeleteTypeConfirmOpen] = useState(false);
  const [kartTypeToDelete, setKartTypeToDelete] = useState(null);
  
  const { karts, loading, error } = useSelector((state) => state.karts);
  const { kartTypes, loading: typesLoading, error: typesError } = useSelector((state) => state.kartTypes);
  const { userInfo } = useSelector((state) => state.auth);
  
  // Log authentication state on component mount
  useEffect(() => {
    console.log('Current auth state:', userInfo);
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      console.log('Admin user authenticated, fetching data...');
      dispatch(getKartsAdmin()); // Use getKartsAdmin instead of getKarts
      dispatch(getKartTypesAdmin());
    } else {
      console.log('User not authenticated as admin');
    }
  }, [dispatch, userInfo]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedKart(null);
    setOpenDialog(true);
  };
  
  const handleOpenEditDialog = (kart) => {
    setDialogMode('edit');
    setSelectedKart(kart);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleOpenDeleteConfirm = (kart) => {
    setKartToDelete(kart);
    setDeleteConfirmOpen(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setKartToDelete(null);
  };
  
  const handleDeleteKart = () => {
    if (kartToDelete) {
      dispatch(deleteKart(kartToDelete._id))
        .unwrap()
        .then(() => {
          handleCloseDeleteConfirm();
        })
        .catch((error) => {
          console.error('Delete kart failed:', error);
        });
    }
  };
  
  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    if (!userInfo || !userInfo.token) {
      console.error('Authentication error: No user token found');
      alert('You must be logged in as an admin to perform this action.');
      return;
    }

    if (!userInfo.isAdmin) {
      console.error('Authorization error: User is not an admin');
      alert('You must have admin privileges to perform this action.');
      return;
    }

    // Ensure we're using the correct type format that matches the database
    // If the selected kart has a lowercase type, keep it that way
    let type = values.type;
    if (dialogMode === 'edit' && selectedKart && selectedKart.type) {
      // If the original type was lowercase, keep it lowercase
      if (selectedKart.type === selectedKart.type.toLowerCase()) {
        type = values.type.toLowerCase();
      }
    }

    const kartData = {
      name: values.name,
      description: values.description,
      type: type,
      pricePerSlot: Number(values.pricePerSlot),
      quantity: Number(values.quantity),
      isActive: selectedKart ? selectedKart.isActive : true,
    };
    
    console.log('Submitting kart data:', kartData);
    console.log('User info for authentication:', { 
      id: userInfo._id,
      isAdmin: userInfo.isAdmin,
      tokenExists: !!userInfo.token,
      tokenLength: userInfo.token ? userInfo.token.length : 0
    });
    
    if (dialogMode === 'add') {
      dispatch(createKart(kartData))
        .unwrap()
        .then(() => {
          handleCloseDialog();
          resetForm();
        })
        .catch((error) => {
          console.error('Create kart failed:', error);
          alert(`Failed to create kart: ${error}`);
        })
        .finally(() => {
          setSubmitting(false);
        });
    } else {
      dispatch(updateKart({ id: selectedKart._id, kartData }))
        .unwrap()
        .then(() => {
          handleCloseDialog();
        })
        .catch((error) => {
          console.error('Update kart failed:', error);
          alert(`Failed to update kart: ${error}`);
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };
  
  // Define validation manually to avoid Yup issues
  const validateForm = (values) => {
    const errors = {};
    
    if (!values.name) {
      errors.name = 'This field is required';
    }
    
    if (!values.description) {
      errors.description = 'This field is required';
    }
    
    if (!values.type) {
      errors.type = 'This field is required';
    }
    
    if (!values.pricePerSlot) {
      errors.pricePerSlot = 'This field is required';
    } else if (isNaN(values.pricePerSlot) || values.pricePerSlot <= 0) {
      errors.pricePerSlot = 'Must be a positive number';
    }
    
    if (!values.quantity) {
      errors.quantity = 'This field is required';
    } else if (isNaN(values.quantity) || values.quantity <= 0) {
      errors.quantity = 'Must be a positive number';
    } else if (!Number.isInteger(Number(values.quantity))) {
      errors.quantity = 'Must be an integer';
    }
    
    return errors;
  };
  
  // Kart Type handlers
  const handleOpenAddTypeDialog = () => {
    setTypeDialogMode('add');
    setSelectedKartType(null);
    setOpenTypeDialog(true);
  };
  
  const handleOpenEditTypeDialog = (kartType) => {
    setTypeDialogMode('edit');
    setSelectedKartType(kartType);
    setOpenTypeDialog(true);
  };
  
  const handleCloseTypeDialog = () => {
    setOpenTypeDialog(false);
  };
  
  const handleOpenDeleteTypeConfirm = (kartType) => {
    setKartTypeToDelete(kartType);
    setDeleteTypeConfirmOpen(true);
  };
  
  const handleCloseDeleteTypeConfirm = () => {
    setDeleteTypeConfirmOpen(false);
    setKartTypeToDelete(null);
  };
  
  const handleDeleteKartType = () => {
    if (kartTypeToDelete) {
      dispatch(deleteKartType(kartTypeToDelete._id))
        .unwrap()
        .then(() => {
          handleCloseDeleteTypeConfirm();
        })
        .catch((error) => {
          console.error('Delete kart type failed:', error);
        });
    }
  };
  
  const handleSubmitKartType = (values, { setSubmitting, resetForm }) => {
    const kartTypeData = {
      name: values.name,
      description: values.description,
    };
    
    if (typeDialogMode === 'add') {
      dispatch(createKartType(kartTypeData))
        .unwrap()
        .then(() => {
          handleCloseTypeDialog();
          resetForm();
        })
        .catch((error) => {
          console.error('Create kart type failed:', error);
        })
        .finally(() => {
          setSubmitting(false);
        });
    } else {
      dispatch(updateKartType({ id: selectedKartType._id, ...kartTypeData }))
        .unwrap()
        .then(() => {
          handleCloseTypeDialog();
        })
        .catch((error) => {
          console.error('Update kart type failed:', error);
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };
  
  // Define validation for kart types manually to avoid Yup issues
  const validateKartTypeForm = (values) => {
    const errors = {};
    
    if (!values.name) {
      errors.name = 'This field is required';
    }
    
    if (!values.description) {
      errors.description = 'This field is required';
    }
    
    return errors;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="kart management tabs">
          <Tab label={t('karts')} />
          <Tab label={t('kart_types')} />
        </Tabs>
      </Box>
      
      {activeTab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4">
              {t('karts')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              {t('add_kart')}
            </Button>
          </Box>
      
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {karts && karts.map((kart) => (
                <Grid item xs={12} sm={6} md={4} key={kart._id}>
                  <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h2">
                        {kart.name}
                      </Typography>
                      <Box>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(kart)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleOpenDeleteConfirm(kart)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 1, mb: 2, flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {kart.description}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('type')}: {kart.type}
                      </Typography>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('quantity')}: {kart.quantity || 1}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {kart.pricePerSlot} €
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      {activeTab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4">
              {t('kart_types')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddTypeDialog}
            >
              {t('add_kart_type')}
            </Button>
          </Box>
          
          {typesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : typesError ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {typesError}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {kartTypes && kartTypes.map((kartType) => (
                <Grid item xs={12} sm={6} md={4} key={kartType._id}>
                  <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h2">
                        {kartType.name}
                      </Typography>
                      <Box>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenEditTypeDialog(kartType)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleOpenDeleteTypeConfirm(kartType)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 1, mb: 2, flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {kartType.description}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                      <Typography variant="body2" color="text.secondary">
                        {kartType.isActive ? t('kart_active') : t('kart_inactive')}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      {/* Add/Edit Kart Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? t('add_kart') : t('edit_kart')}
        </DialogTitle>
        <Formik
          initialValues={
            dialogMode === 'edit' && selectedKart
              ? {
                  name: selectedKart.name,
                  description: selectedKart.description,
                  // Convert type to match the available options in the dropdown
                  type: selectedKart.type === 'adult' ? 'Adult' :
                        selectedKart.type === 'child' ? 'Child' :
                        selectedKart.type === 'duo' ? 'Duo' :
                        selectedKart.type === 'racing' ? 'Racing' :
                        selectedKart.type === 'beginner' ? 'Beginner' :
                        selectedKart.type,
                  pricePerSlot: selectedKart.pricePerSlot,
                  quantity: selectedKart.quantity || 1,
                }
              : {
                  name: '',
                  description: '',
                  type: 'Adult',
                  pricePerSlot: '',
                  quantity: 1,
                }
          }
          validate={validateForm}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label={t('name')}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label={t('description')}
                      name="description"
                      multiline
                      rows={3}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={touched.type && Boolean(errors.type)}>
                      <InputLabel>{t('type')}</InputLabel>
                      <Field as={Select} name="type" label={t('type')}>
                        <MenuItem value="Adult">Adult</MenuItem>
                        <MenuItem value="Child">Child</MenuItem>
                        <MenuItem value="Duo">Duo</MenuItem>
                        <MenuItem value="Racing">Racing</MenuItem>
                        <MenuItem value="Beginner">Beginner</MenuItem>
                        <MenuItem value="täiskasvanu kart">täiskasvanu kart</MenuItem>
                      </Field>
                      {touched.type && errors.type && (
                        <FormHelperText>{errors.type}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label={t('price_per_slot')}
                      name="pricePerSlot"
                      type="number"
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      error={touched.pricePerSlot && Boolean(errors.pricePerSlot)}
                      helperText={touched.pricePerSlot && errors.pricePerSlot}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label={t('Maksimaalne kogus')}
                      name="quantity"
                      type="number"
                      InputProps={{ inputProps: { min: 1, step: 1 } }}
                      error={touched.quantity && Boolean(errors.quantity)}
                      helperText={touched.quantity && errors.quantity}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>
                  {t('cancel')}
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
                    dialogMode === 'add' ? t('add') : t('save')
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>
          {t('confirm_delete')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('delete_kart_confirmation', { name: kartToDelete?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleDeleteKart} 
            variant="contained" 
            color="error"
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add/Edit Kart Type Dialog */}
      <Dialog open={openTypeDialog} onClose={handleCloseTypeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {typeDialogMode === 'add' ? t('add_kart_type') : t('edit_kart_type')}
        </DialogTitle>
        <Formik
          initialValues={
            typeDialogMode === 'edit' && selectedKartType
              ? {
                  name: selectedKartType.name,
                  description: selectedKartType.description,
                }
              : {
                  name: '',
                  description: '',
                }
          }
          validate={validateKartTypeForm}
          onSubmit={handleSubmitKartType}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label={t('kart_type_name')}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label={t('kart_type_description')}
                      name="description"
                      multiline
                      rows={3}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseTypeDialog}>
                  {t('cancel')}
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
                    typeDialogMode === 'add' ? t('add') : t('save')
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      
      {/* Delete Kart Type Confirmation Dialog */}
      <Dialog open={deleteTypeConfirmOpen} onClose={handleCloseDeleteTypeConfirm}>
        <DialogTitle>
          {t('confirm_delete')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('confirm_delete_kart_type', { name: kartTypeToDelete?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteTypeConfirm}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleDeleteKartType} 
            variant="contained" 
            color="error"
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default KartsPage;
