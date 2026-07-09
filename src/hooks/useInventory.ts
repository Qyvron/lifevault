import { useCallback, useMemo } from 'react';
import type { InventoryItem, MaintenanceTask } from '@/types';
import { useLocalStorage } from './useLocalStorage';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addMonths(date: string, months: number): string {
  if (months < 0) return 'Lifetime';
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export function useInventory() {
  const [items, setItems] = useLocalStorage<InventoryItem[]>('lifevault_items', []);
  const [tasks, setTasks] = useLocalStorage<MaintenanceTask[]>('lifevault_tasks', []);

  const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'warrantyExpiry'>) => {
    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...item, id: generateId(), warrantyExpiry: addMonths(item.purchaseDate, item.warrantyMonths), createdAt: now, updatedAt: now,
    };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, [setItems]);

  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
        if (updates.purchaseDate || updates.warrantyMonths) {
          updated.warrantyExpiry = addMonths(updates.purchaseDate || item.purchaseDate, updates.warrantyMonths !== undefined ? updates.warrantyMonths : item.warrantyMonths);
        }
        return updated;
      }
      return item;
    }));
  }, [setItems]);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setTasks(prev => prev.filter(task => task.itemId !== id));
  }, [setItems, setTasks]);

  const getItemById = useCallback((id: string) => items.find(item => item.id === id), [items]);

  const addTask = useCallback((task: Omit<MaintenanceTask, 'id' | 'nextDue' | 'isOverdue'>) => {
    const calculateNextDue = (lastDone: string, frequency: string, customDays?: number): string => {
      const d = new Date(lastDone);
      switch (frequency) {
        case 'weekly': d.setDate(d.getDate() + 7); break;
        case 'monthly': d.setMonth(d.getMonth() + 1); break;
        case 'quarterly': d.setMonth(d.getMonth() + 3); break;
        case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
        case 'custom': if (customDays) d.setDate(d.getDate() + customDays); break;
      }
      return d.toISOString().split('T')[0];
    };
    const nextDue = calculateNextDue(task.lastDone, task.frequency, task.customDays);
    const newTask: MaintenanceTask = { ...task, id: generateId(), nextDue, isOverdue: new Date(nextDue) < new Date() };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [setTasks]);

  const completeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const lastDone = new Date().toISOString().split('T')[0];
        const d = new Date(lastDone);
        switch (task.frequency) {
          case 'weekly': d.setDate(d.getDate() + 7); break;
          case 'monthly': d.setMonth(d.getMonth() + 1); break;
          case 'quarterly': d.setMonth(d.getMonth() + 3); break;
          case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
          case 'custom': if (task.customDays) d.setDate(d.getDate() + task.customDays); break;
        }
        return { ...task, lastDone, nextDue: d.toISOString().split('T')[0], isOverdue: false, completed: false };
      }
      return task;
    }));
  }, [setTasks]);

  const deleteTask = useCallback((taskId: string) => setTasks(prev => prev.filter(task => task.id !== taskId)), [setTasks]);

  const stats = useMemo(() => {
    const now = new Date();
    const totalValue = items.reduce((sum, item) => sum + item.currentValue, 0);
    const totalPurchase = items.reduce((sum, item) => sum + item.purchasePrice, 0);
    const expiringWarranties = items.filter(item => {
      if (item.warrantyExpiry === 'Lifetime') return false;
      const daysUntil = Math.ceil((new Date(item.warrantyExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 90;
    });
    const expiredWarranties = items.filter(item => item.warrantyExpiry !== 'Lifetime' && new Date(item.warrantyExpiry) < now);
    const overdueTasks = tasks.filter(task => task.isOverdue && !task.completed);
    const upcomingTasks = tasks.filter(task => {
      if (task.isOverdue) return false;
      const daysUntil = Math.ceil((new Date(task.nextDue).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 30;
    });
    const categoryBreakdown = items.reduce((acc, item) => { acc[item.category] = (acc[item.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    return { totalItems: items.length, totalValue, totalPurchase, valueChange: totalPurchase > 0 ? ((totalValue - totalPurchase) / totalPurchase * 100) : 0, expiringWarranties: expiringWarranties.length, expiredWarranties: expiredWarranties.length, overdueTasks: overdueTasks.length, upcomingTasks: upcomingTasks.length, categoryBreakdown };
  }, [items, tasks]);

  const recentItems = useMemo(() => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10), [items]);

  return { items, tasks, addItem, updateItem, deleteItem, getItemById, addTask, completeTask, deleteTask, stats, recentItems };
}
