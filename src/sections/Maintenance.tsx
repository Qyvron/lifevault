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

interface MaintenanceProps { tasks: MaintenanceTask[]; items: InventoryItem[]; onAddTask: (task: any) => void; onCompleteTask: (taskId: string) => void; onDeleteTask: (taskId: string) => void; darkMode: boolean; }

export default function Maintenance({ tasks, items, onAddTask, onCompleteTask, onDeleteTask, darkMode }: MaintenanceProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [delDlg, setDelDlg] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ itemId: '', title: '', description: '', frequency: 'monthly' as const, customDays: '', priority: 'medium' as const });
  const overdue = tasks.filter(t => t.isOverdue && !t.completed).sort((a, b) => +new Date(a.nextDue) - +new Date(b.nextDue));
  const upcoming = tasks.filter(t => !t.isOverdue && !t.completed).sort((a, b) => +new Date(a.nextDue) - +new Date(b.nextDue));
  const getDays = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  const getBadge = (t: MaintenanceTask) => { if (t.isOverdue) return { l: `${Math.abs(getDays(t.nextDue))}d overdue`, c: 'bg-red-500' }; const d = getDays(t.nextDue); return d <= 7 ? { l: `${d}d left`, c: 'bg-amber-500' } : { l: `${d}d left`, c: 'bg-emerald-500' }; };

  const handleAdd = () => { if (!newTask.title) return; const item = items.find(i => i.id === newTask.itemId); onAddTask({ itemId: newTask.itemId || '', itemName: item?.name || 'General', title: newTask.title, description: newTask.description, frequency: newTask.frequency, customDays: newTask.customDays ? parseInt(newTask.customDays) : undefined, lastDone: new Date().toISOString().split('T')[0], priority: newTask.priority }); setShowAdd(false); setNewTask({ itemId: '', title: '', description: '', frequency: 'monthly', customDays: '', priority: 'medium' }); };
  const addPreset = (p: typeof MAINTENANCE_PRESETS[0]) => onAddTask({ itemId: '', itemName: 'General', title: p.title, description: p.description, frequency: p.frequency, lastDone: new Date().toISOString().split('T')[0], priority: 'medium' });

  const TCard = ({ task }: { task: MaintenanceTask }) => { const b = getBadge(task); return (
    <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} transition-all hover:shadow-md`}><CardContent className="p-4">
      <div className="flex items-start gap-3">
        <button onClick={() => onCompleteTask(task.id)} className="mt-0.5 flex-shrink-0"><CheckCircle2 className={`w-6 h-6 transition-colors ${task.isOverdue ? 'text-red-400 hover:text-emerald-500' : 'text-gray-300 hover:text-emerald-500'}`} /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3><Badge className={`text-xs text-white ${b.c}`}>{b.l}</Badge><Badge variant="outline" className="text-xs">{task.frequency}</Badge></div>
          {task.itemName && <p className="text-sm text-gray-500 dark:text-gray-400">{task.itemName}</p>}
          {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400"><span>Last: {task.lastDone}</span><span>Next: {task.nextDue}</span></div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setDelDlg(task.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0"><Trash2 className="w-4 h-4" /></Button>
      </div>
    </CardContent></Card>
  ); };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h1><p className="text-sm text-gray-500 dark:text-gray-400">Keep your home and items in top condition</p></div><Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Add Task</Button></div>
      {tasks.length < 5 && <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 dark:text-gray-400">Quick Add Presets</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{MAINTENANCE_PRESETS.map((p, i) => <Button key={i} variant="outline" size="sm" onClick={() => addPreset(p)} className="text-xs"><RotateCcw className="w-3 h-3 mr-1" />{p.title}</Button>)}</div></CardContent></Card>}
      {tasks.length === 0 ? <div className="text-center py-12"><Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500 dark:text-gray-400 text-lg">No maintenance tasks yet</p><p className="text-sm text-gray-400 mb-4">Add tasks or use quick presets to get started</p><Button onClick={() => setShowAdd(true)} variant="outline">Add Your First Task</Button></div> : (
        <div className="space-y-6">
          {overdue.length > 0 && <div><h2 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5" />Overdue ({overdue.length})</h2><div className="space-y-3">{overdue.map(t => <TCard key={t.id} task={t} />)}</div></div>}
          {upcoming.length > 0 && <div><h2 className="text-lg font-semibold text-emerald-600 mb-3 flex items-center gap-2"><Clock className="w-5 h-5" />Upcoming ({upcoming.length})</h2><div className="space-y-3">{upcoming.map(t => <TCard key={t.id} task={t} />)}</div></div>}
        </div>
      )}
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add Maintenance Task</DialogTitle><DialogDescription>Set up a recurring maintenance reminder</DialogDescription></DialogHeader><div className="space-y-4">
        <div><Label>Task Title *</Label><Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Clean AC Filter" /></div>
        <div><Label>Linked Item (optional)</Label><Select value={newTask.itemId} onValueChange={v => setNewTask(p => ({ ...p, itemId: v }))}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent><SelectItem value="">None (General)</SelectItem>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Frequency</Label><Select value={newTask.frequency} onValueChange={v => setNewTask(p => ({ ...p, frequency: v as typeof p.frequency }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="yearly">Yearly</SelectItem><SelectItem value="custom">Custom Days</SelectItem></SelectContent></Select></div>
        {newTask.frequency === 'custom' && <div><Label>Every X Days</Label><Input type="number" value={newTask.customDays} onChange={e => setNewTask(p => ({ ...p, customDays: e.target.value }))} placeholder="e.g., 45" /></div>}
        <div><Label>Priority</Label><Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as typeof p.priority }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
        <div><Label>Description (optional)</Label><Input value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Additional notes..." /></div>
      </div><DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={handleAdd} disabled={!newTask.title} className="bg-blue-600">Add Task</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={!!delDlg} onOpenChange={() => setDelDlg(null)}><DialogContent><DialogHeader><DialogTitle>Delete Task</DialogTitle><DialogDescription>This task will be permanently removed.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDelDlg(null)}>Cancel</Button><Button variant="destructive" onClick={() => { if (delDlg) { onDeleteTask(delDlg); setDelDlg(null); } }}>Delete</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
