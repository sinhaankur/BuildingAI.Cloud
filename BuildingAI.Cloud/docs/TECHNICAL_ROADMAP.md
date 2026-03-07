# BuildingAI.Cloud - Technical Roadmap

## Executive Summary

BuildingAI.Cloud is a privacy-first, enterprise-grade residential property management platform designed to compete with BuildingLink. Our key differentiators are **air-gapped encrypted databases**, **management-only access controls**, and **smart data retention** for lightweight operations.

---

## 1. User Portals & Access Levels

### 1.1 Resident Portal
- **Access**: Unit-linked, family member support
- **Capabilities**:
  - Submit maintenance requests (with photo uploads)
  - Book amenities (gym, pool, lounge, elevator for moves)
  - View package notifications
  - Access building announcements
  - Update emergency contacts
  - Digital move-in/move-out requests

### 1.2 Property Manager Portal
- **Access**: Building-wide, multi-property support
- **Capabilities**:
  - Dashboard with KPIs (open tickets, occupancy, delinquencies)
  - Work order assignment and tracking
  - Resident directory management
  - Financial reporting integration
  - Vendor management
  - Lease document management
  - Building-wide announcements

### 1.3 Front Desk / Security Portal
- **Access**: Shift-based, location-specific
- **Capabilities**:
  - **Speed-optimized UI** (< 200ms response time)
  - Digital visitor log (photo capture, ID scan)
  - Package intake and notification
  - Key sign-out tracking
  - Resident lookup (with unit verification)
  - Shift handover notes
  - Emergency contact quick-access
  - Delivery management

### 1.4 Building Owner Portal
- **Access**: Read-only analytics, multi-building
- **Capabilities**:
  - Financial dashboards
  - Occupancy trends
  - Maintenance cost analysis
  - Compliance reports

---

## 2. Database Schema (Core Entities)

