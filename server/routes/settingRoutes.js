const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  addHoliday,
  removeHoliday,
  updateEmailTemplate,
  testEmailConfiguration,
} = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes for settings management
router.route('/')
  .get(protect, admin, getSettings) // Admin access for full settings
  .put(protect, admin, updateSettings); // Admin only for updates

// Public route for getting settings - no authentication required
router.get('/public', getSettings);

router.route('/holidays')
  .post(protect, admin, addHoliday)
  .delete(protect, admin, removeHoliday);

router.put('/email-templates/:type', protect, admin, updateEmailTemplate);
router.post('/test-email', protect, admin, testEmailConfiguration);

module.exports = router;
