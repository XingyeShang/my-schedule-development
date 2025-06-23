// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // 你的后端API地址
});

export default api;