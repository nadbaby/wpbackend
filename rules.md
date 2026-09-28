# STRICT FRONTEND & BACKEND SEPARATION

## 1. CORE PRINCIPLE

The project MUST maintain a strict separation between frontend and backend.

### FRONTEND

The frontend is responsible for:

* UI
* UX
* CSS
* Styling
* Animations
* Transitions
* Responsive design
* Layout
* Components
* Pages
* Icons
* Images
* Visual states
* Client-side presentation
* Calling backend APIs
* Displaying backend responses

### BACKEND

The backend is responsible for EVERYTHING ELSE.

This includes:

* Business logic
* Authentication
* Authorization
* API logic
* Database logic
* Data validation
* Security
* User management
* Roles and permissions
* Product logic
* Cart logic
* Order logic
* Payment logic
* Inventory logic
* Pricing logic
* Discount logic
* OTP logic
* Email logic
* SMS logic
* Notifications
* File processing
* External API integrations
* Webhooks
* Server-side calculations
* Audit logs
* Logging
* Environment variables
* Secrets
* Configuration
* Database credentials
* API keys
* Third-party credentials

---

# 2. FRONTEND MUST NOT CONTAIN ENVIRONMENT SECRETS

There MUST be **NO `.env` file inside the frontend**.

Correct:

```text
project/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── .env
│   └── package.json
│
└── rules.md
```

The backend owns all environment configuration.

Example:

```text
backend/.env
```

NOT:

```text
frontend/.env
```

---

# 3. BACKEND ENVIRONMENT VARIABLES

All environment variables must be stored in:

```text
backend/.env
```

Examples:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=

JWT_SECRET=
JWT_REFRESH_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

The exact variables depend on the project.

---

# 4. FRONTEND MUST NEVER RECEIVE PRIVATE SECRETS

Never expose these to React:

```text
Database credentials
MongoDB URI
JWT secret
Refresh token secret
Payment secret
Cloudinary API secret
SMTP password
Twilio auth token
Private API keys
Admin credentials
Third-party secret keys
Encryption keys
Webhook secrets
```

The frontend should communicate with the backend through APIs.

Correct:

```text
React
   ↓
Backend API
   ↓
Service
   ↓
Database / External Service
```

Incorrect:

```text
React
   ↓
MongoDB
```

Incorrect:

```text
React
   ↓
Payment Secret Key
```

Incorrect:

```text
React
   ↓
Cloudinary Private API Secret
```

---

# 5. FRONTEND API COMMUNICATION

The frontend should only communicate with the backend API.

Example:

```javascript
const response = await fetch(
  `${API_URL}/api/products`
);
```

However, the frontend must NOT contain secret API credentials.

The backend performs the actual operation.

Example:

```text
Frontend
    ↓
POST /api/orders
    ↓
Backend
    ↓
Validate user
    ↓
Validate products
    ↓
Check database
    ↓
Calculate price
    ↓
Check inventory
    ↓
Create order
    ↓
Return result
```

---

# 6. BUSINESS LOGIC MUST BE BACKEND ONLY

Business logic must NEVER depend on React.

For example:

### WRONG

Frontend calculates:

```javascript
const total = price * quantity;
```

and backend trusts:

```javascript
req.body.total
```

### CORRECT

Frontend sends:

```json
{
  "productId": "...",
  "quantity": 5
}
```

Backend:

```text
Fetch product
↓
Fetch actual price
↓
Validate quantity
↓
Check stock
↓
Calculate total
↓
Apply discount
↓
Create order
```

The backend is the final authority.

---

# 7. SECURITY MUST BE BACKEND ONLY

Frontend security features are for UX only.

The frontend may hide:

```text
Admin button
Delete button
Restricted page
Employee menu
```

But hiding UI does NOT provide security.

The backend MUST enforce:

```text
Authentication
Authorization
Role checking
Permission checking
Resource ownership
Data validation
Access control
```

Example:

```text
Frontend:
Hide Delete button

Backend:
Verify user
↓
Verify role
↓
Verify permission
↓
Verify resource ownership
↓
Delete
```

---

# 8. AUTHENTICATION

Authentication logic belongs in the backend.

Frontend should only:

```text
Show login form
↓
Send credentials to backend
↓
Receive authentication result
↓
Display appropriate UI
```

Backend handles:

```text
Password verification
Password hashing
Token creation
Token validation
Session management
Refresh tokens
OTP verification
Account status
Login restrictions
Rate limiting
```

---

# 9. AUTHORIZATION

Authorization MUST happen on the backend.

Never trust:

```javascript
localStorage.getItem("role")
```

or:

```javascript
user.role === "admin"
```

as a security mechanism.

The backend must independently determine the user's:

```text
Role
Permissions
Access
Ownership
Account status
```

---

# 10. DATABASE MUST BE BACKEND ONLY

The frontend must NEVER directly connect to MongoDB.

MongoDB connection:

```text
backend/.env
      ↓
Backend
      ↓
Mongoose
      ↓
MongoDB
```

Never:

```text
frontend
   ↓
MongoDB
```

