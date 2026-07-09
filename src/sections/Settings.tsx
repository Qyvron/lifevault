import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Bell, DollarSign, Trash2, Download, Upload, Info } from 'lucide-react';

interface SettingsProps { darkMode: boolean; onToggleDarkMode: () => void; onExport: () => void; onImport: () => void; onClearAll: () => void; darkModeProp: boolean; }

export default function Settings({ darkMode, onToggleDarkMode, onExport, onImport, onClearAll, darkModeProp }: SettingsProps) {
  const currency = localStorage.getItem('lifevault_currency') || '$';
  const notifications = localStorage.getItem('lifevault_notifications') !== 'false';

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="text-sm text-gray-500 dark:text-gray-400">Customize your LifeVault experience</p></div>
      <Card className={darkModeProp ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-lg flex items-center gap-2">{darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}Appearance</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><div><Label className="text-base">Dark Mode</Label><p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p></div><Switch checked={darkMode} onCheckedChange={onToggleDarkMode} /></div></CardContent></Card>
      <Card className={darkModeProp ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-5 h-5" />Currency</CardTitle></CardHeader><CardContent><Select value={currency} onValueChange={(c: string) => { localStorage.setItem('lifevault_currency', c); window.location.reload(); }}><SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="$">USD ($)</SelectItem><SelectItem value="€">EUR (&euro;)</SelectItem><SelectItem value="£">GBP (&pound;)</SelectItem><SelectItem value="₺">TRY (&#x20BA;)</SelectItem><SelectItem value="¥">JPY (&yen;)</SelectItem><SelectItem value="₩">KRW (&#x20A9;)</SelectItem></SelectContent></Select></CardContent></Card>
      <Card className={darkModeProp ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5" />Notifications</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><div><Label className="text-base">Enable Notifications</Label><p className="text-sm text-gray-500 dark:text-gray-400">Get reminders for warranty expiry and maintenance tasks</p></div><Switch checked={notifications} onCheckedChange={(en: boolean) => localStorage.setItem('lifevault_notifications', String(en))} /></div></CardContent></Card>
      <Card className={darkModeProp ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Download className="w-5 h-5" />Data Management</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="flex items-center justify-between"><div><p className="font-medium">Export Data</p><p className="text-sm text-gray-500 dark:text-gray-400">Download all your data as JSON</p></div><Button variant="outline" size="sm" onClick={onExport}><Download className="w-4 h-4 mr-2" />Export</Button></div><Separator />
        <div className="flex items-center justify-between"><div><p className="font-medium">Import Data</p><p className="text-sm text-gray-500 dark:text-gray-400">Restore from a previous export</p></div><Button variant="outline" size="sm" onClick={onImport}><Upload className="w-4 h-4 mr-2" />Import</Button></div><Separator />
        <div className="flex items-center justify-between"><div><p className="font-medium text-red-600">Clear All Data</p><p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete all items and tasks</p></div><Button variant="destructive" size="sm" onClick={onClearAll}><Trash2 className="w-4 h-4 mr-2" />Clear All</Button></div>
      </CardContent></Card>
      <Card className={darkModeProp ? 'bg-gray-800 border-gray-700' : 'bg-white'}><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Info className="w-5 h-5" />About LifeVault</CardTitle></CardHeader><CardContent className="space-y-2"><p className="text-sm text-gray-500 dark:text-gray-400">LifeVault is your personal asset and home management center. Track everything you own, manage warranties, schedule maintenance, and generate insurance reports &mdash; all in one place.</p><p className="text-sm text-gray-400">Version 1.0.0 &middot; Built with React &amp; Tailwind CSS</p></CardContent></Card>
    </div>
  );
}
