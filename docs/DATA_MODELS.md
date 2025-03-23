# Data Models Documentation

## Equipment
- **serial_number**: String (required, unique)
- **model**: String (required)
- **installation_date**: Date (required)
- **status**: String (enum: ['active', 'inactive', 'maintenance'])
- **created_at**: Date (auto)
- **updated_at**: Date (auto)

## Intervention
- **client_id**: ObjectId (required, ref: 'Client')
- **start_time**: Date (required)
- **end_time**: Date
- **status**: String (enum: ['planned', 'in_progress', 'completed', 'cancelled'])
- **notes**: String
- **created_at**: Date (auto)
- **updated_at**: Date (auto)

## Migration Notes
- Aligned Mongoose models with Supabase schema
- Standardized naming conventions (snake_case)
- Updated timestamp handling
- Added missing fields
- Removed deprecated fields