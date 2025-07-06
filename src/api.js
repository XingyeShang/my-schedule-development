// =================================================================
// 文件：src/api.js (升级版)
// =================================================================
// 核心改动：
// 我们为 axios 实例添加了一个“响应拦截器 (response interceptor)”。
// 它就像一个全局的哨兵，会检查每一次从后端返回的响应。
// 如果发现响应是一个 403 权限错误，它会自动执行登出操作，并刷新页面。
// =================================================================

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://my-schedule-api-86a9.onrender.com', // 你的后端API地址
});

// 【关键改动】添加响应拦截器
api.interceptors.response.use(
  // 对于成功的响应 (状态码 2xx)，直接返回响应
  (response) => {
    return response;
  },
  // 对于失败的响应，在这里进行统一处理
  (error) => {
    // 检查错误响应是否存在，并且状态码是否是 401 或 403
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('认证失败或Token过期，将自动登出。');
      
      // 从 localStorage 中移除无效的 token
      localStorage.removeItem('token');
      
      // 清除 axios 实例的认证头
      delete api.defaults.headers.common['Authorization'];
      
      // 给出提示并刷新页面，引导用户到登录页
      // 使用 window.location.replace 比 navigate 更可靠，因为它会强制刷新页面并清除所有状态
      alert('您的登录已过期或无效，请重新登录。');
      window.location.replace('/login');
    }
    
    // 对于其他类型的错误，仍然将它们抛出，以便组件内部的 catch 块可以处理
    return Promise.reject(error);
  }
);


// 在应用加载时，尝试从 localStorage 设置 token
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;