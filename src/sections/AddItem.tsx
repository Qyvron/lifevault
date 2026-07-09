import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEFAULT_CATEGORIES, DEFAULT_ROOMS, WARRANTY_PERIODS } from '@/types';
import { Sparkles, ArrowLeft, Plus, Wand2, Loader2 } from 'lucide-react';

interface AddItemProps { onAdd: (item: any) => void; onNavigate: (page: string) => void; editItem?: any; darkMode: boolean; }

export default function AddItem({ onAdd, onNavigate, editItem, darkMode }: AddItemProps) {
  const [step, setStep] = useState<'method' | 'form' | 'ai-processing'>('method');
  const [aiSim, setAiSim] = useState(false);
  const [aiProg, setAiProg] = useState(0);
  const [aiRes, setAiRes] = useState<any>(null);
  const [form, setForm] = useState({ name: editItem?.name || '', category: editItem?.category || '', room: editItem?.room || '', purchaseDate: editItem?.purchaseDate || new Date().toISOString().split('T')[0], purchasePrice: editItem?.purchasePrice?.toString() || '', currentValue: editItem?.currentValue?.toString() || '', warrantyMonths: editItem?.warrantyMonths?.toString() || '12', serialNumber: editItem?.serialNumber || '', brand: editItem?.brand || '', model: editItem?.model || '', description: editItem?.description || '', imageUrl: editItem?.imageUrl || '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const upd = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const simAI = () => {
    setStep('ai-processing'); setAiSim(true); setAiProg(0);
    const mocks = [{ name: 'iPhone 15 Pro', brand: 'Apple', model: 'A3108', category: 'Electronics', price: 999 }, { name: 'Sony WH-1000XM5', brand: 'Sony', model: 'WH-1000XM5', category: 'Electronics', price: 348 }, { name: 'Samsung 4K TV', brand: 'Samsung', model: 'UN55AU8000', category: 'Electronics', price: 447 }, { name: 'Dyson V15 Detect', brand: 'Dyson', model: 'V15', category: 'Appliances', price: 749 }, { name: 'Nike Air Max 90', brand: 'Nike', model: 'Air Max 90', category: 'Clothing', price: 130 }];
    const iv = setInterval(() => { setAiProg(p => { if (p >= 100) { clearInterval(iv); setAiSim(false); const r = mocks[Math.floor(Math.random() * mocks.length)]; setAiRes(r); setForm(f => ({ ...f, name: r.name, brand: r.brand, model: r.model, category: r.category, purchasePrice: r.price.toString(), currentValue: Math.round(r.price * 0.85).toString() })); setStep('form'); return 100; } return p + Math.random() * 15; }); }, 200);
  };

  const submit = () => {
    if (!form.name || !form.category || !form.room) return;
    onAdd({ name: form.name, category: form.category, room: form.room, purchaseDate: form.purchaseDate, purchasePrice: parseFloat(form.purchasePrice) || 0, currentValue: parseFloat(form.currentValue) || parseFloat(form.purchasePrice) || 0, warrantyMonths: parseInt(form.warrantyMonths) || 12, serialNumber: form.serialNumber, brand: form.brand, model: form.model, description: form.description, imageUrl: form.imageUrl });
    onNavigate('inventory');
  };

  if (step === 'method') return (
    <div className="space-y-6 pb-8">
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-2"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Item</h1><p className="text-gray-500 dark:text-gray-400">Choose how you want to add an item</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className={`cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`} onClick={() => fileRef.current?.click()}>
          <CardContent className="p-6 text-center"><div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><Sparkles className="w-8 h-8 text-white" /></div><h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">AI Photo Recognition</h3><p className="text-sm text-gray-500 dark:text-gray-400">Take a photo and let AI identify the product</p><input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={() => simAI()} /></CardContent>
        </Card>
        <Card className={`cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`} onClick={() => setStep('form')}>
          <CardContent className="p-6 text-center"><div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><Plus className="w-8 h-8 text-white" /></div><h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Manual Entry</h3><p className="text-sm text-gray-500 dark:text-gray-400">Enter item details manually</p></CardContent>
        </Card>
      </div>
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}><CardContent className="p-4"><p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"><Wand2 className="w-4 h-4" /><strong>Pro Tip:</strong> AI recognition works best with clear photos of electronics, appliances, and branded products.</p></CardContent></Card>
    </div>
  );

  if (step === 'ai-processing') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">{aiSim ? <Loader2 className="w-12 h-12 text-white animate-spin" /> : <Sparkles className="w-12 h-12 text-white" />}</div>
      <div className="text-center max-w-md"><h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analyzing with AI...</h2><p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Our AI is identifying the product, estimating its value, and looking up warranty information.</p><Progress value={aiProg} className="w-full h-2" /><p className="text-sm text-gray-400 mt-2">{Math.round(aiProg)}%</p></div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      <Button variant="ghost" onClick={() => setStep('method')} className="mb-2"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">{editItem ? 'Edit Item' : 'Add Item Details'}</h1>{aiRes && <div className="flex items-center gap-2 mt-1"><Badge variant="default" className="bg-purple-500"><Sparkles className="w-3 h-3 mr-1" />AI Auto-filled</Badge><span className="text-sm text-gray-500 dark:text-gray-400">{aiRes.name} detected</span></div>}</div>
      <div className="space-y-4">
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><Label>Item Name *</Label><Input value={form.name} onChange={e => upd('name', e.target.value)} placeholder="e.g., Samsung 4K Smart TV" className={darkMode ? 'bg-gray-700 border-gray-600' : ''} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category *</Label><Select value={form.category} onValueChange={v => upd('category', v)}><SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600' : ''}><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{DEFAULT_CATEGORIES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Room *</Label><Select value={form.room} onValueChange={v => upd('room', v)}><SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600' : ''}><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{DEFAULT_ROOMS.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Brand</Label><Input value={form.brand} onChange={e => upd('brand', e.target.value)} placeholder="e.g., Samsung" className={darkMode ? 'bg-gray-700 border-gray-600' : ''} /></div><div><Label>Model</Label><Input value={form.model} onChange={e => upd('model', e.target.value)} placeholder="e.g., UN55AU8000" className={darkMode ? 'bg-gray-700 border-gray-600' : ''} /></div></div>
          <div><Label>Serial Number</Label><Input value={form.serialNumber} onChange={e => upd('serialNumber', e.target.value)} placeholder="Optional" className={darkMode ? 'bg-gray-700 border-gray-600' : ''} /></div>
        </CardContent></Card>
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-base">Purchase Details</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Purchase Date</Label><Input type="date" value={form.purchaseDate} onChange={e => upd('purchaseDate', e.target.value)} className={darkMode ? 'bg-gray-700 border-gray-600' : ''} /></div>
            <div><Label>Warranty Period</Label><Select value={form.warrantyMonths} onValueChange={v => upd('warrantyMonths', v)}><SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600' : ''}><SelectValue /></SelectTrigger><SelectContent>{WARRANTY_PERIODS.map(w => <SelectItem key={w.value} value={w.value.toString()}>{w.label}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Purchase Price ($)</Label><Input type="number" value={form.purchasePrice} onChange={e => upd('purchasePrice', e.target.value)} placeholder="0.00" className={darkMode ? 'bg-gray-700 border-gray-600' : ''} /></div><div><Label>Current Value ($)</Label><Input type="number" value={form.currentValue} onChange={e => upd('currentValue', e.target.value)} placeholder="0.00" className={darkMode ? 'bg-gray-700 border-gray-600' : ''} /></div></div>
        </CardContent></Card>
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-base">Additional Information</CardTitle></CardHeader><CardContent><div><Label>Description / Notes</Label><Textarea value={form.description} onChange={e => upd('description', e.target.value)} placeholder="Any additional notes about this item..." rows={3} className={darkMode ? 'bg-gray-700 border-gray-600' : ''} /></div></CardContent></Card>
        <div className="flex gap-3"><Button variant="outline" onClick={() => onNavigate('dashboard')} className="flex-1">Cancel</Button><Button onClick={submit} disabled={!form.name || !form.category || !form.room} className="flex-1 bg-blue-600 hover:bg-blue-700">{editItem ? 'Update Item' : 'Add to Inventory'}</Button></div>
      </div>
    </div>
  );
}
