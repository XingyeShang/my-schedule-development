import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import api from '../api';

export default function EventDialog({ isOpen, setIsOpen, onSave, event, defaultDate, categories, onCategoryCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [reminderValue, setReminderValue] = useState('');
  const [reminderUnit, setReminderUnit] = useState('none');
  // 【关键修复】使用 'none' 作为初始值和“无分类”的代表值，而不是空字符串
  const [categoryId, setCategoryId] = useState('none');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ef4444');

  useEffect(() => {
    if (isOpen) {
      if (event) { // 编辑模式
        setTitle(event.title || '');
        setDescription(event.description || '');
        setStartTime(event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '');
        setEndTime(event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '');
        setRecurrence(event.recurrence || 'none');
        setReminderValue(event.reminderValue || '');
        setReminderUnit(event.reminderUnit || 'none');
        // 【关键修复】如果事件有关联的分类，则使用其ID，否则设为 'none'
        setCategoryId(event.categoryId ? String(event.categoryId) : 'none');
      } else { // 新建模式
        setTitle('');
        setDescription('');
        if (defaultDate) {
          const prefillDateTime = new Date(defaultDate);
          prefillDateTime.setHours(9, 0);
          const prefillString = prefillDateTime.toISOString().slice(0, 16);
          setStartTime(prefillString);
          setEndTime(prefillString);
        } else {
          setStartTime('');
          setEndTime('');
        }
        setRecurrence('none');
        setReminderValue('');
        setReminderUnit('none');
        setCategoryId('none');
      }
    }
  }, [event, isOpen, defaultDate]);

  const handleSave = () => {
    if (!title || !startTime || !endTime) {
        alert("请填写所有必填项。");
        return;
    }
    // 【关键修复】在保存时，将 'none' 转换回 null，以便后端正确处理
    const finalCategoryId = categoryId === 'none' ? null : categoryId;
    onSave({ title, description, startTime, endTime, recurrence, reminderValue, reminderUnit, categoryId: finalCategoryId });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) {
      alert("请输入新分类的名称。");
      return;
    }
    try {
      await api.post('/categories', { name: newCategoryName, color: newCategoryColor });
      setNewCategoryName('');
      onCategoryCreate(); // 调用回调函数，刷新Dashboard的数据
      alert("分类创建成功！");
    } catch (err) {
      alert("创建分类失败：" + (err.response?.data?.error || '未知错误'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? '编辑日程' : '新建日程'}</DialogTitle>
          <DialogDescription>在这里填写或修改您的日程详情。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">标题</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">描述</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">开始时间</Label>
            <Input id="startTime" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">结束时间</Label>
            <Input id="endTime" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="col-span-3" required />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">分类</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Select value={categoryId} onValueChange={(value) => setCategoryId(value)}>
                <SelectTrigger><SelectValue placeholder="选择一个分类" /></SelectTrigger>
                <SelectContent>
                  {/* 【关键修复】将 value="" 改为 value="none" */}
                  <SelectItem value="none">无分类</SelectItem>
                  {categories && categories.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">+</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 space-y-2">
                  <p className="font-semibold">新建分类</p>
                  <Input placeholder="分类名称" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                  <Input type="color" value={newCategoryColor} onChange={e => setNewCategoryColor(e.target.value)} className="p-1 h-10 w-full" />
                  <Button onClick={handleCreateCategory}>创建</Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recurrence" className="text-right">重复规则</Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不重复</SelectItem>
                <SelectItem value="daily">每天</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
                <SelectItem value="monthly">每月</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">提醒设置</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <Input type="number" placeholder="数值" value={reminderValue} onChange={(e) => setReminderValue(e.target.value)} disabled={reminderUnit === 'none'} />
              <Select value={reminderUnit} onValueChange={setReminderUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不提醒</SelectItem>
                  <SelectItem value="minutes">分钟前</SelectItem>
                  <SelectItem value="hours">小时前</SelectItem>
                  <SelectItem value="days">天前</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
