import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { InventoryItem } from '@/types';
import { Shield, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';

interface WarrantyProps { items: InventoryItem[]; onNavigate: (page: string) => void; darkMode: boolean; }

export default function Warranty({ items, onNavigate, darkMode }: WarrantyProps) {
  const getDays = (d: string) => d === 'Lifetime' ? Infinity : Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  const groups = useMemo(() => {
    const g = { expired: [] as InventoryItem[], expiring30: [] as InventoryItem[], expiring90: [] as InventoryItem[], active: [] as InventoryItem[], lifetime: [] as InventoryItem[] };
    items.forEach(item => { if (item.warrantyExpiry === 'Lifetime') { g.lifetime.push(item); return; } const d = getDays(item.warrantyExpiry); if (d < 0) g.expired.push(item); else if (d <= 30) g.expiring30.push(item); else if (d <= 90) g.expiring90.push(item); else g.active.push(item); });
    return g;
  }, [items]);
  const getProg = (pd: string, wm: number) => { if (wm < 0) return 100; const s = new Date(pd).getTime(), e = s + wm * 30 * 86400000; return Math.min(Math.max(((Date.now() - s) / (e - s)) * 100, 0), 100); };

  const WCard = ({ item, status }: { item: InventoryItem; status: 'expired' | 'warning' | 'caution' | 'active' | 'lifetime' }) => {
    const days = getDays(item.warrantyExpiry);
    const prog = getProg(item.purchaseDate, item.warrantyMonths);
    const cfg = { expired: { i: ShieldAlert, co: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', b: 'Expired', bc: 'destructive' as const }, warning: { i: ShieldAlert, co: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', b: `${days}d left`, bc: 'destructive' as const }, caution: { i: Clock, co: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', b: `${days}d left`, bc: 'default' as const }, active: { i: ShieldCheck, co: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', b: `${Math.floor(days / 30)}mo left`, bc: 'outline' as const }, lifetime: { i: Shield, co: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', b: 'Lifetime', bc: 'secondary' as const } }[status];
    const I = cfg.i;
    return (
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : cfg.bg} transition-all hover:shadow-md`}><CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${cfg.bg}`}><I className={`w-5 h-5 ${cfg.co}`} /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3><Badge variant={cfg.bc} className="text-xs flex-shrink-0 ml-2">{cfg.b}</Badge></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.brand} {item.model}</p>
            <div className="mt-2"><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>Warranty Progress</span><span>{Math.round(prog)}%</span></div><Progress value={prog} className={`h-1.5 ${status === 'expired' || status === 'warning' ? 'bg-red-200' : status === 'caution' ? 'bg-amber-200' : ''}`} /></div>
            <div className="flex justify-between mt-2 text-sm"><span className="text-gray-500 dark:text-gray-400">Purchased: {item.purchaseDate}</span><span className="text-gray-500 dark:text-gray-400">Expires: {item.warrantyExpiry}</span></div>
          </div>
        </div>
      </CardContent></Card>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warranty Tracker</h1><p className="text-sm text-gray-500 dark:text-gray-400">Monitor warranty status for all your items</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[{ l: 'Expired', c: groups.expired.length, co: 'bg-red-500' }, { l: '< 30 Days', c: groups.expiring30.length, co: 'bg-red-400' }, { l: '< 90 Days', c: groups.expiring90.length, co: 'bg-amber-500' }, { l: 'Active', c: groups.active.length, co: 'bg-emerald-500' }, { l: 'Lifetime', c: groups.lifetime.length, co: 'bg-blue-500' }].map((s, i) => <Card key={i} className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardContent className="p-3 text-center"><div className={`w-3 h-3 rounded-full ${s.co} mx-auto mb-1`} /><p className="text-xl font-bold text-gray-900 dark:text-white">{s.c}</p><p className="text-xs text-gray-500 dark:text-gray-400">{s.l}</p></CardContent></Card>)}</div>
      {items.length === 0 ? <div className="text-center py-12"><Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500 dark:text-gray-400 text-lg">No items to track</p><Button onClick={() => onNavigate('add')} variant="outline" className="mt-3">Add Your First Item</Button></div> : (
        <div className="space-y-6">
          {groups.expired.length > 0 && <div><h2 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2"><ShieldAlert className="w-5 h-5" />Expired Warranties ({groups.expired.length})</h2><div className="space-y-3">{groups.expired.map(i => <WCard key={i.id} item={i} status="expired" />)}</div></div>}
          {groups.expiring30.length > 0 && <div><h2 className="text-lg font-semibold text-red-500 mb-3 flex items-center gap-2"><ShieldAlert className="w-5 h-5" />Expiring Soon &mdash; 30 Days ({groups.expiring30.length})</h2><div className="space-y-3">{groups.expiring30.map(i => <WCard key={i.id} item={i} status="warning" />)}</div></div>}
          {groups.expiring90.length > 0 && <div><h2 className="text-lg font-semibold text-amber-600 mb-3 flex items-center gap-2"><Clock className="w-5 h-5" />Expiring &mdash; 90 Days ({groups.expiring90.length})</h2><div className="space-y-3">{groups.expiring90.map(i => <WCard key={i.id} item={i} status="caution" />)}</div></div>}
          {groups.active.length > 0 && <div><h2 className="text-lg font-semibold text-emerald-600 mb-3 flex items-center gap-2"><ShieldCheck className="w-5 h-5" />Active Warranties ({groups.active.length})</h2><div className="space-y-3">{groups.active.map(i => <WCard key={i.id} item={i} status="active" />)}</div></div>}
          {groups.lifetime.length > 0 && <div><h2 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2"><Shield className="w-5 h-5" />Lifetime Warranties ({groups.lifetime.length})</h2><div className="space-y-3">{groups.lifetime.map(i => <WCard key={i.id} item={i} status="lifetime" />)}</div></div>}
        </div>
      )}
    </div>
  );
}
