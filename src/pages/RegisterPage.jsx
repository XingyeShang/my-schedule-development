// src/pages/RegisterPage.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import api from '../api';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 6) {
      toast.warning("密码长度不能小于6位。");
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      toast.success("注册成功！", { description: "现在您可以使用新账户登录了。" });
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.error || '注册失败，请重试。';
      toast.error("注册失败", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <UserPlus size={48} className="text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          创建您的新账户
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
                placeholder="请输入至少6位密码" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">已经有账户了？去登录</Link>
              </div>
            </div>
            <div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? '注册中...' : '注 册'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}