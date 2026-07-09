import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/useInventory';
import { useTheme } from '@/hooks/useTheme';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Dashboard from '@/sections/Dashboard';
import Inventory from '@/sections/Inventory';
import AddItem from '@/sections/AddItem';
import Warranty from '@/sections/Warranty';
import Maintenance from '@/sections/Maintenance';
import Insurance from '@/sections/Insurance';
import Settings from '@/sections/Settings';
import {
  LayoutDashboard, Package, Shield, Wrench, FileText, Settings as SettingsIcon,
  Menu, X, ShieldCheck
} from 'lucide-react';
import './App.css';

type Page = 'dashboard' | 'inventory' | 'add' | 'warranty' | 'maintenance' | 'insurance' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [editItemId, setEditItemId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const inventory = useInventory();

  const navigate = useCallback((page: string, itemId?: string) => {
    setCurrentPage(page as Page);
    setEditItemId(itemId);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, []);

  // FIX: Handle both Add and Update logic
  const handleSaveItem = (itemData: any) => {
    if (editItemId) {
      inventory.updateItem(editItemId, itemData);
    } else {
      inventory.addItem(itemData);
    }
    setEditItemId(undefined);
    setCurrentPage('inventory');
  };

  const handleExport = () => {
    const data = {
      items: inventory.items,
      tasks: inventory.tasks,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifevault-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.items) {
            localStorage.setItem('lifevault_items', JSON.stringify(data.items));
            if (data.tasks) localStorage.setItem('lifevault_tasks', JSON.stringify(data.tasks));
            window.location.reload();
          }
        } catch (err) {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    setClearDialogOpen(true);
  };

  const confirmClearAll = () => {
    localStorage.removeItem('lifevault_items');
    localStorage.removeItem('lifevault_tasks');
    setClearDialogOpen(false);
    window.location.reload();
  };

  const getEditItem = () => {
    if (!editItemId) return undefined;
    return inventory.getItemById(editItemId);
  };

  const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'inventory', label: 'Inventory', icon: Package },
    { page: 'warranty', label: 'Warranty', icon: Shield },
    { page: 'maintenance', label: 'Maintenance', icon: Wrench },
    { page: 'insurance', label: 'Insurance', icon: FileText },
    { page: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard stats={inventory.stats} recentItems={inventory.recentItems} onNavigate={navigate} darkMode={darkMode} />;
      case 'inventory':
        return <Inventory items={inventory.items} onDelete={inventory.deleteItem} onNavigate={navigate} darkMode={darkMode} />;
      case 'add':
        return <AddItem onAdd={handleSaveItem} onNavigate={navigate} editItem={getEditItem()} darkMode={darkMode} />;
      case 'warranty':
        return <Warranty items={inventory.items} onNavigate={navigate} darkMode={darkMode} />;
      case 'maintenance':
        return <Maintenance tasks={inventory.tasks} items={inventory.items} onAddTask={inventory.addTask} onCompleteTask={inventory.completeTask} onDeleteTask={inventory.deleteTask} darkMode={darkMode} />;
      case 'insurance':
        return <Insurance items={inventory.items} darkMode={darkMode} />;
      case 'settings':
        return <Settings darkMode={darkMode} onToggleDarkMode={toggleDarkMode} onExport={handleExport} onImport={handleImport} onClearAll={handleClearAll} darkModeProp={darkMode} />;
      default:
        return <Dashboard stats={inventory.stats} recentItems={inventory.recentItems} onNavigate={navigate} darkMode={darkMode} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">LifeVault</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="mt-3 pb-2 space-y-1">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.page
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 sticky top-0 h-screen bg-white dark:bg-gray-800 border-r dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900 dark:text-white">LifeVault</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Asset Manager</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === item.page
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t dark:border-gray-700">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
              <p className="text-sm font-semibold mb-1">Pro Tip</p>
              <p className="text-xs text-blue-100">Add items regularly to keep your insurance report up to date.</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="px-4 py-6 md:px-8 md:py-8">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Clear All Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Clear All Data</DialogTitle>
            <DialogDescription>
              This will permanently delete all your inventory items and maintenance tasks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmClearAll}>Delete Everything</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;