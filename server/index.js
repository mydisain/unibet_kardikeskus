const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Development logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/karts', require('./routes/kartRoutes'));
app.use('/api/kart-types', require('./routes/kartTypeRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});
