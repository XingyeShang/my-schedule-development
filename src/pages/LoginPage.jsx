// src/pages/LoginPage.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner" // 引入 toast
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token);
      toast.success("登录成功", { description: "欢迎回来！" });
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.error || '登录失败，请重试。';
      toast.error("登录失败", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <LogIn size={48} className="text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          登录您的账户
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">邮箱地址</Label>
              <Input 
                type="email" 
                id="email" 
                placeholder="请输入您的邮箱" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">密码</Label>
              <Input 
                type="password" 
                id="password" 
                placeholder="请输入您的密码" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">还没有账户？去注册</Link>
              </div>
            </div>
            <div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? '登录中...' : '登 录'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
