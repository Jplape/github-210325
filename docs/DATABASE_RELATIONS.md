# Database Relations Documentation

## Entity Relationships

### Equipment ↔ MaintenanceContract (1-n)
- **Equipment**:
  - `_id`: ObjectId (PK)
  - `serial_number`: String (Unique)
  - `model`: String
  - `installation_date`: Date
  - `status`: String (enum: ['active', 'inactive', 'maintenance'])
  
- **MaintenanceContract**:
  - `_id`: ObjectId (PK)
  - `equipment_id`: ObjectId (FK to Equipment)
  - `start_date`: Date
  - `end_date`: Date
  - `terms`: String

### Equipment ↔ MaintenanceHistory (1-n)
- **MaintenanceHistory**:
  - `_id`: ObjectId (PK)
  - `equipment_id`: ObjectId (FK to Equipment)
  - `intervention_id`: ObjectId (FK to Intervention)
  - `maintenance_date`: Date
  - `description`: String
  - `technician`: String

### Equipment ↔ Task (1-n)
- **Task**:
  - `_id`: ObjectId (PK)
  - `equipment_id`: ObjectId (FK to Equipment)
  - `description`: String
  - `due_date`: Date
  - `status`: String (enum: ['pending', 'in_progress', 'completed'])

### Client ↔ Intervention (1-n)
- **Client**:
  - `_id`: ObjectId (PK)
  - `name`: String
  - `contact_info`: String
  
- **Intervention**:
  - `_id`: ObjectId (PK)
  - `client_id`: ObjectId (FK to Client)
  - `start_time`: Date
  - `end_time`: Date
  - `status`: String (enum: ['planned', 'in_progress', 'completed', 'cancelled'])
  - `notes`: String

### User ↔ Intervention (n-n via intervention_user)
- **User**:
  - `_id`: ObjectId (PK)
  - `name`: String
  - `role`: String (enum: ['technician', 'admin', 'manager'])
  
- **intervention_user**:
  - `intervention_id`: ObjectId (FK to Intervention)
  - `user_id`: ObjectId (FK to User)
  - `role`: String (enum: ['primary', 'assistant'])

### Intervention ↔ Task (1-n)
- **Task**:
  - `intervention_id`: ObjectId (FK to Intervention)

### User ↔ ChatMessage (1-n)
- **ChatMessage**:
  - `_id`: ObjectId (PK)
  - `user_id`: ObjectId (FK to User)
  - `content`: String
  - `timestamp`: Date

### ChatConversation ↔ ChatMessage (1-n)
- **ChatConversation**:
  - `_id`: ObjectId (PK)
  - `participants`: [ObjectId] (FK to User)
  
- **ChatMessage**:
  - `conversation_id`: ObjectId (FK to ChatConversation)

## Constraints
- Unique constraint on `Equipment.serial_number`
- Foreign key constraints on all relationship fields
- Enum validations for status fields
- Timestamps (created_at, updated_at) on all entities

## Indexes
- Compound index on `intervention_user` (intervention_id, user_id)
- Index on `Equipment.serial_number`
- Index on `Client.name`
- Index on `User.name`