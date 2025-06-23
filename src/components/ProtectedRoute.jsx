// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // <-- 从新的 hooks 文件导入

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // 如果用户未认证，则重定向到登录页面
    return <Navigate to="/login" replace />;
  }

  return children; // 如果已认证，则渲染子组件
}
