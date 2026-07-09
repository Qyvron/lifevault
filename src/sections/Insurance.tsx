import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { InventoryItem } from '@/types';
import { Shield, Download, FileText, Printer, Home, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface InsuranceProps { items: InventoryItem[]; darkMode: boolean; }

export default function Insurance({ items, darkMode }: InsuranceProps) {
  const [gen, setGen] = useState(false);
  const [prog, setProg] = useState(0);
  const currency = localStorage.getItem('lifevault_currency') || '$';
  const fmt = (a: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency === '€' ? 'EUR' : currency === '£' ? 'GBP' : 'USD' }).format(a);
  const tv = items.reduce((s, i) => s + i.currentValue, 0);
  const tp = items.reduce((s, i) => s + i.purchasePrice, 0);
  const catSum = items.reduce((a, i) => { if (!a[i.category]) a[i.category] = { count: 0, value: 0, purchase: 0 }; a[i.category].count++; a[i.category].value += i.currentValue; a[i.category].purchase += i.purchasePrice; return a; }, {} as Record<string, { count: number; value: number; purchase: number }>);
  const roomSum = items.reduce((a, i) => { if (!a[i.room]) a[i.room] = { count: 0, value: 0 }; a[i.room].count++; a[i.room].value += i.currentValue; return a; }, {} as Record<string, { count: number; value: number }>);
  const hvi = [...items].sort((a, b) => b.currentValue - a.currentValue).slice(0, 10);

  const genReport = () => { setGen(true); setProg(0); const iv = setInterval(() => { setProg(p => { if (p >= 100) { clearInterval(iv); setTimeout(() => { setGen(false); genCSV(); }, 500); return 100; } return p + 10; }); }, 100); };
  const genCSV = () => { const h = ['Name', 'Category', 'Room', 'Brand', 'Model', 'Serial Number', 'Purchase Date', 'Purchase Price', 'Current Value', 'Warranty Expiry', 'Description']; const r = items.map(i => [i.name, i.category, i.room, i.brand, i.model, i.serialNumber, i.purchaseDate, i.purchasePrice.toString(), i.currentValue.toString(), i.warrantyExpiry, i.description]); const csv = [h, ...r].map(row => row.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `lifevault-insurance-report-${new Date().toISOString().split('T')[0]}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };
  const printReport = () => window.print();

  return (
    <div className="space-y-6 pb-8">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Insurance Report</h1><p className="text-sm text-gray-500 dark:text-gray-400">Generate a comprehensive report for insurance claims</p></div>
      {items.length === 0 ? <div className="text-center py-12"><Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500 dark:text-gray-400 text-lg">No items to report</p><p className="text-sm text-gray-400">Add items to your inventory to generate a report</p></div> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardContent className="p-4"><Home className="w-8 h-8 text-blue-500 mb-2" /><p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p><p className="text-sm text-gray-500">Total Items</p></CardContent></Card>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardContent className="p-4"><FileText className="w-8 h-8 text-emerald-500 mb-2" /><p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(tv)}</p><p className="text-sm text-gray-500">Total Value</p></CardContent></Card>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardContent className="p-4"><AlertTriangle className="w-8 h-8 text-amber-500 mb-2" /><p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(tp)}</p><p className="text-sm text-gray-500">Purchase Cost</p></CardContent></Card>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardContent className="p-4"><CheckCircle className="w-8 h-8 text-purple-500 mb-2" /><p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(catSum).length}</p><p className="text-sm text-gray-500">Categories</p></CardContent></Card>
          </div>
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-blue-200 dark:border-blue-800`}><CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center"><Download className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div><div><h3 className="font-semibold text-gray-900 dark:text-white">Download Insurance Report</h3><p className="text-sm text-gray-500 dark:text-gray-400">CSV format for insurance claims</p></div></div>
              <div className="flex gap-2"><Button variant="outline" onClick={printReport}><Printer className="w-4 h-4 mr-2" />Print</Button><Button onClick={genReport} disabled={gen} className="bg-blue-600 hover:bg-blue-700">{gen ? <><Zap className="w-4 h-4 mr-2 animate-pulse" />Generating...</> : <><Download className="w-4 h-4 mr-2" />Download CSV</>}</Button></div>
            </div>
            {gen && <div className="mt-4"><Progress value={prog} className="h-2" /><p className="text-sm text-gray-500 mt-1 text-center">{prog}% complete</p></div>}
          </CardContent></Card>
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-lg">Category Summary</CardTitle></CardHeader><CardContent><div className="space-y-3">{Object.entries(catSum).sort((a, b) => b[1].value - a[1].value).map(([cat, d]) => <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"><div><p className="font-semibold text-gray-900 dark:text-white">{cat}</p><p className="text-sm text-gray-500">{d.count} items</p></div><div className="text-right"><p className="font-semibold text-gray-900 dark:text-white">{fmt(d.value)}</p><p className="text-sm text-gray-500">{fmt(d.purchase)} purchased</p></div></div>)}</div></CardContent></Card>
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-lg">Room Summary</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{Object.entries(roomSum).sort((a, b) => b[1].value - a[1].value).map(([room, d]) => <div key={room} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"><p className="font-semibold text-gray-900 dark:text-white">{room}</p><p className="text-sm text-gray-500">{d.count} items &middot; {fmt(d.value)}</p></div>)}</div></CardContent></Card>
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-lg">Top 10 High-Value Items</CardTitle></CardHeader><CardContent><div className="space-y-3">{hvi.map((item, i) => <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"><div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">{i + 1}</span><div><p className="font-semibold text-gray-900 dark:text-white">{item.name}</p><p className="text-sm text-gray-500">{item.brand} {item.model}</p></div></div><p className="font-semibold text-gray-900 dark:text-white">{fmt(item.currentValue)}</p></div>)}</div></CardContent></Card>
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'} print:block`}><CardHeader><CardTitle className="text-lg">Report Preview</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b dark:border-gray-600"><th className="text-left py-2 px-3">#</th><th className="text-left py-2 px-3">Name</th><th className="text-left py-2 px-3">Category</th><th className="text-left py-2 px-3">Room</th><th className="text-left py-2 px-3">Brand/Model</th><th className="text-left py-2 px-3">Serial #</th><th className="text-left py-2 px-3">Purchased</th><th className="text-right py-2 px-3">Value</th><th className="text-right py-2 px-3">Warranty</th></tr></thead><tbody>{items.map((item, i) => <tr key={item.id} className="border-b dark:border-gray-700"><td className="py-2 px-3">{i + 1}</td><td className="py-2 px-3 font-medium">{item.name}</td><td className="py-2 px-3"><Badge variant="outline" className="text-xs">{item.category}</Badge></td><td className="py-2 px-3">{item.room}</td><td className="py-2 px-3">{item.brand} {item.model}</td><td className="py-2 px-3 font-mono text-xs">{item.serialNumber || '-'}</td><td className="py-2 px-3">{item.purchaseDate}</td><td className="py-2 px-3 text-right font-semibold">{fmt(item.currentValue)}</td><td className="py-2 px-3 text-right">{item.warrantyExpiry}</td></tr>)}</tbody></table></CardContent></Card>
        </>
      )}
    </div>
  );
}
