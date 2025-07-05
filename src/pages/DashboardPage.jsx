import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import EventDialog from '../components/EventDialog';
import { Plus, LogOut, CalendarHeart, Settings, Search, List } from 'lucide-react';
import { toast } from "sonner";

// FullCalendar 相关的导入
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { formatISO } from 'date-fns';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // 为筛选和搜索功能创建新的状态
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 创建一个对 FullCalendar 的引用，以便调用其API
  const calendarRef = useRef(null);

  useEffect(() => {
    // 初次加载时，获取分类数据
    fetchCategories();
  }, []);
  
  // 当筛选条件或搜索词变化时，让日历重新获取事件
  useEffect(() => {
    // 使用防抖技术，避免用户每次按键都触发刷新
    const debounce = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    }, 500); // 用户停止输入500毫秒后执行

    return () => clearTimeout(debounce);
  }, [filterCategoryId, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error("获取分类失败:", err);
      toast.error("获取分类失败");
    }
  };

  // 这个函数现在作为 FullCalendar 的 events 属性，由日历在需要时自动调用
  const fetchEvents = async (fetchInfo, successCallback, failureCallback) => {
    try {
      const response = await api.get('/events', {
        params: {
          start: formatISO(fetchInfo.start),
          end: formatISO(fetchInfo.end),
          categoryId: filterCategoryId === 'all' ? undefined : filterCategoryId,
          search: searchTerm || undefined,
        }
      });
      
      // 将我们的日程数据转换成 FullCalendar 能识别的格式
      const formattedEvents = response.data.map(event => {
        const category = categories.find(c => c.id === event.categoryId);
        return {
          id: event.id,
          title: event.title,
          start: event.startTime,
          end: event.endTime,
          backgroundColor: category ? category.color : '#3788d8', // 默认蓝色
          borderColor: category ? category.color : '#3788d8',
          extendedProps: event, // 保存原始数据
        };
      });
      successCallback(formattedEvents);
    } catch (err) {
      console.error("获取日程失败:", err);
      toast.error("获取日程失败");
      if (failureCallback) {
        failureCallback(err);
      }
    }
  };
  
  const handleLogout = () => { logout(); navigate('/login'); };

  const handleEventClick = (clickInfo) => {
    // 当用户点击日历上的一个日程时
    setSelectedEvent(clickInfo.event.extendedProps);
    setIsDialogOpen(true);
  };

  const handleEventChange = async (changeInfo) => {
    // 当用户拖拽或调整日程大小后
    try {
      await api.put(`/events/${changeInfo.event.id}`, {
        startTime: changeInfo.event.start.toISOString(),
        endTime: changeInfo.event.end.toISOString(),
      });
      toast.success("日程时间已更新");
    } catch (err) {
      console.error("更新日程失败:", err);
      toast.error("更新日程失败");
      changeInfo.revert(); // 如果失败，让日程回到原来位置
    }
  };

  const handleSaveEvent = async (eventData) => {
    // 保存逻辑不变，但成功后需要刷新日历
    try {
      if (selectedEvent) {
        await api.put(`/events/${selectedEvent.id}`, eventData);
        toast.success("日程已成功更新！");
        setIsDialogOpen(false);
        setSelectedEvent(null);
        calendarRef.current.getApi().refetchEvents(); // 刷新日历事件
      }
    } catch (err) {
      console.error("保存失败:", err);
      toast.error("保存失败");
    }
  };

  // 与 FullCalendar 配合的乐观更新删除逻辑
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('您确定要删除这个日程吗？此操作不可撤销。')) {
      return;
    }

    const calendarApi = calendarRef.current.getApi();
    const eventToRemove = calendarApi.getEventById(eventId);

    if (eventToRemove) {
      eventToRemove.remove();
    }
    
    setIsDialogOpen(false);
    setSelectedEvent(null);

    try {
      await api.delete(`/events/${eventId}`);
      toast.success("日程已成功删除。");
    } catch (err) {
      console.error("删除失败:", err);
      toast.error("删除失败！", {
        description: "无法连接到服务器，您的改动已撤销。",
      });
      if (eventToRemove) {
        calendarApi.addEvent(eventToRemove.toPlainObject());
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 flex items-center gap-2">
                <CalendarHeart className="h-8 w-8 text-pink-500" />
                <span className="text-xl font-bold text-gray-800">我的日历</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="搜索日程..."
                  className="w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/all-events')}><List className="mr-2 h-4 w-4" /> 所有日程</Button>
              <Button variant="outline" onClick={() => navigate('/manage-categories')}><Settings className="mr-2 h-4 w-4" /> 管理分类</Button>
              <Button onClick={() => navigate('/calendar')}><Plus className="mr-2 h-4 w-4" /> 新建日程</Button>
              <button onClick={handleLogout} type="button" className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition-all hover:bg-gray-50"><LogOut className="h-4 w-4" />退出登录</button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-grow p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          locale="zh-cn"
          buttonText={{ today: '今天', month: '月', week: '周', day: '日' }}
          events={fetchEvents}
          editable={true}
          selectable={true}
          eventClick={handleEventClick}
          eventDrop={handleEventChange}
          eventResize={handleEventChange}
        />
      </main>
      
      <EventDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        onSave={handleSaveEvent} 
        onDelete={handleDeleteEvent}
        event={selectedEvent} 
        categories={categories}
        onCategoryCreate={() => {
          fetchCategories();
          calendarRef.current.getApi().refetchEvents();
        }}
      />
    </div>
  );
}