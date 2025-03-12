import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get available timeslots
export const getAvailableTimeslots = createAsyncThunk(
  'bookings/getAvailableTimeslots',
  async (date, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/bookings/timeslots?date=${date}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create booking
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post('https://adminunibet.bookid.ee/api/bookings', bookingData, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get all bookings (admin)
export const getBookings = createAsyncThunk(
  'bookings/getBookings',
  async (params, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        params,
      };

      const { data } = await axios.get('https://adminunibet.bookid.ee/api/bookings', config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get booking by ID (admin)
export const getBookingById = createAsyncThunk(
  'bookings/getBookingById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/bookings/${id}`, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update booking (admin)
export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ id, bookingData }, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(`/api/bookings/${id}`, bookingData, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete booking (admin)
export const deleteBooking = createAsyncThunk(
  'bookings/deleteBooking',
  async (id, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.delete(`/api/bookings/${id}`, config);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const initialState = {
  bookings: [],
  booking: null,
  timeslots: [],
  selectedTimeslots: [],
  kartSelections: [],
  customerInfo: {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  },
  loading: false,
  error: null,
  success: false,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
    selectTimeslot: (state, action) => {
      const { timeslot } = action.payload;
      
      // Check if timeslot is already selected
      const isSelected = state.selectedTimeslots.some(
        (ts) => ts.startTime === timeslot.startTime
      );
      
      if (isSelected) {
        // Remove timeslot if already selected
        state.selectedTimeslots = state.selectedTimeslots.filter(
          (ts) => ts.startTime !== timeslot.startTime
        );
      } else {
        // Add timeslot if not selected
        state.selectedTimeslots = [...state.selectedTimeslots, timeslot];
        
        // Sort timeslots by startTime
        state.selectedTimeslots.sort((a, b) => {
          if (a.startTime < b.startTime) return -1;
          if (a.startTime > b.startTime) return 1;
          return 0;
        });
      }
    },
    updateKartSelections: (state, action) => {
      state.kartSelections = action.payload;
    },
    updateCustomerInfo: (state, action) => {
      state.customerInfo = {
        ...state.customerInfo,
        ...action.payload,
      };
    },
    resetBookingState: (state) => {
      state.selectedTimeslots = [];
      state.kartSelections = [];
      state.customerInfo = {
        customerName: '',
        customerEmail: '',
        customerPhone: '',
      };
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAvailableTimeslots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableTimeslots.fulfilled, (state, action) => {
        state.loading = false;
        state.timeslots = action.payload;
      })
      .addCase(getAvailableTimeslots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.booking = action.payload;
        state.success = true;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.booking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.booking = action.payload;
        state.bookings = state.bookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        );
        state.success = true;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter(
          (booking) => booking._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  resetSuccess,
  selectTimeslot,
  updateKartSelections,
  updateCustomerInfo,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;
