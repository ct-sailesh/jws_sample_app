import type { RowConfig } from '../types';

export const garageContent = {
  title: 'My Garage',
  ownVehicleRows: [
    {
      title: 'Previous valuation reports',
      subtitle: '2 reports',
      action: { kind: 'noop', reason: 'valuation report history screen not built yet' },
    },
    {
      title: 'Inspection reports',
      subtitle: 'AI report · dealer evaluation',
      action: { kind: 'noop', reason: 'inspection report detail screen not built yet' },
    },
    {
      title: 'Dealer offers',
      subtitle: '1 open · ₹8,12,000',
      action: { kind: 'noop', reason: 'dealer offers detail screen not built yet' },
    },
    {
      title: 'Document vault',
      action: { kind: 'noop', reason: 'document vault screen not built yet' },
    },
  ] as RowConfig[],
  acrossAccountLabel: 'ACROSS YOUR ACCOUNT',
  acrossAccountRows: [
    { title: 'Exchange history', action: { kind: 'noop', reason: 'exchange history screen not built yet' } },
    { title: 'Saved vehicles', action: { kind: 'noop', reason: 'saved vehicles screen not built yet' } },
    { title: 'Notifications', action: { kind: 'noop', reason: 'notifications screen not built yet' } },
  ] as RowConfig[],
};
