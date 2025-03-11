import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import kartReducer from './slices/kartSlice';
import kartTypeReducer from './slices/kartTypeSlice';
import bookingReducer from './slices/bookingSlice';
import settingReducer from './slices/settingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    karts: kartReducer,
    kartTypes: kartTypeReducer,
    bookings: bookingReducer,
    settings: settingReducer,
  },
});

export default store;
