const express = require('express');
const router = express.Router();
 const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notification/Notication');

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
 

module.exports = router;