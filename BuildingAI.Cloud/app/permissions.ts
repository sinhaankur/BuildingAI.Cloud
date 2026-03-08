// Permissions mapped to user types for BuildingAi.cloud
import { UserType } from './userTypes';

export type Permission =
  | 'submit_work_order'
  | 'book_amenity'
  | 'view_announcements'
  | 'log_package'
  | 'manage_visitors'
  | 'view_pte_notes'
  | 'update_work_order_status'
  | 'add_technical_note'
  | 'manage_equipment_assets'
  | 'send_building_email'
  | 'approve_amenity_booking'
  | 'run_reports'
  | 'access_emergency_broadcast'
  | 'modify_system_settings'
  | 'view_board_documents'
  | 'view_financial_legal_folders'
  | 'portfolio_analytics'
  | 'toggle_properties'
  | 'view_cross_building_reports';

export const userTypePermissions: Record<UserType, Permission[]> = {
  Resident: [
    'submit_work_order',
    'book_amenity',
    'view_announcements',
  ],
  FrontDesk: [
    'log_package',
    'manage_visitors',
    'view_pte_notes',
  ],
  Maintenance: [
    'update_work_order_status',
    'add_technical_note',
    'manage_equipment_assets',
  ],
  Manager: [
    'send_building_email',
    'approve_amenity_booking',
    'run_reports',
  ],
  SecurityOfficer: [
    'access_emergency_broadcast',
    'modify_system_settings',
  ],
  BoardMember: [
    'view_board_documents',
    'view_financial_legal_folders',
  ],
  Superuser: [
    'portfolio_analytics',
    'toggle_properties',
    'view_cross_building_reports',
  ],
};
