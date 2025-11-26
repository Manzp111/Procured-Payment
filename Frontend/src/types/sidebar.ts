// Define the structure of a single sidebar item
import type { LucideIcon } from 'lucide-react'; // Import the type for the icon component

export interface SidebarItemData {
  icon: LucideIcon; // The icon component itself
  label: string;
  path: string;
  description?: string; // Optional property
  badge?: number;       // Optional property
  highlight?: boolean;  // Optional property
}