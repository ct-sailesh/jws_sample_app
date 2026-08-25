/** Mock data only — mirrors the prototype's own "mock data only" disclosure. No production/customer data. */

import type { ChipTone } from '../components/Chip';
import type { Finding } from '../types/inspection';

export type { Finding };

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  city: string;
  registration: string;
  odometerKm: number;
  statusLabel: string;
  statusTone: ChipTone;
}

/**
 * FIX: GarageScreen used to render its second vehicle card as a fully
 * hand-typed literal alongside the first, mock-data-driven one. Both cars
 * are now entries in one array so the carousel is genuinely data-driven —
 * adding, removing or reordering a vehicle no longer touches screen code.
 */
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    make: 'Hyundai',
    model: 'Creta',
    variant: 'SX 1.5 Diesel',
    year: 2019,
    city: 'Pune',
    registration: 'MH 12 QK 4821',
    odometerKm: 68412,
    statusLabel: 'Offer received',
    statusTone: 'primary',
  },
  {
    id: 'v2',
    make: 'Maruti Suzuki',
    model: 'Swift',
    variant: 'VDi',
    year: 2015,
    city: 'Pune',
    // odometerKm/city aren't surfaced by GarageScreen's card today, but the
    // Vehicle shape requires them — placeholders, not real data.
    registration: 'MH 12 AB 9021',
    odometerKm: 82340,
    statusLabel: 'Sold',
    statusTone: 'success',
  },
];

/** The owner's active vehicle — everywhere outside GarageScreen's carousel still just needs "the one car being valued". */
export const mockVehicle = mockVehicles[0];

export const mockFindings: Finding[] = [
  { id: 'f1', panel: 'Front Bumper', issue: 'Scratch', severity: 'Minor', confidence: 0.94, deduction: 4000, location: { x: 0.62, y: 0.71 } },
  { id: 'f2', panel: 'Rear Left Door', issue: 'Dent', severity: 'Minor', confidence: 0.91, deduction: 7500, location: { x: 0.35, y: 0.52 } },
  { id: 'f3', panel: 'Left Headlamp', issue: 'Crack', severity: 'Minor', confidence: 0.88, deduction: 5500, location: { x: 0.22, y: 0.4 } },
  { id: 'f4', panel: 'Front Left Alloy', issue: 'Scratch', severity: 'Minor', confidence: 0.86, deduction: 2000, location: { x: 0.28, y: 0.82 } },
];

export const mockValuation = {
  baseValue: 1060000,
  ageDeduction: 145000,
  mileageDeduction: 38000,
  conditionDeduction: 22000,
  damageDeduction: 19000,
  marketAdjustment: 9000,
  final: 845000,
  rangeLow: 810000,
  rangeHigh: 880000,
  conditionScore: 78,
};

export const mockDealers = [
  {
    id: 'd1',
    name: 'JSW Select Cars — Baner',
    distanceKm: 4.2,
    hours: 'Open until 8:00 PM',
    address: 'Survey 42, Baner Road, Pune 411045',
  },
  {
    id: 'd2',
    name: 'JSW Select Cars — Kharadi',
    distanceKm: 11.6,
    hours: 'Closed now',
    address: 'Gera Commerzone, Kharadi, Pune 411014',
  },
  {
    id: 'd3',
    name: 'JSW Select Cars — Chinchwad',
    distanceKm: 18.3,
    hours: 'Open until 7:30 PM',
    address: 'Mumbai-Pune Highway, Chinchwad, Pune 411019',
  },
];

export const mockOwner = {
  name: 'Aarti Deshpande',
  phone: '+91 98220 41927',
};

export const checklistTags = [
  'Scratches',
  'Dents',
  'Broken lights',
  'Paint mismatch',
  'Missing panels',
  'Tyre condition',
  'Cabin cleanliness',
  'Missing images',
];
