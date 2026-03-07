// Core Feature Modules for BuildingAI.Cloud

export interface FeatureModule {
  name: string;
  description: string;
  components: string[];
}

export const featureModules: FeatureModule[] = [
  {
    name: 'Record-Keeping & Administration',
    description: 'Centralized data and document management for residents and staff.',
    components: [
      'ResidentDirectory',
      'DocumentLibrary',
      'UnitOverview',
    ],
  },
  {
    name: 'Maintenance & Operations',
    description: 'Work order, asset, and shift management for building operations.',
    components: [
      'WorkOrderManagement',
      'AssetManager',
      'ShiftLog',
    ],
  },
  {
    name: 'Concierge & Front Desk',
    description: 'Package, visitor, and key management for front desk staff.',
    components: [
      'PackageTracking',
      'VisitorManagement',
      'KeyLink',
    ],
  },
  {
    name: 'Resident Experience',
    description: 'Amenity booking, bulletin board, and emergency communications.',
    components: [
      'AmenityReservations',
      'BulletinBoard',
      'EmergencyBroadcasts',
    ],
  },
];
