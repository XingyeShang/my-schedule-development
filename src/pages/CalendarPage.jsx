import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { zhCN } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import EventDialog from '../components/EventDialog';
import api from '../api';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDayClick = (day) => {
    if (day) {
      setSelectedDate(day);
      setIsDialogOpen(true);
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      const startTime = new Date(eventData.startTime);
      const endTime = new Date(eventData.endTime);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || endTime.getTime() <= startTime.getTime()) {
        alert("请提供有效的开始和结束日期时间，且结束时间必须在开始时间之后！");
        return;
      }
      
      const payload = {
        title: eventData.title,
        description: eventData.description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        recurrence: eventData.recurrence === 'none' ? null : eventData.recurrence,
        reminderValue: eventData.reminderUnit !== 'none' && eventData.reminderValue > 0 ? parseInt(eventData.reminderValue, 10) : null,
        reminderUnit: eventData.reminderUnit !== 'none' && eventData.reminderValue > 0 ? eventData.reminderUnit : null,
      };

      await api.post('/events', payload);
      setIsDialogOpen(false);
      alert('日程创建成功！');
      navigate('/');
    } catch (err) {
      console.error("保存失败", err);
      alert("保存失败，请检查您的输入。");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-full md:w-1/2 lg:w-2/3 flex items-center justify-center p-4 md:p-8 bg-gray-200">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <DayPicker 
            mode="single" 
            required 
            selected={selectedDate} 
            onSelect={setSelectedDate} 
            locale={zhCN} 
            showOutsideDays 
            fixedWeeks 
            classNames={{ 
              day_selected: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:bg-indigo-700', 
              day_today: 'font-bold text-indigo-600' 
            }}
          />
        </div>
      </div>
      <div className="w-full md:w-1/2 lg:w-1/3 p-8 bg-white flex flex-col justify-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">创建新日程</h2>
          <p className="text-gray-600 mb-6">请先在左侧日历上选择一个日期。</p>
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-500">当前已选日期</Label>
            <p className="text-2xl font-semibold text-indigo-600">{selectedDate ? selectedDate.toLocaleDateString() : '未选择'}</p>
          </div>
          <Button onClick={() => handleDayClick(selectedDate)} disabled={!selectedDate} className="w-full">为选中日期添加日程详情</Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full mt-2">返回主面板</Button>
        </div>
      </div>
      <EventDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        onSave={handleSaveEvent} 
        event={null} 
        defaultDate={selectedDate} 
      />
    </div>
  );
}
