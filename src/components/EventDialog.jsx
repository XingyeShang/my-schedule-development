import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EventDialog({ isOpen, setIsOpen, onSave, event }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');

  useEffect(() => {
    // 只有当模态框打开时才更新状态
    if (isOpen) {
      if (event) {
        // 编辑模式
        setTitle(event.title || '');
        setDescription(event.description || '');
        setStartTime(event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '');
        setEndTime(event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '');
        setRecurrence(event.recurrence || 'none');
      } else {
        // 新建模式
        setTitle('');
        setDescription('');
        setStartTime('');
        setEndTime('');
        setRecurrence('none');
      }
    }
  }, [event, isOpen]); // 依赖项包含 isOpen，确保每次打开都重置

  const handleSave = () => {
    // 进行基本的前端验证
    if (!title || !startTime || !endTime) {
      alert("请填写标题、开始时间和结束时间。");
      return;
    }
    // 将所有状态数据通过 onSave 回调函数传递出去
    onSave({ title, description, startTime, endTime, recurrence });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? '编辑日程' : '新建日程'}</DialogTitle>
          <DialogDescription>
            在这里填写您的日程详情。点击保存即可完成。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              标题
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              描述
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              开始时间
            </Label>
            <Input id="startTime" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="col-span-3" required />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              结束时间
            </Label>
            <Input id="endTime" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recurrence" className="text-right">
              重复规则
            </Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择重复规则" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不重复</SelectItem>
                <SelectItem value="daily">每天</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
                <SelectItem value="monthly">每月</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}