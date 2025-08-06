import axios from '../axiosConfig';
import { toast } from 'react-hot-toast';

const API_URL = '/api/v1/messages';

// Get all messages
const getAllMessages = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch messages');
    throw error;
  }
};

// Get active messages
const getActiveMessages = async () => {
  try {
    const response = await axios.get(`${API_URL}/active`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch active messages');
    throw error;
  }
};

// Create message
const createMessage = async (messageData) => {
  try {
    const response = await axios.post(API_URL, messageData);
    toast.success('Message created successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create message');
    throw error;
  }
};

// Update message
const updateMessage = async (id, messageData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, messageData);
    toast.success('Message updated successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update message');
    throw error;
  }
};

// Delete message
const deleteMessage = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    toast.success('Message deleted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete message');
    throw error;
  }
};

export default {
  getAllMessages,
  getActiveMessages,
  createMessage,
  updateMessage,
  deleteMessage
};