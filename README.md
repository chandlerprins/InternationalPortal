# 🏦 International Payment Portal

A secure, full-stack international payment portal built with modern web technologies and banking-grade security features.

## 📋 Overview

The International Payment Portal is a comprehensive financial application that enables secure international money transfers with enterprise-level security implementations. The system features a React frontend with a Node.js/Express backend, implementing industry-standard security measures for financial transactions.

## 🏗️ Architecture

```
International Portal/
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express API server
└── README.md          # Project documentation
```

## ✨ Features

### 🔐 Security Features (Banking-Grade)
- **Strong Authentication**: JWT-based authentication with secure sessions
- **Two-Factor Authentication (2FA)**: TOTP implementation with email(Needs to be implemented)
- **Password Security**: bcryptjs hashing with 12 salt rounds
- **Input Validation**: Comprehensive validation and sanitization
- **HTTPS/SSL**: Certificate-based secure communications
- **CSRF Protection**: Double-submit cookie pattern
- **XSS Prevention**: Content Security Policy and input filtering
- **SQL Injection Protection**: Parameterized queries and input sanitization
- **Rate Limiting**: Multiple-tier DDoS protection
- **Session Security**: 15-minute timeouts and hijacking prevention
- **Clickjacking Protection**: X-Frame-Options and CSP headers

### 💳 Payment Features
- **International Transfers**: SWIFT-code based payments
- **Account Management**: Secure account number validation
- **Transaction History**: Complete payment tracking
- **Payment Limits**: Configurable transaction restrictions
- **Real-time Validation**: Client and server-side validation

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface
- **Error Handling**: Comprehensive error management
- **Loading States**: Visual feedback for all operations

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
- npm 
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
# Server runs on http://localhost:3443
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

## 🔧 Configuration

### Database Setup
1. **Local MongoDB**: Install MongoDB locally or use Docker
2. **MongoDB Atlas**: Create a cloud database and update the connection string
3. **Collections**: The app will automatically create required collections

### Security Configuration
- **SSL Certificates**: Place in `backend/certs/` directory
- **Environment Variables**: Configure all required variables in `.env`
- **CORS Origins**: Update `FRONTEND_ORIGIN` for production domains
- **Rate Limits**: Adjust in `backend/app.js` as needed

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

### Utility
- `GET /health` - Health check endpoint

## 🛡️ Security Implementation Status

### ✅ Implemented
- [x] Password hashing & salting (bcryptjs)
- [x] Input validation & sanitization
- [x] HTTPS/SSL enforcement
- [x] CSRF protection
- [x] XSS prevention
- [x] SQL injection protection
- [x] Session hijacking prevention
- [x] Clickjacking protection
- [x] MITM attack prevention
- [x] DDoS protection
- [x] Two-factor authentication
- [x] Rate limiting
- [x] Security headers
- [x] Audit logging

### 📋 Security Compliance
- **Banking Standards**: 15-minute session timeouts
- **Industry Standards**: OWASP Top 10 protections
- **Data Protection**: Encrypted data in transit and at rest
- **Authentication**: Multi-factor authentication support

## 🐳 Docker Support

The application will include Docker support for easy deployment:

```bash
# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

### Security Testing
- Rate limiting tests
- Authentication flow tests
- Input validation tests
- CSRF protection tests

## 📦 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL certificates
- [ ] Set strong JWT secrets
- [ ] Configure MongoDB Atlas
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Test all security features

### Environment-Specific Configurations
- **Development**: HTTP, local MongoDB
- **Staging**: HTTPS, cloud MongoDB
- **Production**: HTTPS, MongoDB Atlas, monitoring

## 🔍 Monitoring & Logging

### Security Monitoring
- Failed login attempts
- Suspicious IP activity
- Rate limit violations
- Authentication events

### Application Logging
- Request/response logging
- Error tracking
- Performance monitoring
- Security event logging

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


## 🆘 Support & Troubleshooting

### Common Issues

**Connection Issues:**
- Check MongoDB connection string
- Verify network connectivity

**Authentication Issues:**
- Verify JWT secrets are set
- Check session configuration
- Validate environment variables

**SSL Issues:**
- Ensure certificates are properly generated
- Check certificate paths
- Verify SSL configuration

### Getting Help
- Review security documentation
- Contact the development team


## 👥 Team

- **Frontend**: Chandler Prins(ST10268042)
- **Backend**: Mud-dath-thir Daniels(ST10301862), Dhruv Rathod(ST10109298)

---

**📧 Contact**: For security issues, please contact the security team directly(Dhruv, Mud-dath-thir, Chandler).

**YouTube Link**: https://youtu.be/w_qrp7pYbeo
