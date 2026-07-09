import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MaintenanceTask, InventoryItem } from '@/types';
import { MAINTENANCE_PRESETS } from '@/types';
import { Wrench, CheckCircle2, AlertCircle, Clock, Plus, Trash2, RotateCcw } from 'lucide-react';

interface MaintenanceProps {
  tasks: MaintenanceTask[];
  items: InventoryItem[];
  onAddTask: (task: any) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  darkMode: boolean;
}

export default function Maintenance({ tasks, items, onAddTask, onCompleteTask, onDeleteTask, darkMode }: MaintenanceProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<{
    itemId: string;
    title: string;
    description: string;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    customDays: string;
    priority: 'low' | 'medium' | 'high';
  }>({
    itemId: '',
    title: '',
    description: '',
    frequency: 'monthly',
    customDays: '',
    priority: 'medium',
  });

  const overdueTasks = tasks.filter(t => t.isOverdue && !t.completed).sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime());
  const upcomingTasks = tasks.filter(t => !t.isOverdue && !t.completed).sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime());

  const getDaysUntil = (dateStr: string) => {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getDueBadge = (task: MaintenanceTask) => {
    if (task.isOverdue) return { label: `${Math.abs(getDaysUntil(task.nextDue))}d overdue`, color: 'bg-red-500' };
    const days = getDaysUntil(task.nextDue);
    if (days <= 7) return { label: `${days}d left`, color: 'bg-amber-500' };
    return { label: `${days}d left`, color: 'bg-emerald-500' };
  };

  const handleAddTask = () => {
    if (!newTask.title) return;
    
    const item = items.find(i => i.id === newTask.itemId);
    
    onAddTask({
      itemId: newTask.itemId || '',
      itemName: item?.name || 'General',
      title: newTask.title,
      description: newTask.description,
      frequency: newTask.frequency,
      customDays: newTask.customDays ? parseInt(newTask.customDays) : undefined,
      lastDone: new Date().toISOString().split('T')[0],
      priority: newTask.priority,
    });

    setShowAddDialog(false);
    setNewTask({
      itemId: '',
      title: '',
      description: '',
      frequency: 'monthly',
      customDays: '',
      priority: 'medium',
    });
  };

  const addPreset = (preset: typeof MAINTENANCE_PRESETS[0]) => {
    onAddTask({
      itemId: '',
      itemName: 'General',
      title: preset.title,
      description: preset.description,
      frequency: preset.frequency,
      lastDone: new Date().toISOString().split('T')[0],
      priority: 'medium',
    });
  };

  const TaskCard = ({ task }: { task: MaintenanceTask }) => {
    const badge = getDueBadge(task);
    return (
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} transition-all hover:shadow-md`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => onCompleteTask(task.id)}
              className="mt-0.5 flex-shrink-0"
            >
              <CheckCircle2 className={`w-6 h-6 transition-colors ${task.isOverdue ? 'text-red-400 hover:text-emerald-500' : 'text-gray-300 hover:text-emerald-500'}`} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                <Badge className={`text-xs text-white ${badge.color}`}>{badge.label}</Badge>
                <Badge variant="outline" className="text-xs">{task.frequency}</Badge>
              </div>
              {task.itemName && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{task.itemName}</p>
              )}
              {task.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>Last: {task.lastDone}</span>
                <span>Next: {task.nextDue}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteDialog(task.id)}
              className="text-gray-400 hover:text-red-500 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Keep your home and items in top condition</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      {tasks.length < 5 && (
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 dark:text-gray-400">Quick Add Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {MAINTENANCE_PRESETS.map((preset, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => addPreset(preset)}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {preset.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No maintenance tasks yet</p>
          <p className="text-sm text-gray-400 mb-4">Add tasks or use quick presets to get started</p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline">
            Add Your First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {overdueTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Overdue ({overdueTasks.length})
              </h2>
              <div className="space-y-3">
                {overdueTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Upcoming ({upcomingTasks.length})
              </h2>
              <div className="space-y-3">
                {upcomingTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Maintenance Task</DialogTitle>
            <DialogDescription>Set up a recurring maintenance reminder</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Title *</Label>
              <Input
                value={newTask.title}
                onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Clean AC Filter"
              />
            </div>
            <div>
              <Label>Linked Item (optional)</Label>
              <Select value={newTask.itemId} onValueChange={v => setNewTask(p => ({ ...p, itemId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (General)</SelectItem>
                  {items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={newTask.frequency} onValueChange={v => setNewTask(p => ({ ...p, frequency: v as typeof p.frequency }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newTask.frequency === 'custom' && (
              <div>
                <Label>Every X Days</Label>
                <Input
                  type="number"
                  value={newTask.customDays}
                  onChange={e => setNewTask(p => ({ ...p, customDays: e.target.value }))}
                  placeholder="e.g., 45"
                />
              </div>
            )}
            <div>
              <Label>Priority</Label>
              <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as typeof p.priority }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={newTask.description}
                onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={!newTask.title} className="bg-blue-600">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>This task will be permanently removed.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteDialog) { onDeleteTask(deleteDialog); setDeleteDialog(null); } }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
