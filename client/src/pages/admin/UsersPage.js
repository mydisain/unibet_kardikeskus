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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Import user actions (to be implemented)
// import { getUsers, createUser, updateUser, deleteUser } from '../../redux/slices/userSlice';

const UsersPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // This would be implemented with a proper users slice
  // const { users, loading, error } = useSelector((state) => state.users);
  
  // Mock data for development
  const users = [
    {
      _id: 'u1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      createdAt: '2025-01-01T10:00:00Z',
    },
    {
      _id: 'u2',
      name: 'Staff User',
      email: 'staff@example.com',
      role: 'staff',
      isActive: true,
      createdAt: '2025-01-15T14:30:00Z',
    },
    {
      _id: 'u3',
      name: 'Inactive User',
      email: 'inactive@example.com',
      role: 'staff',
      isActive: false,
      createdAt: '2025-02-01T09:15:00Z',
    },
  ];
  
  const loading = false;
  const error = null;
  
  // Uncomment when user slice is implemented
  // useEffect(() => {
  //   dispatch(getUsers());
  // }, [dispatch]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedUser(null);
    setOpenDialog(true);
  };
  
  const handleOpenEditDialog = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleOpenDeleteConfirm = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };
  
  const handleDeleteUser = () => {
    if (userToDelete) {
      // Implement when user slice is ready
      // dispatch(deleteUser(userToDelete._id))
      //   .unwrap()
      //   .then(() => {
      //     handleCloseDeleteConfirm();
      //   })
      //   .catch((error) => {
      //     console.error('Delete user failed:', error);
      //   });
      console.log('Delete user:', userToDelete._id);
      handleCloseDeleteConfirm();
    }
  };
  
  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const userData = {
      name: values.name,
      email: values.email,
      role: values.role,
      isActive: values.isActive,
    };
    
    if (dialogMode === 'add') {
      userData.password = values.password;
      
      // Implement when user slice is ready
      // dispatch(createUser(userData))
      //   .unwrap()
      //   .then(() => {
      //     handleCloseDialog();
      //     resetForm();
      //   })
      //   .catch((error) => {
      //     console.error('Create user failed:', error);
      //   })
      //   .finally(() => {
      //     setSubmitting(false);
      //   });
      console.log('Create user:', userData);
      handleCloseDialog();
      resetForm();
      setSubmitting(false);
    } else {
      if (values.password) {
        userData.password = values.password;
      }
      
      // Implement when user slice is ready
      // dispatch(updateUser({ id: selectedUser._id, ...userData }))
      //   .unwrap()
      //   .then(() => {
      //     handleCloseDialog();
      //   })
      //   .catch((error) => {
      //     console.error('Update user failed:', error);
      //   })
      //   .finally(() => {
      //     setSubmitting(false);
      //   });
      console.log('Update user:', { id: selectedUser._id, ...userData });
      handleCloseDialog();
      setSubmitting(false);
    }
  };
  
  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required(t('required_field')),
    email: Yup.string().email(t('invalid_email')).required(t('required_field')),
    role: Yup.string().required(t('required_field')),
    isActive: Yup.boolean(),
    password: Yup.string().when('$isAddMode', {
      is: true,
      then: Yup.string()
        .min(6, t('password_min_length'))
        .required(t('required_field')),
      otherwise: Yup.string().min(6, t('password_min_length')),
    }),
    confirmPassword: Yup.string().when('password', {
      is: (val) => val && val.length > 0,
      then: Yup.string()
        .oneOf([Yup.ref('password')], t('passwords_must_match'))
        .required(t('required_field')),
    }),
  });
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          {t('users')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          {t('add_user')}
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
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('name')}</TableCell>
                  <TableCell>{t('email')}</TableCell>
                  <TableCell>{t('role')}</TableCell>
                  <TableCell>{t('status')}</TableCell>
                  <TableCell>{t('created_at')}</TableCell>
                  <TableCell align="right">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow hover key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: user.isActive ? 'success.main' : 'error.main',
                          }}
                        >
                          {user.isActive ? t('active') : t('inactive')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(user)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteConfirm(user)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
      
      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? t('add_user') : t('edit_user')}
        </DialogTitle>
        <Formik
          initialValues={
            dialogMode === 'edit' && selectedUser
              ? {
                  name: selectedUser.name,
                  email: selectedUser.email,
                  role: selectedUser.role,
                  isActive: selectedUser.isActive,
                  password: '',
                  confirmPassword: '',
                }
              : {
                  name: '',
                  email: '',
                  role: 'staff',
                  isActive: true,
                  password: '',
                  confirmPassword: '',
                }
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          context={{ isAddMode: dialogMode === 'add' }}
        >
          {({ errors, touched, isSubmitting, values }) => (
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
                      label={t('email')}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={touched.role && Boolean(errors.role)}>
                      <InputLabel>{t('role')}</InputLabel>
                      <Field as={Select} name="role" label={t('role')}>
                        <MenuItem value="admin">{t('admin')}</MenuItem>
                        <MenuItem value="staff">{t('staff')}</MenuItem>
                      </Field>
                      {touched.role && errors.role && (
                        <FormHelperText>{errors.role}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('status')}</InputLabel>
                      <Field as={Select} name="isActive" label={t('status')}>
                        <MenuItem value={true}>{t('active')}</MenuItem>
                        <MenuItem value={false}>{t('inactive')}</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label={dialogMode === 'add' ? t('password') : t('new_password')}
                      name="password"
                      type="password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                    {dialogMode === 'edit' && (
                      <Typography variant="caption" color="text.secondary">
                        {t('leave_blank_to_keep_current_password')}
                      </Typography>
                    )}
                  </Grid>
                  {(dialogMode === 'add' || values.password) && (
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        fullWidth
                        label={t('confirm_password')}
                        name="confirmPassword"
                        type="password"
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                      />
                    </Grid>
                  )}
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
            {t('delete_user_confirmation', { name: userToDelete?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleDeleteUser} 
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

export default UsersPage;
