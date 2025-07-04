// src/pages/ManageCategoriesPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, ChevronLeft } from 'lucide-react';

export default function ManageCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#000000');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error("获取分类失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('您确定要删除这个分类吗？所有使用此分类的日程将变为“无分类”。')) {
      try {
        await api.delete(`/categories/${categoryId}`);
        fetchCategories();
      } catch (err) {
        // 【关键修复】增强错误提示
        const errorMessage = err.response?.data?.error || '删除失败！';
        console.error("删除分类失败:", err);
        alert(errorMessage);
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewName(category.name);
    setNewColor(category.color);
  };

  const handleUpdate = async () => {
    if (!editingCategory || !newName) return;
    try {
      await api.put(`/categories/${editingCategory.id}`, { name: newName, color: newColor });
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      alert('更新失败：' + (err.response?.data?.error || '未知错误'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回主面板
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">管理我的分类</h1>

        {isLoading ? <p>加载中...</p> : (
          <div className="space-y-4">
            {categories.map(category => (
              <Card key={category.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  {editingCategory?.id === category.id ? (
                    // 编辑模式
                    <div className="flex-grow flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: newColor }}></div>
                      <Input value={newName} onChange={e => setNewName(e.target.value)} className="max-w-xs" />
                      <Input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-16 h-10 p-1" />
                    </div>
                  ) : (
                    // 展示模式
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <p className="font-semibold">{category.name}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {editingCategory?.id === category.id ? (
                      <>
                        <Button onClick={handleUpdate}>保存</Button>
                        <Button variant="ghost" onClick={() => setEditingCategory(null)}>取消</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
