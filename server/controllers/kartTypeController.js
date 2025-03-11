const asyncHandler = require('express-async-handler');
const KartType = require('../models/kartTypeModel');

// @desc    Get all kart types
// @route   GET /api/kart-types
// @access  Public
const getKartTypes = asyncHandler(async (req, res) => {
  const kartTypes = await KartType.find({ isActive: true }).sort({ name: 1 });
  res.json(kartTypes);
});

// @desc    Get all kart types (admin)
// @route   GET /api/kart-types/admin/all
// @access  Private/Admin
const getKartTypesAdmin = asyncHandler(async (req, res) => {
  const kartTypes = await KartType.find({}).sort({ name: 1 });
  res.json(kartTypes);
});

// @desc    Get kart type by ID
// @route   GET /api/kart-types/:id
// @access  Public
const getKartTypeById = asyncHandler(async (req, res) => {
  const kartType = await KartType.findById(req.params.id);

  if (kartType) {
    res.json(kartType);
  } else {
    res.status(404);
    throw new Error('Kart type not found');
  }
});

// @desc    Create a kart type
// @route   POST /api/kart-types
// @access  Private/Admin
const createKartType = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const kartTypeExists = await KartType.findOne({ name });

  if (kartTypeExists) {
    res.status(400);
    throw new Error('Kart type already exists');
  }

  const kartType = await KartType.create({
    name,
    description,
  });

  if (kartType) {
    res.status(201).json(kartType);
  } else {
    res.status(400);
    throw new Error('Invalid kart type data');
  }
});

// @desc    Update a kart type
// @route   PUT /api/kart-types/:id
// @access  Private/Admin
const updateKartType = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;

  const kartType = await KartType.findById(req.params.id);

  if (kartType) {
    kartType.name = name || kartType.name;
    kartType.description = description || kartType.description;
    
    if (isActive !== undefined) {
      kartType.isActive = isActive;
    }

    const updatedKartType = await kartType.save();
    res.json(updatedKartType);
  } else {
    res.status(404);
    throw new Error('Kart type not found');
  }
});

// @desc    Delete a kart type
// @route   DELETE /api/kart-types/:id
// @access  Private/Admin
const deleteKartType = asyncHandler(async (req, res) => {
  const kartType = await KartType.findById(req.params.id);

  if (kartType) {
    await kartType.remove();
    res.json({ message: 'Kart type removed' });
  } else {
    res.status(404);
    throw new Error('Kart type not found');
  }
});

module.exports = {
  getKartTypes,
  getKartTypesAdmin,
  getKartTypeById,
  createKartType,
  updateKartType,
  deleteKartType,
};
