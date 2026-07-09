import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { InventoryItem } from '@/types';
import { Shield, Download, FileText, Printer, Home, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface InsuranceProps {
  items: InventoryItem[];
  darkMode: boolean;
}

export default function Insurance({ items, darkMode }: InsuranceProps) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const currency = localStorage.getItem('lifevault_currency') || '$';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === '€' ? 'EUR' : currency === '£' ? 'GBP' : 'USD',
    }).format(amount);
  };

  const totalValue = items.reduce((sum, item) => sum + item.currentValue, 0);
  const totalPurchase = items.reduce((sum, item) => sum + item.purchasePrice, 0);

  const categorySummary = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, value: 0, purchase: 0 };
    }
    acc[item.category].count += 1;
    acc[item.category].value += item.currentValue;
    acc[item.category].purchase += item.purchasePrice;
    return acc;
  }, {} as Record<string, { count: number; value: number; purchase: number }>);

  const roomSummary = items.reduce((acc, item) => {
    if (!acc[item.room]) {
      acc[item.room] = { count: 0, value: 0 };
    }
    acc[item.room].count += 1;
    acc[item.room].value += item.currentValue;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const highValueItems = [...items].sort((a, b) => b.currentValue - a.currentValue).slice(0, 10);

  const generateReport = () => {
    setGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setGenerating(false);
            generateCSV();
          }, 500);
          return 100;
        }
        return p + 10;
      });
    }, 100);
  };

  const generateCSV = () => {
    const headers = ['Name', 'Category', 'Room', 'Brand', 'Model', 'Serial Number', 'Purchase Date', 'Purchase Price', 'Current Value', 'Warranty Expiry', 'Description'];
    const rows = items.map(item => [
      item.name,
      item.category,
      item.room,
      item.brand,
      item.model,
      item.serialNumber,
      item.purchaseDate,
      item.purchasePrice.toString(),
      item.currentValue.toString(),
      item.warrantyExpiry,
      item.description,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifevault-insurance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Insurance Report</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Generate a comprehensive report for insurance claims</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No items to report</p>
          <p className="text-sm text-gray-400">Add items to your inventory to generate a report</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4">
                <Home className="w-8 h-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
                <p className="text-sm text-gray-500">Total Items</p>
              </CardContent>
            </Card>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4">
                <FileText className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-gray-500">Total Value</p>
              </CardContent>
            </Card>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4">
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPurchase)}</p>
                <p className="text-sm text-gray-500">Purchase Cost</p>
              </CardContent>
            </Card>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4">
                <CheckCircle className="w-8 h-8 text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(categorySummary).length}</p>
                <p className="text-sm text-gray-500">Categories</p>
              </CardContent>
            </Card>
          </div>

          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-blue-200 dark:border-blue-800`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Download Insurance Report</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CSV format for insurance claims</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={printReport}>
                    <Printer className="w-4 h-4 mr-2" /> Print
                  </Button>
                  <Button onClick={generateReport} disabled={generating} className="bg-blue-600 hover:bg-blue-700">
                    {generating ? (
                      <><Zap className="w-4 h-4 mr-2 animate-pulse" /> Generating...</>
                    ) : (
                      <><Download className="w-4 h-4 mr-2" /> Download CSV</>
                    )}
                  </Button>
                </div>
              </div>
              {generating && (
                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-500 mt-1 text-center">{progress}% complete</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className="text-lg">Category Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(categorySummary).sort((a, b) => b[1].value - a[1].value).map(([cat, data]) => (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{cat}</p>
                      <p className="text-sm text-gray-500">{data.count} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.value)}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(data.purchase)} purchased</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className="text-lg">Room Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(roomSummary).sort((a, b) => b[1].value - a[1].value).map(([room, data]) => (
                  <div key={room} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <p className="font-semibold text-gray-900 dark:text-white">{room}</p>
                    <p className="text-sm text-gray-500">{data.count} items · {formatCurrency(data.value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className="text-lg">Top 10 High-Value Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highValueItems.map((item, i) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.brand} {item.model}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.currentValue)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'} print:block`}>
            <CardHeader>
              <CardTitle className="text-lg">Report Preview</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-600">
                    <th className="text-left py-2 px-3">#</th>
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Category</th>
                    <th className="text-left py-2 px-3">Room</th>
                    <th className="text-left py-2 px-3">Brand/Model</th>
                    <th className="text-left py-2 px-3">Serial #</th>
                    <th className="text-left py-2 px-3">Purchased</th>
                    <th className="text-right py-2 px-3">Value</th>
                    <th className="text-right py-2 px-3">Warranty</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className="border-b dark:border-gray-700">
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3 font-medium">{item.name}</td>
                      <td className="py-2 px-3"><Badge variant="outline" className="text-xs">{item.category}</Badge></td>
                      <td className="py-2 px-3">{item.room}</td>
                      <td className="py-2 px-3">{item.brand} {item.model}</td>
                      <td className="py-2 px-3 font-mono text-xs">{item.serialNumber || '-'}</td>
                      <td className="py-2 px-3">{item.purchaseDate}</td>
                      <td className="py-2 px-3 text-right font-semibold">{formatCurrency(item.currentValue)}</td>
                      <td className="py-2 px-3 text-right">{item.warrantyExpiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
