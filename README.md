# 🏦 International Payment Portal

A secure, full-stack international payment portal built with modern web technologies and banking-grade security features for an international bank's internal payment system.

## 👥 Team Members

| Name | Student Number | Role |
|------|----------------|------|
| Chandler Prins | ST10268042 | Frontend Development |
| Mud-dath-thir Daniels | ST10301862 | Backend Development |
| Dhruv Rathod | ST10109298 | Backend Development & Documentation |

## 📋 Assignment Overview

This project involves developing an internal international payment system for an international bank. The system allows customers to register and make international payments through the bank's online banking site. These transactions are then displayed on a secure payments portal accessible only by dedicated pre-registered bank staff.

### Workflow
1. **Customer Registration**: Customers register by providing their full name, ID number, account number, and password
2. **Customer Login**: Customers log in using their username, account number, and password
3. **Payment Creation**: Customers enter payment amount, select currency, choose payment provider (SWIFT in South Africa), provide recipient account information and SWIFT code, then submit
4. **Transaction Storage**: Payments are stored securely in a database
5. **Employee Portal Access**: Pre-registered bank employees access the payments portal (no registration required)
6. **Transaction Verification**: Employees verify account information and SWIFT codes
7. **Payment Processing**: Employees forward verified transactions to SWIFT for completion

The system features three distinct portals: Customer Portal, Employee Portal, and Admin Portal, each with specific access controls and functionality.

## ✨ Features

### 🔐 Customer Portal Features
- **User Registration**: Secure account creation with full name, ID number, account number, and password
- **User Authentication**: Login with username, account number, and password
- **Payment Creation**: Create international payments with:
  - Payment amount entry
  - Currency selection
  - Payment provider selection (SWIFT)
  - Recipient account information
  - SWIFT code entry
- **Payment Submission**: Finalize payments with "Pay Now" functionality
- **Transaction History**: View personal payment history
- **Account Management**: Secure account number validation

### 👔 Employee Portal Features
- **Pre-registered Access**: Login without registration requirement
- **Transaction Dashboard**: View all pending international payments
- **Payment Verification**: 
  - Verify customer account information
  - Validate SWIFT codes
  - Review payment details
- **Transaction Processing**: 
  - Verify transactions with a verification button
  - Forward verified payments to SWIFT
  - Submit completed transactions
- **Real-time Updates**: Access to current transaction status

### 🛡️ Admin Portal Features
- **User Management**: Oversee all user accounts
- **System Monitoring**: Monitor system health and security events
- **Transaction Oversight**: Review all transactions across the system
- **Access Control**: Manage employee and customer permissions

### 🎨 User Experience (All Portals)
- **Responsive Design**: Mobile-first approach for all devices
- **Modern UI**: Clean, professional banking interface
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Loading States**: Visual feedback for all operations
- **Intuitive Navigation**: Clear routing between different sections

## 🛡️ Security Overview

This application implements comprehensive security measures to protect against various attack vectors identified in the security analysis phase:

### Protected Against Attacks

#### 1. **SQL Injection Prevention**
- **Implementation**: MongoDB with Mongoose ODM uses parameterized queries by default
- **Additional Protection**: express-mongo-sanitize middleware removes malicious operators from user input
- **Validation**: express-validator sanitizes all input data before database operations

#### 2. **Cross-Site Scripting (XSS) Prevention**
- **Implementation**: xss-clean middleware sanitizes user input
- **CSP Headers**: Content Security Policy configured via Helmet.js
- **Input Filtering**: All user inputs are validated and sanitized on both client and server
- **Output Encoding**: React's built-in XSS protection for rendering user content

#### 3. **Cross-Site Request Forgery (CSRF) Protection**
- **Implementation**: Double-submit cookie pattern
- **Token Validation**: CSRF tokens required for all state-changing operations
- **Same-Site Cookies**: Cookie security attributes configured

#### 4. **Man-in-the-Middle (MITM) Attack Prevention**
- **Implementation**: HTTPS/SSL enforcement with TLS certificates
- **HSTS Headers**: HTTP Strict Transport Security configured
- **Secure Cookies**: All cookies marked as secure and httpOnly
- **Certificate Validation**: Proper SSL certificate setup for production

#### 5. **Session Hijacking Prevention**
- **Implementation**: Secure session management with 15-minute timeouts
- **Session Tokens**: JWT-based authentication with secure signing
- **Session Regeneration**: New session IDs generated after authentication
- **Secure Storage**: Sessions stored server-side with encrypted tokens

#### 6. **Clickjacking Protection**
- **Implementation**: X-Frame-Options header set to DENY
- **CSP Frame Ancestors**: Content Security Policy frame-ancestors directive
- **Helmet.js Configuration**: Comprehensive header security

#### 7. **Brute Force Attack Prevention**
- **Implementation**: express-rate-limit middleware
- **Rate Limiting Tiers**:
  - Login attempts: 5 per 15 minutes per IP
  - API requests: 100 per 15 minutes per IP
  - Payment creation: 10 per hour per user
- **Account Lockout**: Temporary account suspension after failed attempts

#### 8. **DDoS (Distributed Denial of Service) Protection**
- **Implementation**: Multi-tier rate limiting
- **Request Throttling**: Global and endpoint-specific limits
- **IP-based Limiting**: Track and limit requests per IP address

#### 9. **Password Security**
- **Implementation**: bcryptjs with 12 salt rounds
- **Password Hashing**: All passwords hashed before storage
- **No Plain Text**: Passwords never stored in plain text
- **Strong Password Requirements**: Enforced password complexity rules

#### 10. **Authentication & Authorization**
- **JWT Tokens**: Secure token-based authentication
- **Token Expiration**: 15-minute token lifetime
- **Role-Based Access Control**: Different permissions for customers, employees, and admins
- **Two-Factor Authentication**: TOTP implementation ready for deployment

