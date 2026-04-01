
export enum TreeStatus {
  ALIVE = 'ALIVE',
  DEAD = 'DEAD',
  LOST = 'LOST',
  CUT = 'CUT'
}

export interface Tree {
  id: string;
  species: string; // e.g., "Teak", "Rubber"
  plantedDate: string;
  circumference: number; // in cm
  height: number; // in meters
  status: TreeStatus;
  carbonCredit: number; // Calculated value
  lat: number;
  lng: number;
  imageUrl?: string;
  deedId?: string; // Link to the land deed this tree belongs to
}

export interface LandDeed {
  id: string;
  ownerName: string;
  deedNumber: string;
  rai: number;
  ngan: number;
  wah: number;
  imageUrl: string;
  processed: boolean;
  // Polygon points for the map [lat, lng]
  polygonPoints?: [number, number][];
}

export interface CarbonStats {
  totalTrees: number;
  totalCarbon: number; // kg
  activeVillagers: number;
  projectedValue: number; // THB
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  status: 'COMPLETED' | 'PENDING';
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export type ViewState = 'DASHBOARD' | 'MAP_PLOT' | 'SCANNER' | 'PROFILE' | 'TRADING_MARKET' | 'TREE_DETAIL' | 'TREE_LIST';

// Global Extensions
declare global {
  interface Window {
    liff: any;
    google: any;
  }
}