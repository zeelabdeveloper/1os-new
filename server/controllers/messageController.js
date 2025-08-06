const Message = require('../models/Message');
const asyncHandler = require('express-async-handler');

// Create message
exports.createMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
console.log(req.body)
  if (!content) {
    res.status(400);
    throw new Error('Message content is required');
  }

  const message = await Message.create({ ...req.body });
  res.status(201).json(message);
});

// Get all active messages
exports.getActiveMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json(messages);
});

// Get all messages (admin)
exports.getAllMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.status(200).json(messages);
});

// Update message
exports.updateMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  message.content = req.body.content || message.content;
  message.isActive = req.body.isActive !== undefined ? req.body.isActive : message.isActive;

  const updatedMessage = await message.save();
  res.status(200).json(updatedMessage);
});

// Delete message
exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  await message.deleteOne();
  res.status(200).json({ id: req.params.id });
});