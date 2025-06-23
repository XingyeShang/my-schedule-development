import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; // 引入我们统一的API客户端

export default function RegisterPage() {
  // 同样使用 useState 来管理输入状态
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // 用于存储和显示错误信息
  const navigate = useNavigate(); // 用于页面跳转

  const handleSubmit = async (event) => {
    event.preventDefault(); // 阻止表单默认的提交行为
    setError(''); // 清空旧的错误信息

    // 对密码长度进行前端的基本验证
    if (password.length < 6) {
      setError('密码长度不能小于6位。');
      return; // 停止执行后续代码
    }

    try {
      // 关键区别：调用 /auth/register 接口
      const response = await api.post('/auth/register', {
        email,
        password,
      });

      console.log('注册成功!', response.data);
      alert('注册成功！现在您可以去登录了。');

      // 关键区别：注册成功后，跳转到登录页面
      navigate('/login');

    } catch (err) {
      console.error('注册失败!', err);
      // 从后端响应中获取错误信息
      const errorMessage = err.response?.data?.error || '注册失败，请检查您的输入或稍后再试。';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          创建您的新账户
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                邮箱地址
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="密码 (至少6位)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {/* 在表单中显示错误信息 */}
          {error && (
            <p className="text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                已经有账户了？去登录
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              注 册
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
