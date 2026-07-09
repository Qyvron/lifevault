import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, AlertTriangle, Wrench, DollarSign, TrendingUp, TrendingDown, Shield, Clock, ChevronRight, Sparkles } from 'lucide-react';

interface DashboardProps {
  stats: { totalItems: number; totalValue: number; totalPurchase: number; valueChange: number; expiringWarranties: number; expiredWarranties: number; overdueTasks: number; upcomingTasks: number; categoryBreakdown: Record<string, number> };
  recentItems: Array<{ id: string; name: string; category: string; purchasePrice: number; imageUrl: string; warrantyExpiry: string; createdAt: string }>;
  onNavigate: (page: string) => void; darkMode: boolean;
}

export default function Dashboard({ stats, recentItems, onNavigate, darkMode }: DashboardProps) {
  const currency = localStorage.getItem('lifevault_currency') || '$';
  const fmt = (a: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency === '€' ? 'EUR' : currency === '£' ? 'GBP' : 'USD' }).format(a);
  const getDays = (d: string) => d === 'Lifetime' ? Infinity : Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  const cards = [
    { t: 'Total Items', v: stats.totalItems.toString(), i: Package, c: 'bg-blue-500', tc: 'text-blue-600 dark:text-blue-400', a: false, nav: 'inventory' },
    { t: 'Total Value', v: fmt(stats.totalValue), i: DollarSign, c: 'bg-emerald-500', tc: 'text-emerald-600 dark:text-emerald-400', a: false, nav: 'inventory' },
    { t: 'Expiring Warranties', v: stats.expiringWarranties.toString(), i: AlertTriangle, c: 'bg-amber-500', tc: 'text-amber-600 dark:text-amber-400', a: stats.expiringWarranties > 0, nav: 'warranty' },
    { t: 'Pending Tasks', v: (stats.overdueTasks + stats.upcomingTasks).toString(), i: Wrench, c: 'bg-rose-500', tc: 'text-rose-600 dark:text-rose-400', a: stats.overdueTasks > 0, nav: 'maintenance' },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-yellow-300" /><span className="text-blue-100 text-sm font-medium">Welcome back!</span></div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">LifeVault Dashboard</h1>
          <p className="text-blue-100 text-sm md:text-base max-w-lg">Track everything you own. Manage warranties. Never miss maintenance. Your home, organized.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button onClick={() => onNavigate('add')} className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"><Package className="w-4 h-4 mr-2" />Add Item</Button>
            <Button variant="outline" onClick={() => onNavigate('insurance')} className="border-white/30 text-white hover:bg-white/10"><Shield className="w-4 h-4 mr-2" />Insurance Report</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Card key={i} className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`} onClick={() => onNavigate(card.nav)}>
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${card.c} bg-opacity-10`}><card.i className={`w-5 h-5 ${card.tc}`} /></div>
                {card.a && <Badge variant="destructive" className="text-xs">Action</Badge>}
              </div>
              <div className="mt-3"><p className="text-2xl font-bold text-gray-900 dark:text-white">{card.v}</p><p className="text-sm text-gray-500 dark:text-gray-400">{card.t}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.totalPurchase > 0 && (
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" />Asset Value Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Purchase Cost</p><p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(stats.totalPurchase)}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p><p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(stats.totalValue)}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Value Change</p><div className="flex items-center gap-2">{stats.valueChange >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}<p className={`text-xl font-bold ${stats.valueChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{stats.valueChange >= 0 ? '+' : ''}{stats.valueChange.toFixed(1)}%</p></div></div>
            </div>
            <div className="mt-4"><Progress value={stats.totalPurchase > 0 ? (stats.totalValue / stats.totalPurchase) * 50 : 0} className="h-2" /></div>
          </CardContent>
        </Card>
      )}

      {Object.keys(stats.categoryBreakdown).length > 0 && (
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Category Breakdown</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{Object.entries(stats.categoryBreakdown).map(([cat, count]) => <Badge key={cat} variant="secondary" className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => onNavigate('inventory')}>{cat}: {count}</Badge>)}</div></CardContent>
        </Card>
      )}

      <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" />Recently Added</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('inventory')} className="text-blue-600">View All <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500"><Package className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>No items yet. Start by adding your first item!</p><Button onClick={() => onNavigate('add')} className="mt-3" variant="outline">Add First Item</Button></div>
          ) : (
            <div className="space-y-3">{recentItems.map(item => { const dl = getDays(item.warrantyExpiry); return (
              <div key={item.id} onClick={() => onNavigate('inventory')} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:shadow-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">{item.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p></div>
                <div className="text-right"><p className="font-semibold text-gray-900 dark:text-white">{fmt(item.purchasePrice)}</p>{dl < 0 ? <Badge variant="destructive" className="text-xs">Expired</Badge> : dl <= 90 ? <Badge variant="default" className="text-xs bg-amber-500">{dl}d left</Badge> : <Badge variant="outline" className="text-xs">{item.warrantyExpiry === 'Lifetime' ? 'Lifetime' : `${dl}d`}</Badge>}</div>
              </div>
            )})}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
