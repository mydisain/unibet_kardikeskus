const express = require('express');
const router = express.Router();
const {
  getKarts,
  getKartsAdmin,
  getKartById,
  createKart,
  updateKart,
  deleteKart,
} = require('../controllers/kartController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes
router.get('/admin/all', protect, admin, getKartsAdmin);
router.post('/', protect, admin, createKart);
router.put('/:id', protect, admin, updateKart);
router.delete('/:id', protect, admin, deleteKart);

// Public routes
router.get('/', getKarts);
router.get('/:id', getKartById);

module.exports = router;