```sql
-- =====================================================
-- CORE ENTITIES
-- =====================================================

-- Organizations (Management Companies)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    encryption_key_id VARCHAR(255) NOT NULL, -- Reference to KMS
    data_retention_days INTEGER DEFAULT 365,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buildings
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    total_units INTEGER,
    amenities JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    unit_number VARCHAR(20) NOT NULL,
    floor INTEGER,
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    sqft INTEGER,
    unit_type VARCHAR(50), -- 'residential', 'commercial', 'storage'
    status VARCHAR(50) DEFAULT 'occupied', -- 'vacant', 'occupied', 'maintenance'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(building_id, unit_number)
);

-- Users (All portal users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id
    role VARCHAR(50) NOT NULL, -- 'resident', 'manager', 'front_desk', 'owner', 'maintenance'
    status VARCHAR(50) DEFAULT 'active',
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret_encrypted BYTEA,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Building-Unit Relationships
CREATE TABLE user_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    building_id UUID REFERENCES buildings(id),
    unit_id UUID REFERENCES units(id), -- NULL for staff
    role_in_building VARCHAR(50) NOT NULL,
    is_primary_resident BOOLEAN DEFAULT false,
    move_in_date DATE,
    move_out_date DATE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WORK ORDERS / MAINTENANCE
-- =====================================================

CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    unit_id UUID REFERENCES units(id),
    reported_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    category VARCHAR(100) NOT NULL, -- 'plumbing', 'electrical', 'hvac', 'appliance', 'general'
    priority VARCHAR(20) DEFAULT 'normal', -- 'emergency', 'high', 'normal', 'low'
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'pending_parts', 'completed', 'cancelled'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entry_permission VARCHAR(50) DEFAULT 'accompanied', -- 'anytime', 'accompanied', 'notify_first'
    preferred_times JSONB,
    resolution_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id),
    uploaded_by UUID REFERENCES users(id),
    photo_url VARCHAR(500) NOT NULL, -- Encrypted S3 URL
    photo_type VARCHAR(50), -- 'before', 'after', 'parts'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id),
    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Staff-only comments
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AMENITY BOOKING
-- =====================================================

CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    capacity INTEGER,
    requires_deposit BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2),
    booking_rules JSONB, -- max duration, advance booking limits, etc.
    operating_hours JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE amenity_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amenity_id UUID REFERENCES amenities(id),
    unit_id UUID REFERENCES units(id),
    booked_by UUID REFERENCES users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    guest_count INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled', 'completed'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PACKAGES & DELIVERIES
-- =====================================================

CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    unit_id UUID REFERENCES units(id),
    received_by UUID REFERENCES users(id), -- Front desk staff
    carrier VARCHAR(100),
    tracking_number VARCHAR(255),
    package_type VARCHAR(50), -- 'small', 'medium', 'large', 'oversized', 'perishable'
    storage_location VARCHAR(100),
    photo_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'received', -- 'received', 'notified', 'picked_up', 'returned'
    notified_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    picked_up_by VARCHAR(255), -- Name of person who picked up
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VISITOR MANAGEMENT
-- =====================================================

CREATE TABLE visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    unit_id UUID REFERENCES units(id),
    logged_by UUID REFERENCES users(id), -- Front desk staff
    visitor_name VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(20),
    visitor_company VARCHAR(255),
    visitor_type VARCHAR(50), -- 'guest', 'delivery', 'contractor', 'realtor'
    id_type VARCHAR(50), -- 'drivers_license', 'passport', 'other'
    id_number_hash VARCHAR(255), -- Hashed for privacy
    photo_url VARCHAR(500),
    check_in_at TIMESTAMPTZ DEFAULT NOW(),
    check_out_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-authorized visitors
CREATE TABLE visitor_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES units(id),
    created_by UUID REFERENCES users(id),
    visitor_name VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(20),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_permanent BOOLEAN DEFAULT false,
    access_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- KEY MANAGEMENT
-- =====================================================

CREATE TABLE keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    unit_id UUID REFERENCES units(id),
    key_type VARCHAR(50) NOT NULL, -- 'unit', 'mailbox', 'storage', 'amenity', 'master'
    key_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'checked_out', 'lost'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE key_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID REFERENCES keys(id),
    checked_out_to VARCHAR(255) NOT NULL, -- Name
    checked_out_by UUID REFERENCES users(id), -- Staff who processed
    purpose VARCHAR(255),
    checked_out_at TIMESTAMPTZ DEFAULT NOW(),
    expected_return TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES users(id)
);

-- =====================================================
-- COMMUNICATIONS
-- =====================================================

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    created_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'emergency', 'high', 'normal', 'low'
    target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'residents', 'owners', 'staff'
    channels JSONB DEFAULT '["app"]', -- 'app', 'email', 'sms', 'digital_signage'
    publish_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    to_unit_id UUID REFERENCES units(id), -- For unit-wide messages
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SHIFT MANAGEMENT
-- =====================================================

CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    user_id UUID REFERENCES users(id),
    shift_start TIMESTAMPTZ NOT NULL,
    shift_end TIMESTAMPTZ NOT NULL,
    position VARCHAR(50), -- 'front_desk', 'security', 'maintenance'
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shift_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    handover_time TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT NOT NULL,
    pending_tasks JSONB DEFAULT '[]',
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT & DATA RETENTION
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data retention job tracking
CREATE TABLE data_retention_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    entity_type VARCHAR(100) NOT NULL,
    records_purged INTEGER,
    retention_days INTEGER,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_units_building ON units(building_id);
CREATE INDEX idx_work_orders_building ON work_orders(building_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_packages_unit ON packages(unit_id);
CREATE INDEX idx_visitor_logs_building ON visitor_logs(building_id);
CREATE INDEX idx_visitor_logs_checkin ON visitor_logs(check_in_at);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_messages_to_user ON messages(to_user_id, is_read);
```

---

