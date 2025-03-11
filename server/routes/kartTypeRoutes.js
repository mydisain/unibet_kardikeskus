const express = require('express');
const router = express.Router();
const {
  getKartTypes,
  getKartTypesAdmin,
  getKartTypeById,
  createKartType,
  updateKartType,
  deleteKartType,
} = require('../controllers/kartTypeController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getKartTypes);
router.get('/:id', getKartTypeById);

// Admin routes
router.get('/admin/all', protect, admin, getKartTypesAdmin);
router.post('/', protect, admin, createKartType);
router.put('/:id', protect, admin, updateKartType);
router.delete('/:id', protect, admin, deleteKartType);

module.exports = router;