---

# 11. ALL DATABASE OPERATIONS MUST BE BACKEND

The frontend can request:

```text
GET products
POST order
PATCH profile
DELETE address
```

But only the backend performs:

```text
MongoDB queries
MongoDB updates
MongoDB deletes
MongoDB inserts
Transactions
Aggregations
Database migrations
Indexes
```

---

# 12. FRONTEND SHOULD NOT IMPLEMENT AUTHORITATIVE LOGIC

The frontend may perform lightweight validation for user experience.

Example:

```javascript
if (!email) {
  setError("Email is required");
}
```

But backend MUST perform the actual validation.

Frontend validation:

```text
UX
```

Backend validation:

```text
Security + correctness
```

---

# 13. FRONTEND RESPONSIBILITIES

Frontend may contain:

```text
React components
Pages
Layouts
CSS
SCSS
Tailwind
Animations
Framer Motion
Transitions
Responsive design
Forms
Buttons
Modals
Drawers
Tables
Charts
Loaders
Skeletons
Icons
Images
Client-side UI state
Navigation
API response rendering
```

---

# 14. BACKEND RESPONSIBILITIES

Backend contains:

```text
Express
Routes
Controllers
Services
Models
Mongoose
Middleware
Authentication
Authorization
Validation
Database
Business logic
Security
API integrations
Payment processing
Webhooks
Email
SMS
OTP
Notifications
Logging
Audit logs
Environment variables
Secrets
Configuration
Server-side calculations
```

---

# 15. FRONTEND SHOULD BE "DUMB" WHERE POSSIBLE

The frontend should primarily:

```text
Receive data
Display data
Collect user input
Send request
Display response
```

It should not become the source of truth.

Example:

```text
Frontend:
"User wants 10 units."

Backend:
"User is allowed to buy 10?"
"Product exists?"
"Product price?"
"Stock available?"
"Discount allowed?"
"Total amount?"
"Order valid?"
```

The backend makes these decisions.

---

# 16. NO BACKEND LOGIC IN FRONTEND

Do not move backend business logic into React simply because it is easier.

Avoid implementing:

```text
Pricing engine
Inventory engine
Permission engine
Payment verification
Order validation
Discount engine
Role authorization
Stock reservation
```

in the frontend.

---

# 17. NO FRONTEND LOGIC IN BACKEND

The backend should not contain visual/UI logic.

Do not put:

```text
CSS
Animations
React components
UI layouts
Button styles
Visual transitions
```

inside backend code.

Backend returns data and status.

Frontend decides how to display it.

---

# 18. API RESPONSE

Backend should return structured data.

Example:

```json
{
  "success": true,
  "data": {
    "products": []
  },
  "message": "Products fetched successfully"
}
```

Frontend decides whether this becomes:

```text
Table
Grid
Card
Carousel
Modal
List
```

---

# 19. ERROR HANDLING

Backend returns safe errors.

Example:

```json
{
  "success": false,
  "message": "Unable to create order",
  "errorCode": "ORDER_CREATION_FAILED"
}
```

Frontend decides how to display:

```text
Toast
Modal
Inline error
Error page
```

Backend must never return sensitive technical information.

---

# 20. ENVIRONMENT FILE RULE

Only backend may contain:

```text
.env
.env.local
.env.production
.env.development
```

Frontend environment files are prohibited unless explicitly approved.

If a frontend library requires configuration, use a backend API/configuration approach whenever possible.

---

# 21. SECRET DETECTION

Before completing a task, the AI agent must check that the frontend does NOT contain:

```text
MongoDB URI
Passwords
JWT secrets
Payment secrets
Private API keys
SMTP credentials
Cloudinary secrets
Twilio secrets
Webhook secrets
Encryption keys
```

If discovered, immediately report it.

---

# 22. FINAL ARCHITECTURE

The expected architecture is:

```text
                    USER
                     │
                     ▼
              ┌─────────────┐
              │   FRONTEND  │
              │   React     │
              │             │
              │ UI / UX     │
              │ CSS         │
              │ Animation   │
              │ Components  │
              │ Pages       │
              └──────┬──────┘
                     │
                     │ HTTPS / API
                     ▼
              ┌─────────────┐
              │   BACKEND   │
              │ Node.js     │
              │ Express     │
              │             │
              │ Auth        │
              │ Security    │
              │ Business    │
              │ Logic       │
              │ Validation  │
              │ Services    │
              │ Payments    │
              │ APIs        │
              └──────┬──────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
      MongoDB    External APIs  Storage
```

---

# 23. GOLDEN RULE

> **FRONTEND = PRESENTATION**
>
> **BACKEND = AUTHORITY**
>
> **DATABASE = SOURCE OF TRUTH**
>
> **SECRETS = BACKEND ONLY**
>
> **SECURITY = BACKEND ENFORCED**
>
> **BUSINESS LOGIC = BACKEND**
>
> **UI / CSS / ANIMATION = FRONTEND**

Any AI agent working on this project must follow this separation unless the project owner explicitly changes this rule.
