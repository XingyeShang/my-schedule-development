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

// 引入 React Query 的核心钩子
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 将API调用逻辑抽离出来，以便在 useQuery 和 useMutation 中复用
const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

const updateEvent = async (eventData) => {
  // 如果是拖拽更新，只发送时间和ID
  if (eventData.startTime && eventData.endTime && !eventData.title) {
     const response = await api.put(`/events/${eventData.id}`, {
        startTime: eventData.startTime,
        endTime: eventData.endTime,
     });
     return response.data;
  }
  // 否则是完整的表单更新
  const response = await api.put(`/events/${eventData.id}`, eventData);
  return response.data;
};

const deleteEvent = async (eventId) => {
  await api.delete(`/events/${eventId}`);
};


export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const calendarRef = useRef(null);
  
  const queryClient = useQueryClient();

  // 使用 useQuery 来获取分类数据，并处理错误
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    onError: (err) => {
      console.error("获取分类失败:", err);
      toast.error("获取分类失败", { description: "无法从服务器加载分类数据。" });
    }
  });

  // 当筛选条件或搜索词变化时，让日历重新获取事件
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [filterCategoryId, searchTerm, categories]); // categories 加入依赖，确保分类颜色能及时更新

  // FullCalendar 的事件获取函数
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
      const formattedEvents = response.data.map(event => {
        const category = categories.find(c => c.id === event.categoryId);
        return {
          id: String(event.id),
          title: event.title,
          start: event.startTime,
          end: event.endTime,
          backgroundColor: category ? category.color : '#3788d8',
          borderColor: category ? category.color : '#3788d8',
          extendedProps: event,
        };
      });
      successCallback(formattedEvents);
    } catch (err) {
      toast.error("获取日程失败");
      if (failureCallback) failureCallback(err);
    }
  };
  
  const handleLogout = () => { logout(); navigate('/login'); };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event.extendedProps);
    setIsDialogOpen(true);
  };

  // 【关键修复】创建并使用 eventChangeMutation 来处理拖拽更新
  const eventChangeMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      toast.success("日程时间已更新");
    },
    onError: (err, variables, context) => {
      toast.error("更新日程失败");
      context.revert(); // 使用 context 中的 revert 函数来回滚UI
    }
  });

  const handleEventChange = (changeInfo) => {
    eventChangeMutation.mutate(
      {
        id: changeInfo.event.id,
        startTime: changeInfo.event.start.toISOString(),
        endTime: changeInfo.event.end.toISOString(),
      },
      {
        // 将 revert 函数传递给 context，以便在 onError 中调用
        context: { revert: changeInfo.revert }
      }
    );
  };

  // 使用 useMutation 来处理对话框中的保存操作
  const saveEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      toast.success("日程已成功更新！");
      calendarRef.current.getApi().refetchEvents();
    },
    onError: (err) => {
      console.error("更新失败:", err);
      toast.error("更新失败", { description: "请检查您的输入或稍后再试。" });
    }
  });

  const handleSaveEvent = (eventData) => {
    if (!selectedEvent) return;
    saveEventMutation.mutate({ ...eventData, id: selectedEvent.id });
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  // 使用 useMutation 来处理删除操作，并实现乐观更新
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success("日程已成功删除。");
    },
    // 【关键修复】实现真正的乐观更新回滚
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      const calendarApi = calendarRef.current.getApi();
      const eventToRemove = calendarApi.getEventById(String(eventId));
      if (eventToRemove) {
        eventToRemove.remove();
        return { eventToRemove }; // 返回被移除的事件，以便在失败时回滚
      }
      return {};
    },
    onError: (err, eventId, context) => {
      console.error("删除失败:", err);
      toast.error("删除失败！", { description: "您的改动已撤销。" });
      if (context.eventToRemove) {
        calendarRef.current.getApi().addEvent(context.eventToRemove.toPlainObject());
      }
    },
    onSettled: () => {
      calendarRef.current.getApi().refetchEvents();
    },
  });

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('您确定要删除这个日程吗？')) {
      deleteEventMutation.mutate(eventId);
      setIsDialogOpen(false);
      setSelectedEvent(null);
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
              <Select value={filterCategoryId} onValueChange={setFilterCategoryId} disabled={isLoadingCategories}>
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
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }}
      />
    </div>
  );
}