## 3. Tech Stack Recommendation

### 3.1 Frontend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Web App** | Next.js 14 (React) | SSR for SEO, App Router for performance |
| **Mobile App** | React Native + Expo | Code sharing with web, offline-first capabilities |
| **State Management** | Zustand + React Query | Lightweight, excellent caching |
| **UI Components** | Tailwind CSS + Radix UI | Accessible, customizable |
| **Forms** | React Hook Form + Zod | Validation, performance |
| **Offline Storage** | WatermelonDB (mobile) | SQLite-based, sync-ready |

### 3.2 Backend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **API** | Node.js + Fastify | High performance, TypeScript native |
| **API Style** | REST + tRPC | Type-safe, auto-generated clients |
| **Auth** | Custom + JWT + Refresh Tokens | Fine-grained control |
| **Background Jobs** | BullMQ + Redis | Reliable job processing |
| **File Storage** | AWS S3 + CloudFront | Encrypted, CDN delivery |

### 3.3 Database & Data Layer

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Primary DB** | PostgreSQL 16 | JSONB, RLS, proven reliability |
| **Cache** | Redis Cluster | Session, rate limiting, real-time |
| **Search** | Meilisearch | Fast resident/unit lookup |
| **ORM** | Drizzle ORM | Type-safe, performant |

### 3.4 Real-Time Communication

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **WebSockets** | Socket.io / Ably | Scalable real-time |
| **Push Notifications** | Firebase FCM + APNs | Cross-platform |
| **SMS** | Twilio | Reliable delivery |
| **Email** | AWS SES + Resend | Transactional email |

### 3.5 Infrastructure & Security

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Hosting** | AWS (VPC isolated) | Air-gapped architecture |
| **Container Orchestration** | ECS Fargate | Serverless containers |
| **CDN** | CloudFront | Edge caching |
| **Secrets** | AWS KMS + Secrets Manager | Encryption key management |
| **Monitoring** | Datadog / Grafana | Observability |
| **CI/CD** | GitHub Actions | Automated deployments |

### 3.6 Air-Gapped Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PUBLIC INTERNET                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS CloudFront (CDN)                        │
│                    + AWS WAF (DDoS Protection)                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PUBLIC SUBNET (VPC)                          │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │  Load Balancer  │    │   API Gateway   │                     │
│  └─────────────────┘    └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                        (Security Group)
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRIVATE SUBNET (VPC)                          │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │   App Servers   │    │  Worker Nodes   │                     │
│  │   (Fargate)     │    │   (BullMQ)      │                     │
│  └─────────────────┘    └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                        (Security Group)
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              ISOLATED DATA SUBNET (No Internet)                  │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │   PostgreSQL    │    │     Redis       │                     │
│  │  (Encrypted)    │    │   (Encrypted)   │                     │
│  └─────────────────┘    └─────────────────┘                     │
│                                                                  │
│  • No NAT Gateway    • No Internet Gateway                       │
│  • VPC Endpoints only for AWS services                           │
│  • All data encrypted with customer-managed KMS keys             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. MVP Feature List

### 4.1 MUST-HAVES (Phase 1 - Months 1-4)

| Feature | Priority | User | Rationale |
|---------|----------|------|-----------|
| **User Authentication** | P0 | All | MFA, role-based access |
| **Resident Directory** | P0 | Front Desk | Fast lookup (< 200ms) critical for lobby |
| **Work Order System** | P0 | Residents, Maintenance | Core value prop |
| **Photo Upload for Work Orders** | P0 | Residents | Visual context essential |
| **Package Tracking** | P0 | Front Desk, Residents | Highest daily usage feature |
| **Package Notifications** | P0 | Residents | Email + Push + SMS |
| **Visitor Log** | P0 | Front Desk | Security compliance |
| **Building Announcements** | P0 | Managers | Emergency communication |
| **Basic Dashboard** | P0 | Managers | Operational overview |
| **Offline Work Order Sync** | P0 | Maintenance | Basement/elevator coverage |

