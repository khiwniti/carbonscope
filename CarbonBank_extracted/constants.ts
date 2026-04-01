import { Tree, TreeStatus, LandDeed } from './types';

export const CARBON_PER_TREE_YEAR = 9.5; // kg/year
export const APP_VERSION = '1.1.0 (BAAC Pilot)';

// Centered around: Ban Tha Li, Nong Ruea District, Khon Kaen (BAAC Pilot Site)
// Approx Lat/Lng: 16.5415, 102.5034
export const MOCK_TREES: Tree[] = [
  { id: '1', species: 'ต้นสัก (Teak)', plantedDate: '2022-06-15', circumference: 65, height: 8, status: TreeStatus.ALIVE, carbonCredit: 19, lat: 16.5415, lng: 102.5034 },
  { id: '2', species: 'ยางนา (Yang Na)', plantedDate: '2021-05-10', circumference: 95, height: 15, status: TreeStatus.ALIVE, carbonCredit: 28.5, lat: 16.5422, lng: 102.5041 },
  { id: '3', species: 'พะยูง (Siamese Rosewood)', plantedDate: '2023-08-20', circumference: 25, height: 3, status: TreeStatus.ALIVE, carbonCredit: 4.5, lat: 16.5410, lng: 102.5028 },
];

export const MOCK_DEED: LandDeed = {
  id: 'D001',
  ownerName: 'ธนพิสิฐ ใจกว้าง', // Community Leader from News
  deedNumber: 'KK-99182',
  rai: 15,
  ngan: 2,
  wah: 50,
  imageUrl: 'https://picsum.photos/400/600',
  processed: false,
};