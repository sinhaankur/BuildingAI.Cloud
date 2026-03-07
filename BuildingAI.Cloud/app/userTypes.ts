// User Types and Authority Levels for BuildingAI.Cloud

export type UserType =
  | 'Resident'
  | 'FrontDesk'
  | 'Maintenance'
  | 'Manager'
  | 'SecurityOfficer'
  | 'BoardMember'
  | 'Superuser';

export interface UserAuthority {
  type: UserType;
  description: string;
  keyPermissions: string[];
}

export const userAuthorities: UserAuthority[] = [
  {
    type: 'Resident',
    description: 'The primary occupant or owner.',
    keyPermissions: [
      'Submit work orders',
      'Book amenities',
      'View building announcements',
    ],
  },
  {
    type: 'FrontDesk',
    description: 'High-touch staff (Concierge/Security).',
    keyPermissions: [
      'Log packages',
      'Manage visitors',
      'View Permission to Enter (PTE) notes',
    ],
  },
  {
    type: 'Maintenance',
    description: 'On-site technicians or supers.',
    keyPermissions: [
      'Update work order statuses',
      'Add technical notes',
      'Manage equipment assets',
    ],
  },
  {
    type: 'Manager',
    description: 'Property or General Managers.',
    keyPermissions: [
      'Send building-wide emails',
      'Approve amenity bookings',
      'Run financial/operational reports',
    ],
  },
  {
    type: 'SecurityOfficer',
    description: 'Highest site-level authority.',
    keyPermissions: [
      'Access Emergency Broadcast System',
      'Modify system-wide settings',
    ],
  },
  {
    type: 'BoardMember',
    description: 'Resident leaders (Condo/HOA).',
    keyPermissions: [
      'View private board documents',
      'View specialized financial/legal folders',
    ],
  },
  {
    type: 'Superuser',
    description: 'Portfolio-level executive (multi-building management).',
    keyPermissions: [
      'Portfolio analytics',
      'Toggle between properties',
      'View cross-building reports',
    ],
  },
];
