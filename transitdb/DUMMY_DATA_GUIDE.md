# DUMMY_DATA_GUIDE.md

## Table of Contents
1. [SQL Scripts for Inserting Dummy Data](#sql-scripts-for-inserting-dummy-data)
2. [API Documentation](#api-documentation)
3. [User Roles Explanation](#user-roles-explanation)
4. [What Users Can Modify](#what-users-can-modify)
5. [Complete Workflow Guidance](#complete-workflow-guidance)

---

## SQL Scripts for Inserting Dummy Data
```sql
-- Dummy Data for Users Table
INSERT INTO users (username, password, role) VALUES
('test_user1', 'password123', 'admin'),
('test_user2', 'password456', 'user');

-- Dummy Data for Transit Routes
INSERT INTO routes (route_name, start_point, end_point) VALUES
('Route A', 'Location 1', 'Location 2'),
('Route B', 'Location 3', 'Location 4');

-- Dummy Data for Schedule
INSERT INTO schedule (route_id, time) VALUES
(1, '2026-03-26 09:00:00'),
(2, '2026-03-26 10:00:00');
```

## API Documentation
### Endpoints:
- **GET /api/users**: Retrieve a list of users.
- **POST /api/users**: Create a new user.
- **GET /api/routes**: Retrieve a list of transit routes.
- **POST /api/routes**: Create a new transit route.

### Sample Request:
```bash
curl -X GET https://api.example.com/api/users
```

## User Roles Explanation
- **Admin**: Has access to all functionalities, including managing users and routes.
- **User**: Can view routes and schedules but cannot modify them.

## What Users Can Modify
- Admin can create, update, or delete users and routes.
- Users can only view information, they cannot make changes.

## Complete Workflow Guidance
1. **User Registration**: User registers through the API.
2. **Admin Approval**: Admin verifies and approves the registration.
3. **Route Creation**: Admin creates transit routes using API endpoints.
4. **Schedule Setup**: Admin sets up schedules for routes.
5. **User Engagement**: Users can now access the system to view routes and schedules.


---
*This guide should help users understand how to insert dummy data and engage with the Transit database system effectively.*