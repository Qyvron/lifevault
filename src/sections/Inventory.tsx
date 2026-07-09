import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InventoryItem } from '@/types';
import { Search, Filter, Trash2, Edit, Package, ChevronDown, ChevronUp } from 'lucide-react';

interface InventoryProps { items: InventoryItem[]; onDelete: (id: string) => void; onNavigate: (page: string, itemId?: string) => void; darkMode: boolean; }

export default function Inventory({ items, onDelete, onNavigate, darkMode }: InventoryProps) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [delDlg, setDelDlg] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const currency = localStorage.getItem('lifevault_currency') || '$';
  const fmt = (a: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency === '€' ? 'EUR' : currency === '£' ? 'GBP' : 'USD' }).format(a);
  const cats = useMemo(() => Array.from(new Set(items.map(i => i.category))).sort(), [items]);
  const rooms = useMemo(() => Array.from(new Set(items.map(i => i.room))).sort(), [items]);

  const filtered = useMemo(() => {
    let r = [...items];
    if (search) { const q = search.toLowerCase(); r = r.filter(i => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.model.toLowerCase().includes(q) || i.serialNumber.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)); }
    if (catFilter !== 'all') r = r.filter(i => i.category === catFilter);
    if (roomFilter !== 'all') r = r.filter(i => i.room === roomFilter);
    switch (sortBy) { case 'newest': r.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break; case 'oldest': r.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)); break; case 'name': r.sort((a, b) => a.name.localeCompare(b.name)); break; case 'value-high': r.sort((a, b) => b.currentValue - a.currentValue); break; case 'value-low': r.sort((a, b) => a.currentValue - b.currentValue); break; case 'expiry': r.sort((a, b) => { if (a.warrantyExpiry === 'Lifetime') return 1; if (b.warrantyExpiry === 'Lifetime') return -1; return +new Date(a.warrantyExpiry) - +new Date(b.warrantyExpiry); }); break; }
    return r;
  }, [items, search, catFilter, roomFilter, sortBy]);

  const getDays = (d: string) => d === 'Lifetime' ? Infinity : Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  const getBadge = (exp: string) => { const d = getDays(exp); if (d < 0) return { l: 'Expired', v: 'destructive' as const, cl: '' }; if (d <= 30) return { l: `${d}d left`, v: 'default' as const, cl: 'bg-red-500' }; if (d <= 90) return { l: `${d}d left`, v: 'default' as const, cl: 'bg-amber-500' }; return { l: exp === 'Lifetime' ? 'Lifetime' : `${Math.floor(d / 30)}mo left`, v: 'outline' as const, cl: '' }; };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Inventory</h1><p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} of {items.length} items</p></div>
        <Button onClick={() => onNavigate('add')} className="bg-blue-600 hover:bg-blue-700"><Package className="w-4 h-4 mr-2" />Add Item</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search items, brands, models..." value={search} onChange={e => setSearch(e.target.value)} className={`pl-10 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`} /></div>
      <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="w-full md:w-auto"><Filter className="w-4 h-4 mr-2" />Filters {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}</Button>
      {showFilters && (
        <div className="grid md:grid-cols-3 gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
          <Select value={catFilter} onValueChange={setCatFilter}><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{cats.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Select value={roomFilter} onValueChange={setRoomFilter}><SelectTrigger><SelectValue placeholder="Room" /></SelectTrigger><SelectContent><SelectItem value="all">All Rooms</SelectItem>{rooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger><SelectContent><SelectItem value="newest">Newest First</SelectItem><SelectItem value="oldest">Oldest First</SelectItem><SelectItem value="name">Name A-Z</SelectItem><SelectItem value="value-high">Value: High to Low</SelectItem><SelectItem value="value-low">Value: Low to High</SelectItem><SelectItem value="expiry">Warranty Expiry</SelectItem></SelectContent></Select>
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="text-center py-12"><Package className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500 dark:text-gray-400 text-lg">No items found</p><p className="text-sm text-gray-400">{search ? 'Try different search terms' : 'Start adding items to your inventory'}</p></div>
      ) : (
        <div className="space-y-3">{filtered.map(item => { const w = getBadge(item.warrantyExpiry); const ex = expanded === item.id; return (
          <Card key={item.id} className={`overflow-hidden transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} ${ex ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(ex ? null : item.id)}>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">{item.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3><Badge variant="outline" className="text-xs flex-shrink-0">{item.category}</Badge></div><p className="text-sm text-gray-500 dark:text-gray-400">{item.brand} {item.model} &middot; {item.room}</p></div>
                <div className="text-right flex-shrink-0"><p className="font-semibold text-gray-900 dark:text-white">{fmt(item.currentValue)}</p><Badge variant={w.v} className={`text-xs ${w.cl}`}>{w.l}</Badge></div>
              </div>
              {ex && (
                <div className={`px-4 pb-4 pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-500 dark:text-gray-400">Serial Number</p><p className="font-mono text-gray-900 dark:text-white">{item.serialNumber || 'N/A'}</p></div>
                    <div><p className="text-gray-500 dark:text-gray-400">Purchase Date</p><p className="text-gray-900 dark:text-white">{item.purchaseDate}</p></div>
                    <div><p className="text-gray-500 dark:text-gray-400">Purchase Price</p><p className="text-gray-900 dark:text-white">{fmt(item.purchasePrice)}</p></div>
                    <div><p className="text-gray-500 dark:text-gray-400">Warranty Expiry</p><p className="text-gray-900 dark:text-white">{item.warrantyExpiry}</p></div>
                    {item.description && <div className="md:col-span-2"><p className="text-gray-500 dark:text-gray-400">Description</p><p className="text-gray-900 dark:text-white">{item.description}</p></div>}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => onNavigate('add', item.id)} className="flex-1"><Edit className="w-4 h-4 mr-2" />Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => setDelDlg(item.id)} className="flex-1"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )})}</div>
      )}
      <Dialog open={!!delDlg} onOpenChange={() => setDelDlg(null)}><DialogContent><DialogHeader><DialogTitle>Delete Item</DialogTitle><DialogDescription>This action cannot be undone. This item and its maintenance tasks will be permanently removed.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDelDlg(null)}>Cancel</Button><Button variant="destructive" onClick={() => { if (delDlg) { onDelete(delDlg); setDelDlg(null); } }}>Delete</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
