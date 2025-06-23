import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import EventDialog from '../components/EventDialog';
import { Plus, Edit, Trash2, LogOut, CalendarHeart } from 'lucide-react';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (err) {
      console.error("获取日程失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent) {
        // 更新逻辑
        await api.put(`/events/${selectedEvent.id}`, eventData);
      } else {
        // 新建逻辑（理论上这个页面不处理新建，但保留以防万一）
        await api.post('/events', eventData);
      }
      setIsDialogOpen(false);
      setSelectedEvent(null);
      fetchEvents(); // 刷新列表
    } catch (err) {
      console.error("保存失败", err);
      alert("保存失败，请检查您的输入。");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('您确定要删除这个日程吗？')) {
      try {
        await api.delete(`/events/${eventId}`);
        fetchEvents();
      } catch (err) {
        console.error("删除失败", err);
        alert("删除失败！");
      }
    }
  };

  // Framer Motion 动画变体定义
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 fixed top-0 left-0 right-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <CalendarHeart className="h-8 w-8 text-pink-500" />
                <span className="text-xl font-bold text-gray-800">我的日程</span>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={handleLogout} type="button" className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 active:scale-95">
                <LogOut className="h-4 w-4" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="pt-24 pb-10">
        <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">日程主面板</h1>
              <p className="mt-2 text-sm text-gray-700">在这里管理您的所有日程安排。</p>
            </div>
            {/* 新建按钮现在会导航到日历页面 */}
            <Button onClick={() => navigate('/calendar')}>
              <Plus className="mr-2 h-4 w-4" /> 新建日程
            </Button>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 mt-8">
            {isLoading ? (
              <p className="text-center text-gray-500">正在加载日程...</p>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {events.length > 0 ? (
                  events.map(event => (
                    <motion.div key={event.id} variants={itemVariants}>
                      <Card className="flex flex-col h-full transition-all hover:shadow-lg">
                        <CardHeader>
                          <CardTitle className="truncate">{event.title}</CardTitle>
                          <CardDescription>{new Date(event.startTime).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-gray-600">{event.description || '无描述'}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                              <p>结束于: {new Date(event.endTime).toLocaleTimeString()}</p>
                          </div>
                          <div className="flex gap-2">
                             <Button variant="ghost" size="icon" onClick={() => { setSelectedEvent(event); setIsDialogOpen(true); }}>
                                 <Edit className="h-4 w-4" />
                             </Button>
                             <Button variant="destructive" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                                 <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="md:col-span-3 text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
                    <p className="text-gray-500">您还没有任何日程，快去创建一个吧！</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
      <EventDialog 
          isOpen={isDialogOpen} 
          setIsOpen={setIsDialogOpen}
          onSave={handleSaveEvent}
          event={selectedEvent}
      />
    </div>
  );
}