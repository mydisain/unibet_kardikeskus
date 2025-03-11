const asyncHandler = require('express-async-handler');
const Kart = require('../models/kartModel');

// @desc    Get all karts
// @route   GET /api/karts
// @access  Public
const getKarts = asyncHandler(async (req, res) => {
  const karts = await Kart.find({ isActive: true });
  res.json(karts);
});

// @desc    Get all karts (including inactive) for admin
// @route   GET /api/karts/admin
// @access  Private/Admin
const getKartsAdmin = asyncHandler(async (req, res) => {
  const karts = await Kart.find({});
  res.json(karts);
});

// @desc    Get single kart
// @route   GET /api/karts/:id
// @access  Public
const getKartById = asyncHandler(async (req, res) => {
  const kart = await Kart.findById(req.params.id);

  if (kart) {
    res.json(kart);
  } else {
    res.status(404);
    throw new Error('Kart not found');
  }
});

// @desc    Create a kart
// @route   POST /api/karts
// @access  Private/Admin
const createKart = asyncHandler(async (req, res) => {
  const { name, description, type, pricePerSlot, quantity, image } = req.body;

  const kart = await Kart.create({
    name,
    description,
    type,
    pricePerSlot,
    quantity,
    image: image || '/images/default-kart.jpg',
    isActive: true,
  });

  if (kart) {
    res.status(201).json(kart);
  } else {
    res.status(400);
    throw new Error('Invalid kart data');
  }
});

// @desc    Update a kart
// @route   PUT /api/karts/:id
// @access  Private/Admin
const updateKart = asyncHandler(async (req, res) => {
  // Handle both direct properties and nested kartData object
  const data = req.body.kartData || req.body;
  const { name, description, type, pricePerSlot, quantity, image, isActive } = data;

  console.log('Update Kart Request:', { id: req.params.id, body: req.body });

  const kart = await Kart.findById(req.params.id);

  if (kart) {
    kart.name = name || kart.name;
    kart.description = description || kart.description;
    kart.type = type || kart.type;
    kart.pricePerSlot = pricePerSlot !== undefined ? pricePerSlot : kart.pricePerSlot;
    kart.quantity = quantity !== undefined ? quantity : kart.quantity;
    kart.image = image || kart.image;
    kart.isActive = isActive !== undefined ? isActive : kart.isActive;

    const updatedKart = await kart.save();
    console.log('Kart updated successfully:', updatedKart);
    res.json(updatedKart);
  } else {
    res.status(404);
    throw new Error('Kart not found');
  }
});

// @desc    Delete a kart
// @route   DELETE /api/karts/:id
// @access  Private/Admin
const deleteKart = asyncHandler(async (req, res) => {
  const kart = await Kart.findById(req.params.id);

  if (kart) {
    await kart.remove();
    res.json({ message: 'Kart removed' });
  } else {
    res.status(404);
    throw new Error('Kart not found');
  }
});

module.exports = {
  getKarts,
  getKartsAdmin,
  getKartById,
  createKart,
  updateKart,
  deleteKart,
};
