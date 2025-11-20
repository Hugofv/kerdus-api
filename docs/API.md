# API Documentation

This document describes the RESTful API endpoints for the Operations Management System.

## Base URL

All endpoints are prefixed with `/api`.

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

**Note:** BigInt IDs (Operation.id, Installment.id, Payment.id) are serialized as strings in JSON responses.

## Authentication

Most endpoints require authentication via `Authorization` header:

```
Authorization: Bearer userId:role
```

For development, endpoints work without auth (defaults to owner role).

## Endpoints

### Accounts

#### List Accounts
- **GET** `/api/accounts`
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `q` (string) - Search by name or email
  - `ownerId` (number) - Filter by owner
- **Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Account Name",
        "email": "account@example.com",
        "status": "ACTIVE",
        "currency": "BRL",
        "ownerId": 1,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### Get Account
- **GET** `/api/accounts/:id`
- **Response:** Single account object with related data

#### Create Account
- **POST** `/api/accounts`
- **Body:**
```json
{
  "name": "Account Name",
  "email": "account@example.com",
  "phone": "+5511999999999",
  "status": "ACTIVE",
  "currency": "BRL",
  "ownerId": 1
}
```

#### Update Account
- **PUT** `/api/accounts/:id`
- **Body:** Partial account data

#### Delete Account
- **DELETE** `/api/accounts/:id`

---

### Clients

#### List Clients
- **GET** `/api/clients`
- **Query Parameters:**
  - `page`, `limit` (pagination)
  - `accountId` (number) - Filter by account
  - `q` (string) - Search by name, email, or phone
- **Response:** Paginated list of clients

#### Get Client
- **GET** `/api/clients/:id`
- **Response:** Client with related operations

#### Create Client
- **POST** `/api/clients`
- **Body:**
```json
{
  "accountId": 1,
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "+5511999999999"
}
```

#### Update Client
- **PUT** `/api/clients/:id`

#### Delete Client
- **DELETE** `/api/clients/:id`

---

### Operations

#### List Operations
- **GET** `/api/operations`
- **Query Parameters:**
  - `page`, `limit` (pagination)
  - `accountId` (number)
  - `clientId` (number)
  - `status` (string)
  - `type` (string) - LOAN, RENTAL, OTHER
- **Response:** Paginated list of operations with installments

#### Get Operation
- **GET** `/api/operations/:id`
- **Response:** Operation with installments, client, account, resource
- **Note:** `id` is a BigInt (string in JSON)

#### Create Operation
- **POST** `/api/operations`
- **Body:**
```json
{
  "accountId": 1,
  "clientId": 1,
  "type": "LOAN",
  "title": "Personal Loan",
  "principalAmount": 10000.00,
  "currency": "BRL",
  "startDate": "2024-01-01T00:00:00.000Z",
  "frequency": "MONTHLY",
  "interestRate": 2.5,
  "entryAmount": 1000.00,
  "installments": 12
}
```
- **Behavior:** Automatically generates installments based on frequency and count
- **Response:** Operation with generated installments

#### Update Operation
- **PUT** `/api/operations/:id`
- **Body:** Partial operation data (installments-related fields cannot be updated)

#### Delete Operation
- **DELETE** `/api/operations/:id`

#### Register Payment
- **POST** `/api/operations/:id/register-payment`
- **Body:**
```json
{
  "amount": 1000.00,
  "method": "PIX",
  "installmentId": "1",
  "reference": "PIX-123456",
  "clientId": 1
}
```
- **Behavior:** Creates payment and updates installment status if fully paid

#### Trigger Alert
- **POST** `/api/operations/:id/trigger-alert`
- **Body:**
```json
{
  "type": "PAYMENT_REMINDER",
  "template": "payment_reminder_template",
  "sendAt": "2024-01-15T10:00:00.000Z"
}
```

---

### Installments

#### List Installments
- **GET** `/api/installments`
- **Query Parameters:**
  - `page`, `limit` (pagination)
  - `operationId` (string) - BigInt as string
  - `status` (string) - PENDING, PAID, LATE, CANCELLED
  - `dueDateFrom` (ISO date string)
  - `dueDateTo` (ISO date string)
- **Response:** Paginated list of installments

#### Get Installment
- **GET** `/api/installments/:id`
- **Note:** `id` is a BigInt (string in JSON)

#### Update Installment
- **PATCH** `/api/installments/:id`
- **Body:**
```json
{
  "dueDate": "2024-02-01T00:00:00.000Z",
  "amount": 1000.00,
  "notes": "Updated notes"
}
```

#### Mark Installment as Paid
- **PATCH** `/api/installments/:id/mark-paid`
- **Body:**
```json
{
  "amount": 1000.00,
  "method": "PIX",
  "clientId": 1,
  "operationId": "1"
}
```

---

### Payments

#### List Payments
- **GET** `/api/payments`
- **Query Parameters:**
  - `page`, `limit` (pagination)
  - `clientId` (number)
  - `operationId` (string) - BigInt as string
  - `from` (ISO date string)
  - `to` (ISO date string)
- **Response:** Paginated list of payments

#### Get Payment
- **GET** `/api/payments/:id`
- **Note:** `id` is a BigInt (string in JSON)