### 4.2 SHOULD-HAVES (Phase 2 - Months 5-7)

| Feature | Priority | User | Rationale |
|---------|----------|------|-----------|
| **Amenity Booking** | P1 | Residents | High engagement feature |
| **Elevator Booking** | P1 | Residents | Move-in/out coordination |
| **Key Tracking** | P1 | Front Desk | Accountability |
| **Shift Handover Notes** | P1 | Front Desk | Continuity |
| **Pre-authorized Visitors** | P1 | Residents | Convenience |
| **Message Center** | P1 | All | Private communication |
| **Resident Profile Updates** | P1 | Residents | Self-service |
| **Maintenance Scheduling** | P1 | Maintenance | Efficiency |
| **Basic Reports** | P1 | Managers | Operational insights |

### 4.3 DELIGHTERS (Phase 3 - Months 8-12)

| Feature | Priority | User | Rationale |
|---------|----------|------|-----------|
| **Smart Lock Integration** | P2 | All | IoT connectivity |
| **Digital Signage API** | P2 | Managers | Lobby displays |
| **Yardi/Entrata Integration** | P2 | Managers | Accounting sync |
| **AI Work Order Categorization** | P2 | System | Auto-routing |
| **Resident Satisfaction Surveys** | P2 | Managers | Feedback loop |
| **Multi-language Support** | P2 | All | Accessibility |
| **Owner Financial Dashboard** | P2 | Owners | Investment visibility |
| **Vendor Portal** | P2 | External | Third-party access |
| **Document E-signatures** | P2 | All | Digital leasing |
| **Predictive Maintenance Alerts** | P2 | Maintenance | Proactive care |

---

## 5. Data Retention & Auto-Purge Strategy

### 5.1 Retention Periods (Configurable per Organization)

| Data Type | Default Retention | Rationale |
|-----------|-------------------|-----------|
| Visitor Logs | 90 days | Security compliance |
| Package Records | 30 days after pickup | Storage optimization |
| Work Order Comments | 1 year | Historical context |
| Completed Work Orders | 2 years | Warranty tracking |
| Audit Logs | 7 years | Compliance |
| Messages | 1 year | Communication history |
| Shift Handover Notes | 90 days | Operational relevance |
| Photos (Work Orders) | Same as parent | Linked lifecycle |

### 5.2 Auto-Purge Implementation

```typescript
// Nightly data retention job
async function runDataRetentionJob(organizationId: string) {
  const org = await getOrganization(organizationId);
  const retentionDays = org.data_retention_days;
  
  const tables = [
    { name: 'visitor_logs', dateColumn: 'check_in_at', days: 90 },
    { name: 'packages', dateColumn: 'picked_up_at', days: 30, condition: "status = 'picked_up'" },
    { name: 'shift_handovers', dateColumn: 'handover_time', days: 90 },
    { name: 'messages', dateColumn: 'created_at', days: 365 },
  ];
  
  for (const table of tables) {
    const cutoffDate = subDays(new Date(), table.days);
    const result = await db.execute(`
      DELETE FROM ${table.name}
      WHERE building_id IN (SELECT id FROM buildings WHERE organization_id = $1)
      AND ${table.dateColumn} < $2
      ${table.condition ? `AND ${table.condition}` : ''}
    `, [organizationId, cutoffDate]);
    
    await logRetentionJob(organizationId, table.name, result.rowCount, table.days);
  }
}
```

---

## 6. Security & Compliance

### 6.1 Encryption Standards

| Layer | Method |
|-------|--------|
| Data at Rest | AES-256 (AWS KMS customer-managed keys) |
| Data in Transit | TLS 1.3 |
| Passwords | Argon2id |
| PII Fields | Column-level encryption |
| Backups | Encrypted snapshots |

### 6.2 Access Control

