import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { et } from 'date-fns/locale';

// Import booking actions
import { getBookings, updateBooking, deleteBooking } from '../../redux/slices/bookingSlice';

const BookingsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Get bookings from Redux store
  const { bookings = [], loading, error } = useSelector((state) => state.bookings);
  
  // Fetch bookings when component mounts
  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleOpenViewDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenViewDialog(true);
  };
  
  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
  };
  
  const handleOpenEditDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  const handleOpenDeleteConfirm = (booking) => {
    setSelectedBooking(booking);
    setDeleteConfirmOpen(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };
  
  const handleUpdateBooking = (values) => {
    if (selectedBooking && selectedBooking._id) {
      dispatch(updateBooking({ id: selectedBooking._id, bookingData: values }))
        .unwrap()
        .then(() => {
          handleCloseEditDialog();
          // Show success message
          alert(t('booking_updated_successfully', 'Booking updated successfully'));
        })
        .catch((error) => {
          console.error('Update booking failed:', error);
          // Show error message
          alert(t('update_booking_failed', 'Failed to update booking'));
        });
    } else {
      console.error('No booking selected for update');
    }
  };
  
  const handleDeleteBooking = () => {
    if (selectedBooking && selectedBooking._id) {
      dispatch(deleteBooking(selectedBooking._id))
        .unwrap()
        .then(() => {
          handleCloseDeleteConfirm();
          // Show success message
          alert(t('booking_deleted_successfully', 'Booking deleted successfully'));
        })
        .catch((error) => {
          console.error('Delete booking failed:', error);
          // Show error message
          alert(t('delete_booking_failed', 'Failed to delete booking'));
        });
    } else {
      console.error('No booking selected for deletion');
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'cancelled':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {t('bookings')}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/admin/create-booking')}
        >
          {t('create_booking')}
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
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="bookings table">
              <TableHead>
                <TableRow>
                  <TableCell>{t('booking_id')}</TableCell>
                  <TableCell>{t('customer')}</TableCell>
                  <TableCell>{t('date')}</TableCell>
                  <TableCell>{t('time')}</TableCell>
                  <TableCell>{t('karts')}</TableCell>
                  <TableCell>{t('status')}</TableCell>
                  <TableCell align="right">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((booking) => (
                    <TableRow hover key={booking._id}>
                      <TableCell component="th" scope="row">
                        {booking._id}
                      </TableCell>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : booking.timeslot || 'N/A'}</TableCell>
                      <TableCell>
                        {booking.kartSelections && booking.kartSelections.length > 0 
                          ? booking.kartSelections.map(selection => {
                              const kartName = selection.kart && typeof selection.kart === 'object' ? selection.kart.name : 'Kart';
                              return `${kartName} (${selection.quantity})`;
                            }).join(', ')
                          : booking.karts && booking.karts.length > 0
                            ? booking.karts.map(kart => kart.name || 'Kart').join(', ')
                            : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: getStatusColor(booking.status) }}>
                          {booking.status}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenViewDialog(booking)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(booking)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteConfirm(booking)}
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
            count={bookings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
      
      {/* View Booking Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('booking_details')}</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">{t('booking_id')}</Typography>
                <Typography variant="body1" gutterBottom>{selectedBooking._id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">{t('created_at')}</Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedBooking.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">{t('customer_name')}</Typography>
                <Typography variant="body1" gutterBottom>{selectedBooking.customerName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">{t('status')}</Typography>
                <Typography 
                  variant="body1" 
                  gutterBottom
                  sx={{ color: getStatusColor(selectedBooking.status) }}
                >
                  {selectedBooking.status}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">{t('email')}</Typography>
                <Typography variant="body1" gutterBottom>{selectedBooking.customerEmail}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">{t('phone')}</Typography>
                <Typography variant="body1" gutterBottom>{selectedBooking.customerPhone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">{t('date')}</Typography>
                <Typography variant="body1" gutterBottom>{selectedBooking.date}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>{t('timeslots_and_karts', 'Timeslots and Karts')}</Typography>
                
                {/* Display timeslots with karts */}
                {selectedBooking.selectedTimeslots && selectedBooking.selectedTimeslots.length > 0 ? (
                  selectedBooking.selectedTimeslots.map((timeslot, index) => {
                    // Find karts for this specific timeslot
                    const timeslotKarts = selectedBooking.kartSelections 
                      ? selectedBooking.kartSelections.filter(selection => 
                          selection.timeslot === timeslot
                        )
                      : [];
                    
                    console.log(`Admin view - Timeslot ${timeslot} has ${timeslotKarts.length} karts:`, timeslotKarts);
                    
                    return (
                      <Card key={`timeslot-${index}`} sx={{ mb: 2, border: '1px solid #eee' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {timeslot}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                            {t('karts_for_this_timeslot', 'Karts for this timeslot')}:
                          </Typography>
                          
                          {/* Display karts for this timeslot */}
                          {timeslotKarts.length > 0 ? (
                            <List dense>
                              {timeslotKarts.map((selection, kartIndex) => {
                                const kartName = selection.kart && typeof selection.kart === 'object'
                                  ? selection.kart.name || 'Kart'
                                  : 'Kart';
                                
                                return (
                                  <ListItem key={`kart-${kartIndex}`} sx={{ py: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <DirectionsCarIcon fontSize="small" color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={`${kartName} x ${selection.quantity}`}
                                      secondary={`${selection.pricePerSlot} € x ${selection.quantity} = ${(selection.pricePerSlot * selection.quantity).toFixed(2)} €`}
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {t('no_karts_selected', 'No karts selected for this specific timeslot')}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  // Legacy display for backward compatibility
                  <Box>
                    <Typography variant="subtitle2">{t('time')}</Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedBooking.startTime && selectedBooking.endTime 
                        ? `${selectedBooking.startTime} - ${selectedBooking.endTime}` 
                        : selectedBooking.timeslot || 'N/A'}
                    </Typography>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      {t('karts_for_this_timeslot', 'Karts for this timeslot')}:
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      {selectedBooking.kartSelections && selectedBooking.kartSelections.length > 0 
                        ? selectedBooking.kartSelections.map((selection, index) => (
                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body1">
                                {selection.kart && typeof selection.kart === 'object' 
                                  ? `${selection.kart.name || 'Kart'} (${selection.quantity})` 
                                  : `Kart (${selection.quantity})`}
                              </Typography>
                              <Typography variant="body1">
                                {selection.pricePerSlot} € x {selection.quantity}
                              </Typography>
                            </Box>
                          ))
                        : selectedBooking.karts && selectedBooking.karts.length > 0
                          ? selectedBooking.karts.map((kart, index) => (
                              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1">
                                  {kart.name || 'Kart'} ({kart.type || 'unknown'})
                                </Typography>
                                <Typography variant="body1">
                                  {kart.pricePerSlot || 0} €
                                </Typography>
                              </Box>
                            ))
                          : <Typography variant="body2">{t('no_karts_selected', 'No karts selected')}</Typography>
                      }
                    </Box>
                  </Box>
                )}
              </Grid>
              {selectedBooking.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">{t('notes')}</Typography>
                  <Typography variant="body1" gutterBottom>{selectedBooking.notes}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2">{t('total_price')}</Typography>
                <Typography variant="h6" gutterBottom>
                  {selectedBooking.totalPrice !== undefined
                    ? `${selectedBooking.totalPrice} €`
                    : selectedBooking.kartSelections && selectedBooking.kartSelections.length > 0
                      ? `${selectedBooking.kartSelections.reduce((total, selection) => 
                          total + (selection.pricePerSlot * selection.quantity), 0)} €`
                      : selectedBooking.karts && selectedBooking.karts.length > 0
                        ? `${selectedBooking.karts.reduce((total, kart) => total + (kart.pricePerSlot || 0), 0)} €`
                        : '0 €'
                  }
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Booking Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('edit_booking')}</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('customer_name')}
                    defaultValue={selectedBooking.customerName}
                    name="customerName"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('status')}</InputLabel>
                    <Select
                      defaultValue={selectedBooking.status}
                      label={t('status')}
                      name="status"
                    >
                      <MenuItem value="confirmed">{t('confirmed')}</MenuItem>
                      <MenuItem value="pending">{t('pending')}</MenuItem>
                      <MenuItem value="cancelled">{t('cancelled')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('email')}
                    defaultValue={selectedBooking.customerEmail}
                    name="customerEmail"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('phone')}
                    defaultValue={selectedBooking.customerPhone}
                    name="customerPhone"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={et}>
                    <DatePicker
                      label={t('date')}
                      defaultValue={new Date(selectedBooking.date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('time')}
                    defaultValue={selectedBooking.timeslot}
                    name="timeslot"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('notes')}
                    defaultValue={selectedBooking.notes}
                    name="notes"
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>{t('cancel')}</Button>
          <Button 
            onClick={() => handleUpdateBooking({
              customerName: document.getElementsByName('customerName')[0].value,
              customerEmail: document.getElementsByName('customerEmail')[0].value,
              customerPhone: document.getElementsByName('customerPhone')[0].value,
              timeslot: document.getElementsByName('timeslot')[0].value,
              status: document.getElementsByName('status')[0].value,
              notes: document.getElementsByName('notes')[0].value,
            })}
            variant="contained"
          >
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>{t('confirm_delete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('delete_booking_confirmation', { id: selectedBooking?._id })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>{t('cancel')}</Button>
          <Button 
            onClick={handleDeleteBooking} 
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

export default BookingsPage;
