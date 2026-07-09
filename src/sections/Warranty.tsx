import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { InventoryItem } from '@/types';
import { Shield, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';

interface WarrantyProps {
  items: InventoryItem[];
  onNavigate: (page: string) => void;
  darkMode: boolean;
}

export default function Warranty({ items, onNavigate, darkMode }: WarrantyProps) {
  const getDaysUntil = (dateStr: string) => {
    if (dateStr === 'Lifetime') return Infinity;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const warrantyGroups = useMemo(() => {
    const groups = {
      expired: [] as InventoryItem[],
      expiring30: [] as InventoryItem[],
      expiring90: [] as InventoryItem[],
      active: [] as InventoryItem[],
      lifetime: [] as InventoryItem[],
    };

    items.forEach(item => {
      if (item.warrantyExpiry === 'Lifetime') {
        groups.lifetime.push(item);
        return;
      }

      const days = getDaysUntil(item.warrantyExpiry);
      if (days < 0) groups.expired.push(item);
      else if (days <= 30) groups.expiring30.push(item);
      else if (days <= 90) groups.expiring90.push(item);
      else groups.active.push(item);
    });

    return groups;
  }, [items]);

  const getProgress = (purchaseDate: string, warrantyMonths: number) => {
    if (warrantyMonths < 0) return 100;
    const start = new Date(purchaseDate).getTime();
    const end = start + warrantyMonths * 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const WarrantyCard = ({ item, status }: { item: InventoryItem; status: 'expired' | 'warning' | 'caution' | 'active' | 'lifetime' }) => {
    const days = getDaysUntil(item.warrantyExpiry);
    const progress = getProgress(item.purchaseDate, item.warrantyMonths);

    const statusConfig = {
      expired: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', badge: 'Expired', badgeColor: 'destructive' as const },
      warning: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', badge: `${days}d left`, badgeColor: 'destructive' as const },
      caution: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', badge: `${days}d left`, badgeColor: 'default' as const },
      active: { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', badge: `${Math.floor(days / 30)}mo left`, badgeColor: 'outline' as const },
      lifetime: { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', badge: 'Lifetime', badgeColor: 'secondary' as const },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : config.bg} transition-all hover:shadow-md`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                <Badge variant={config.badgeColor} className="text-xs flex-shrink-0 ml-2">{config.badge}</Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.brand} {item.model}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Warranty Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className={`h-1.5 ${status === 'expired' ? 'bg-red-200' : status === 'warning' ? 'bg-red-200' : status === 'caution' ? 'bg-amber-200' : ''}`} />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Purchased: {item.purchaseDate}</span>
                <span className="text-gray-500 dark:text-gray-400">Expires: {item.warrantyExpiry}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warranty Tracker</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Monitor warranty status for all your items</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Expired', count: warrantyGroups.expired.length, color: 'bg-red-500' },
          { label: '< 30 Days', count: warrantyGroups.expiring30.length, color: 'bg-red-400' },
          { label: '< 90 Days', count: warrantyGroups.expiring90.length, color: 'bg-amber-500' },
          { label: 'Active', count: warrantyGroups.active.length, color: 'bg-emerald-500' },
          { label: 'Lifetime', count: warrantyGroups.lifetime.length, color: 'bg-blue-500' },
        ].map((stat, i) => (
          <Card key={i} className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="p-3 text-center">
              <div className={`w-3 h-3 rounded-full ${stat.color} mx-auto mb-1`} />
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No items to track</p>
          <Button onClick={() => onNavigate('add')} variant="outline" className="mt-3">
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {warrantyGroups.expired.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Expired Warranties ({warrantyGroups.expired.length})
              </h2>
              <div className="space-y-3">
                {warrantyGroups.expired.map(item => (
                  <WarrantyCard key={item.id} item={item} status="expired" />
                ))}
              </div>
            </div>
          )}

          {warrantyGroups.expiring30.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-500 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Expiring Soon — 30 Days ({warrantyGroups.expiring30.length})
              </h2>
              <div className="space-y-3">
                {warrantyGroups.expiring30.map(item => (
                  <WarrantyCard key={item.id} item={item} status="warning" />
                ))}
              </div>
            </div>
          )}

          {warrantyGroups.expiring90.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-amber-600 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Expiring — 90 Days ({warrantyGroups.expiring90.length})
              </h2>
              <div className="space-y-3">
                {warrantyGroups.expiring90.map(item => (
                  <WarrantyCard key={item.id} item={item} status="caution" />
                ))}
              </div>
            </div>
          )}

          {warrantyGroups.active.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Active Warranties ({warrantyGroups.active.length})
              </h2>
              <div className="space-y-3">
                {warrantyGroups.active.map(item => (
                  <WarrantyCard key={item.id} item={item} status="active" />
                ))}
              </div>
            </div>
          )}

          {warrantyGroups.lifetime.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Lifetime Warranties ({warrantyGroups.lifetime.length})
              </h2>
              <div className="space-y-3">
                {warrantyGroups.lifetime.map(item => (
                  <WarrantyCard key={item.id} item={item} status="lifetime" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
