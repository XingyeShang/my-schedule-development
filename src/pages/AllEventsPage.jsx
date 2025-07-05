// src/pages/AllEventsPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // 我们也用一个徽章来显示分类
import EventDialog from '../components/EventDialog';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from "sonner";

export default function AllEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, categoriesRes] = await Promise.all([
        api.get('/events'), // 不带日期参数，获取所有母版日程
        api.get('/categories')
      ]);
      setEvents(eventsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("数据加载失败:", err);
      toast.error("数据加载失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    if (!selectedEvent) return;
    try {
      await api.put(`/events/${selectedEvent.id}`, eventData);
      toast.success("日程已成功更新！");
      setIsDialogOpen(false);
      setSelectedEvent(null);
      fetchData();
    } catch (err) {
      console.error("保存失败:", err);
      toast.error("保存失败");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('您确定要删除这个日程（及其所有重复项）吗？')) {
      try {
        await api.delete(`/events/${eventId}`);
        toast.success("日程已成功删除。");
        fetchData();
      } catch (err) {
        console.error("删除失败:", err);
        toast.error("删除失败！");
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '无';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">所有日程</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回日历视图
          </Button>
        </div>

        {isLoading ? <p>加载中...</p> : (
          <div className="bg-white shadow rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">标题</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>开始时间</TableHead>
                  <TableHead>重复规则</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map(event => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryName(event.categoryId)}</Badge>
                    </TableCell>
                    <TableCell>{new Date(event.startTime).toLocaleString()}</TableCell>
                    <TableCell>{event.recurrence || '不重复'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <EventDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        onSave={handleSaveEvent} 
        event={selectedEvent} 
        categories={categories}
        onCategoryCreate={fetchData}
      />
    </div>
  );
}
