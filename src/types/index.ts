export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  room: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  warrantyMonths: number;
  warrantyExpiry: string;
  serialNumber: string;
  brand: string;
  model: string;
  description: string;
  imageUrl: string;
  receiptUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTask {
  id: string;
  itemId: string;
  itemName: string;
  title: string;
  description: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  customDays?: number;
  lastDone: string;
  nextDue: string;
  isOverdue: boolean;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: 'Monitor', color: '#3B82F6' },
  { id: 'furniture', name: 'Furniture', icon: 'Sofa', color: '#8B5CF6' },
  { id: 'appliances', name: 'Appliances', icon: 'Refrigerator', color: '#10B981' },
  { id: 'clothing', name: 'Clothing', icon: 'Shirt', color: '#F59E0B' },
  { id: 'jewelry', name: 'Jewelry & Watches', icon: 'Watch', color: '#EF4444' },
  { id: 'sports', name: 'Sports Equipment', icon: 'Dumbbell', color: '#06B6D4' },
  { id: 'tools', name: 'Tools', icon: 'Wrench', color: '#6B7280' },
  { id: 'books', name: 'Books & Media', icon: 'BookOpen', color: '#EC4899' },
  { id: 'art', name: 'Art & Collectibles', icon: 'Palette', color: '#F97316' },
  { id: 'other', name: 'Other', icon: 'Package', color: '#6366F1' },
];

export const DEFAULT_ROOMS: Room[] = [
  { id: 'living', name: 'Living Room', icon: 'Tv' },
  { id: 'kitchen', name: 'Kitchen', icon: 'ChefHat' },
  { id: 'bedroom', name: 'Bedroom', icon: 'Bed' },
  { id: 'bathroom', name: 'Bathroom', icon: 'Bath' },
  { id: 'office', name: 'Home Office', icon: 'Monitor' },
  { id: 'garage', name: 'Garage', icon: 'Car' },
  { id: 'garden', name: 'Garden', icon: 'TreePine' },
  { id: 'storage', name: 'Storage', icon: 'Boxes' },
  { id: 'other', name: 'Other', icon: 'MapPin' },
];

export const WARRANTY_PERIODS = [
  { value: 0, label: 'No Warranty' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
  { value: 12, label: '1 Year' },
  { value: 24, label: '2 Years' },
  { value: 36, label: '3 Years' },
  { value: 48, label: '4 Years' },
  { value: 60, label: '5 Years' },
  { value: 120, label: '10 Years' },
  { value: -1, label: 'Lifetime' },
];

export const MAINTENANCE_PRESETS = [
  { title: 'AC Filter Change', frequency: 'monthly' as const, description: 'Replace or clean air conditioning filter' },
  { title: 'Smoke Detector Test', frequency: 'monthly' as const, description: 'Test all smoke and CO detectors' },
  { title: 'Water Filter Change', frequency: 'quarterly' as const, description: 'Replace refrigerator water filter' },
  { title: 'HVAC Service', frequency: 'yearly' as const, description: 'Professional HVAC inspection and service' },
  { title: 'Gutter Cleaning', frequency: 'quarterly' as const, description: 'Clean gutters and downspouts' },
  { title: 'Fire Extinguisher Check', frequency: 'yearly' as const, description: 'Inspect fire extinguishers' },
  { title: 'Carpet Cleaning', frequency: 'yearly' as const, description: 'Deep clean carpets' },
  { title: 'Window Washing', frequency: 'quarterly' as const, description: 'Clean interior and exterior windows' },
];
