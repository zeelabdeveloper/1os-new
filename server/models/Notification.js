const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const NotificationSchema = new mongoose.Schema({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
   
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    
  },
  message: {
    type: String,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'alert', 'task', 'system'],
    default: 'info',
  },
  link: {
    type: String, 
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
} , {timestamps:true}  );
NotificationSchema.plugin(mongoosePaginate);
const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