### Security Headers Implemented
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`

### Audit Logging
- Failed login attempts tracked
- Payment transactions logged
- Security events monitored
- User actions audited

## 📝 Changelog

### Part 3 Updates
- Enhanced security implementation across all portals
- Improved error handling and user feedback
- Added comprehensive input validation
- Implemented rate limiting on all endpoints
- Enhanced session management and timeout handling
- Improved Docker configuration for deployment
- Added health check endpoints
- Enhanced logging and monitoring capabilities

### Feedback Implementation
- Strengthened CSRF protection mechanisms
- Improved password hashing configuration
- Enhanced XSS prevention filters
- Added additional security headers
- Improved documentation and code comments

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **HTTP Client**: Axios 1.11.0
- **Styling**: CSS-in-JS with styled-jsx

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 8.17.1
- **Authentication**: JWT with jsonwebtoken 9.0.2
- **Password Hashing**: bcryptjs 3.0.2
- **Security**: Helmet.js 8.1.0, express-rate-limit 7.1.5
- **Validation**: express-validator 7.0.1
- **Logging**: Morgan 1.10.0

### Security Packages
- **helmet**: Security headers (CSP, HSTS, X-Frame-Options)
- **xss-clean**: XSS attack prevention
- **express-mongo-sanitize**: NoSQL injection prevention
- **express-rate-limit**: DDoS and brute force protection
- **cors**: Cross-origin request security

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/chandlerprins/InternationalPortal.git
cd InternationalPortal
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Environment Configuration**

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/international_portal
# or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/international_portal

# API Configuration
API_PORT=3443
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=15m

# Frontend Origin (for CORS)
FRONTEND_ORIGIN=http://localhost:5173

# Session Security
SESSION_SECRET=your_session_secret_here
```

4. **Frontend Setup**
```bash
cd ../frontend
npm install
```

5. **SSL Certificates** (for HTTPS in production)
```bash
cd backend
# Generate self-signed certificates for development
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes
```

### 🏃‍♂️ Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on https://localhost:3443
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

#### Production Mode

**Using Docker Compose:**
```bash
docker-compose up --build
```

**Manual Production:**
```bash
# Backend
cd backend
NODE_ENV=production npm run prod

# Frontend
cd frontend
npm run build
npm run preview
```

## 🐳 Docker Support

The application includes Docker support for easy deployment:

```bash
# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

## 📱 API Endpoints

### Authentication
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/auth/logout` - Secure logout
- `POST /v1/auth/2fa-setup` - Setup 2FA
- `POST /v1/auth/verify-2fa` - Verify 2FA token
- `GET /v1/auth/security-status` - Get security status

### Payments
- `POST /v1/payments` - Create payment
- `GET /v1/payments` - List user payments
- `GET /v1/payments/:id` - Get payment details
- `PUT /v1/payments/:id/verify` - Verify payment (Employee only)

### Utility
- `GET /health` - Health check endpoint

## 📚 References

### Documentation & Best Practices
1. **OWASP Top 10 Security Risks**
   - https://owasp.org/www-project-top-ten/
   - Used for understanding and implementing protection against common web vulnerabilities

2. **MongoDB Security Checklist**
   - https://docs.mongodb.com/manual/administration/security-checklist/
   - Implemented database security best practices

3. **Express.js Security Best Practices**
   - https://expressjs.com/en/advanced/best-practice-security.html
   - Applied production security configurations

4. **JWT Best Practices**
   - https://tools.ietf.org/html/rfc7519
   - Implemented secure token-based authentication

5. **Docker Documentation**
   - https://docs.docker.com/
   - Used for containerization and deployment setup

### JavaScript & Node.js Resources
6. **MDN Web Docs - JavaScript**
   - https://developer.mozilla.org/en-US/docs/Web/JavaScript
   - JavaScript language reference and best practices

7. **Node.js Documentation**
   - https://nodejs.org/en/docs/
   - Node.js API and module documentation

8. **React Documentation**
   - https://react.dev/
   - React framework and hooks implementation

### Security Libraries
9. **Helmet.js Documentation**
   - https://helmetjs.github.io/
   - Security header configuration

10. **bcrypt.js Documentation**
    - https://github.com/dcodeIO/bcrypt.js
    - Password hashing implementation

11. **express-validator Documentation**
    - https://express-validator.github.io/docs/
    - Input validation and sanitization

12. **express-rate-limit Documentation**
    - https://github.com/nfriedly/express-rate-limit
    - Rate limiting implementation

### Additional Resources
13. **SWIFT Standards**
    - https://www.swift.com/standards
    - International payment standards and SWIFT code validation

14. **PCI DSS Guidelines**
    - https://www.pcisecuritystandards.org/
    - Payment card industry security standards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow security best practices
- Include tests for new features
- Update documentation
- Write clean, commented code

## 🆘 Support & Troubleshooting

### Common Issues

**Connection Issues:**
- Check MongoDB connection string
- Verify network connectivity
- Ensure MongoDB service is running

**Authentication Issues:**
- Verify JWT secrets are set in .env
- Check session configuration
- Validate environment variables
- Clear browser cookies and try again

**SSL Issues:**
- Ensure certificates are properly generated
- Check certificate paths in configuration
- Verify SSL configuration in production

### Getting Help
For security issues, please contact the security team directly:
- **Dhruv Rathod** (ST10109298)
- **Mud-dath-thir Daniels** (ST10301862)

For general inquiries:
- **Chandler Prins** (ST10268042)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

---

**🔒 Security Notice**: This system handles sensitive financial information. Always follow security best practices and never commit sensitive credentials to version control.