- **RBAC**: Role-based permissions per building
- **MFA**: Required for all management roles
- **Session**: 24-hour JWT with refresh rotation
- **IP Allowlisting**: Optional for manager access
- **Audit Trail**: All data access logged

### 6.3 Compliance Roadmap

| Standard | Timeline | Status |
|----------|----------|--------|
| SOC 2 Type I | Month 6 | Planned |
| SOC 2 Type II | Month 12 | Planned |
| GDPR | Launch | Built-in |
| CCPA | Launch | Built-in |
| HIPAA | Month 18 | If healthcare clients |

---

## 7. Front Desk Performance Requirements

### 7.1 Speed Targets

| Action | Target | Implementation |
|--------|--------|----------------|
| Resident Lookup | < 200ms | Meilisearch index |
| Package Intake | < 3 clicks | Streamlined UI |
| Visitor Check-in | < 30 seconds | Pre-fill, quick photo |
| Page Load | < 1 second | SSR + edge caching |

### 7.2 Offline Capabilities

```typescript
// WatermelonDB schema for offline-first mobile
const workOrderSchema = tableSchema({
  name: 'work_orders',
  columns: [
    { name: 'server_id', type: 'string', isOptional: true },
    { name: 'unit_id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'synced_at', type: 'number', isOptional: true },
    { name: 'created_at', type: 'number' },
  ],
});

// Sync strategy
async function syncWorkOrders() {
  const unsynced = await database.get('work_orders')
    .query(Q.where('synced_at', null))
    .fetch();
  
  for (const order of unsynced) {
    try {
      const serverOrder = await api.createWorkOrder(order);
      await order.update(record => {
        record.server_id = serverOrder.id;
        record.synced_at = Date.now();
      });
    } catch (e) {
      // Retry on next sync
      console.log('Will retry sync for:', order.id);
    }
  }
}
```

---

## 8. Integration Layer

### 8.1 IoT - Smart Locks

```typescript
interface SmartLockProvider {
  vendor: 'august' | 'yale' | 'salto' | 'brivo';
  generateAccessCode(unitId: string, visitorId: string, validUntil: Date): Promise<string>;
  revokeAccess(codeId: string): Promise<void>;
  getAccessLogs(lockId: string, since: Date): Promise<AccessLog[]>;
}
```

### 8.2 Accounting - Yardi/Entrata

```typescript
interface AccountingSync {
  syncResidents(): Promise<SyncResult>;
  syncUnits(): Promise<SyncResult>;
  pushWorkOrderCharges(workOrderId: string, amount: number): Promise<void>;
  getLeaseStatus(unitId: string): Promise<LeaseStatus>;
}
```

### 8.3 Digital Signage

```typescript
// REST API for lobby displays
GET /api/v1/signage/{buildingId}/announcements
GET /api/v1/signage/{buildingId}/weather
GET /api/v1/signage/{buildingId}/amenity-status
POST /api/v1/signage/{buildingId}/emergency-alert
```

---

## 9. Development Timeline

```
Month 1-2:  Foundation (Auth, DB, Core APIs)
Month 3:    Front Desk Portal MVP
Month 4:    Resident Portal + Mobile App
Month 5:    Manager Dashboard + Reports
Month 6:    Amenity Booking + Integrations
Month 7:    Beta Testing + SOC 2 Prep
Month 8:    Public Launch
Month 9-12: Delighter Features + Scale
```

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Front Desk Adoption | 80% daily active | Usage analytics |
| Package Notification Open Rate | > 90% | Delivery tracking |
| Work Order Resolution Time | < 48 hours avg | Ticket analytics |
| System Uptime | 99.9% | Infrastructure monitoring |
| Page Load Time | < 1 second p95 | RUM metrics |
| Data Storage per Building | < 5GB/year | Storage monitoring |

---

*Document Version: 1.0*  
*Last Updated: March 2026*  
*BuildingAI.Cloud - Privacy-First Property Management*