#### Create Payment
- **POST** `/api/payments`
- **Body:**
```json
{
  "clientId": 1,
  "operationId": "1",
  "installmentId": "1",
  "amount": 1000.00,
  "currency": "BRL",
  "method": "PIX",
  "reference": "PIX-123456",
  "paidAt": "2024-01-15T10:00:00.000Z"
}
```
- **Behavior:** Updates installment status if fully paid

---

### Resources

#### List Resources
- **GET** `/api/resources`
- **Query Parameters:**
  - `page`, `limit` (pagination)
  - `accountId` (number)
  - `type` (string) - PROPERTY, VEHICLE, ROOM, OTHER

#### Get Resource
- **GET** `/api/resources/:id`

#### Create Resource
- **POST** `/api/resources`
- **Body:**
```json
{
  "accountId": 1,
  "type": "PROPERTY",
  "title": "Apartment 101",
  "description": "2 bedrooms, 1 bathroom"
}
```

#### Update Resource
- **PUT** `/api/resources/:id`

#### Delete Resource
- **DELETE** `/api/resources/:id`

---

### Alerts

#### List Alerts
- **GET** `/api/alerts`
- **Query Parameters:**
  - `page`, `limit` (pagination)
  - `operationId` (string) - BigInt as string
  - `enabled` (boolean)

#### Get Alert
- **GET** `/api/alerts/:id`

#### Create Alert
- **POST** `/api/alerts`
- **Body:**
```json
{
  "operationId": "1",
  "type": "PAYMENT_REMINDER",
  "template": "reminder_template",
  "sendAt": "2024-01-15T10:00:00.000Z",
  "enabled": true
}
```

#### Update Alert
- **PUT** `/api/alerts/:id`

#### Delete Alert
- **DELETE** `/api/alerts/:id`

---

### Notifications

#### List Notifications
- **GET** `/api/notifications`
- **Query Parameters:**
  - `page`, `limit` (pagination)
  - `userId` (number)
  - `read` (boolean)
  - `channel` (string) - WHATSAPP, PUSH, IN_APP

#### Get Notification
- **GET** `/api/notifications/:id`

#### Create Notification
- **POST** `/api/notifications`
- **Body:**
```json
{
  "userId": 1,
  "title": "Payment Due",
  "body": "Your payment is due on 2024-01-15",
  "channel": "WHATSAPP"
}
```

#### Update Notification
- **PUT** `/api/notifications/:id`

#### Mark as Read
- **PATCH** `/api/notifications/:id/read`

#### Delete Notification
- **DELETE** `/api/notifications/:id`

---

### Settings

#### List Settings
- **GET** `/api/settings`
- **Query Parameters:**
  - `page`, `limit` (pagination)
  - `accountId` (number)

#### Get Setting
- **GET** `/api/settings/:key`
- **Query Parameters:**
  - `accountId` (number, optional)

#### Create Setting
- **POST** `/api/settings`
- **Body:**
```json
{
  "accountId": 1,
  "key": "notification_enabled",
  "value": true
}
```

#### Update Setting
- **PUT** `/api/settings/:key`

#### Upsert Setting
- **PATCH** `/api/settings/:key`
- **Body:**
```json
{
  "value": true
}
```

#### Delete Setting
- **DELETE** `/api/settings/:key`
- **Query Parameters:**
  - `accountId` (number, optional)

---

### Platform Users

#### List Users (Owner/Admin only)
- **GET** `/api/platform-users`
- **Query Parameters:**
  - `page`, `limit` (pagination)
  - `role` (string) - owner, admin, agent, viewer
  - `q` (string) - Search by name or email

#### Get User (Owner/Admin only)
- **GET** `/api/platform-users/:id`

#### Create User (Owner/Admin only)
- **POST** `/api/platform-users`
- **Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "phone": "+5511999999999",
  "role": "agent",
  "passwordHash": "hashed_password"
}
```

#### Update User (Owner/Admin only)
- **PUT** `/api/platform-users/:id`

#### Delete User (Owner/Admin only)
- **DELETE** `/api/platform-users/:id`

---

## Enums

### OperationType
- `LOAN`
- `RENTAL`
- `OTHER`

### Frequency
- `WEEKLY`
- `BIWEEKLY`
- `MONTHLY`

### InstallmentStatus
- `PENDING`
- `PAID`
- `LATE`
- `CANCELLED`

### PaymentMethod
- `CASH`
- `BANK_TRANSFER`
- `PIX`
- `CARD`

### NotificationChannel
- `WHATSAPP`
- `PUSH`
- `IN_APP`

### ResourceType
- `PROPERTY`
- `VEHICLE`
- `ROOM`
- `OTHER`

### AccountStatus
- `ACTIVE`
- `INACTIVE`

### Currency
- `BRL`
- `USD`
- `EUR`
- `GBP`

### UserRole
- `owner`
- `admin`
- `agent`
- `viewer`

---

## Error Codes

- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `INTERNAL_ERROR` - Server error

---

## Notes

1. **BigInt Handling:** Operation, Installment, and Payment IDs are BigInt in the database but serialized as strings in JSON responses.

2. **Installment Generation:** When creating an operation with `installments` and `frequency`, installments are automatically generated with calculated due dates and amounts.

3. **Payment Processing:** When a payment is registered and linked to an installment, the installment status is automatically updated to `PAID` if the total paid amount equals or exceeds the installment amount.

4. **Date Formats:** All dates should be in ISO 8601 format (e.g., `2024-01-01T00:00:00.000Z`).

5. **Pagination:** Default page size is 20, maximum is 100.

