// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// 关键改动：引入新日历库的CSS样式文件
import 'react-day-picker/dist/style.css';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/sonner" // 1. 引入 Toaster


// 引入所有页面组件
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx'; // 引入新的日历页面
import ManageCategoriesPage from './pages/ManageCategoriesPage.jsx'; // 1. 引入新页面
import AllEventsPage from './pages/AllEventsPage.jsx'; // 1. 引入新页面

// 创建路由配置
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    // 关键改动：为日历页面添加受保护的路由
    path: "/calendar",
    element: (
      <ProtectedRoute>
        <CalendarPage />
      </ProtectedRoute>
    ),
  },
   {
    path: "/manage-categories", // 2. 添加新路由
    element: (
      <ProtectedRoute>
        <ManageCategoriesPage />
      </ProtectedRoute>
    ),
  },
    {
    path: "/all-events", // 2. 添加新路由
    element: (
      <ProtectedRoute>
        <AllEventsPage />
      </ProtectedRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors /> {/* 2. 在这里渲染 Toaster 组件 */}
    </AuthProvider>
  </React.StrictMode>,
)