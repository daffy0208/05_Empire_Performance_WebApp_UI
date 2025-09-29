# Empire Performance Coaching Web Application

> **Revolutionizing Youth Football Development in Scotland**

A comprehensive web platform that connects young footballers with elite coaching experiences through seamless booking, payment processing, and dashboard management across multiple locations in Scotland.

## 🏆 Overview

Empire Performance Coaching provides premium football training sessions for young athletes across Scotland. This web application serves as the central hub for:

- **Parents & Players**: Book sessions, manage schedules, and track progress
- **Coaches**: Manage availability, view schedules, and access player information
- **Directors**: Monitor operations, analyze performance metrics, and oversee business growth

### Key Features

- 🎯 **Multi-Step Booking System** - Streamlined session booking with location, coach, date, and payment selection
- 💳 **Secure Payment Processing** - Stripe integration for safe, PCI-compliant transactions
- 📊 **Role-Based Dashboards** - Tailored experiences for parents, coaches, and directors
- 🏟️ **Multi-Location Support** - Training facilities across Lochwinnoch, Airdrie, East Kilbride, and Glasgow South
- 🔐 **Robust Authentication** - Secure user management with role-based access control
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Supabase** account (for database and authentication)
- **Stripe** account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 05_Empire_Performance_WebApp_UI
   ```

2. **Install dependencies**
   ```bash
   cd empire_performance_coaching
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Environment Configuration](#environment-configuration))

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:4028
   - Backend API: http://localhost:8000 (if running backend)

## ⚙️ Environment Configuration

Create a `.env` file in the `empire_performance_coaching` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Application Configuration
VITE_APP_URL=http://localhost:4028
VITE_API_URL=http://localhost:8000

# Development Settings
NODE_ENV=development
```

### Getting Your Keys

**Supabase Setup:**
1. Visit [supabase.com](https://supabase.com) and create a project
2. Go to Settings → API to find your URL and anon key
3. Run the database migrations (see [Database Setup](#database-setup))

**Stripe Setup:**
1. Visit [stripe.com](https://stripe.com) and create an account
2. Go to Developers → API Keys for your publishable key
3. Use test keys for development

## 🗄️ Database Setup

The application uses Supabase PostgreSQL with the following core tables:

- `profiles` - User profiles and role management
- `locations` - Training facility information
- `coaches` - Coach profiles and availability
- `bookings` - Session bookings and scheduling
- `payments` - Payment records and invoicing

### Database Schema

Key database setup files are located in `docs/database/`:
- `payment_schema.sql` - Payment and billing tables
- Additional schema files for core functionality

### Running Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 🏗️ Project Structure

```
empire_performance_coaching/
├── src/
│   ├── features/           # Feature-based architecture
│   │   ├── auth/          # Authentication and user management
│   │   ├── booking/       # Multi-step booking system
│   │   ├── coaching/      # Public-facing coaching pages
│   │   └── dashboard/     # Role-based dashboards
│   ├── shared/            # Reusable components and utilities
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # External service integrations
│   │   └── utils/        # Helper functions
│   └── __tests__/        # Application tests
├── server/               # Express.js backend (optional)
├── docs/                # Project documentation
└── public/              # Static assets
```

### Architecture Highlights

- **Feature-Based Organization**: Code organized by business features rather than technical layers
- **Component Library**: Reusable UI components with consistent styling
- **Custom Hooks**: Abstracted business logic and data fetching
- **Type Safety**: Full TypeScript implementation for reliability

## 👥 User Roles & Features

### Parents/Players
- **Session Booking**: Multi-step booking flow with location, coach, and date selection
- **Dashboard**: View upcoming sessions, booking history, and invoices
- **Player Management**: Add multiple children and track their progress
- **Payment Management**: Secure payment processing and billing history

### Coaches
- **Schedule Management**: View today's and upcoming sessions
- **Player Information**: Access player details and session history
- **Availability Control**: Manage coaching availability and preferences
- **Performance Tracking**: Monitor coaching metrics and feedback

### Directors
- **Business Analytics**: Revenue tracking, booking patterns, and growth metrics
- **Coach Performance**: Monitor coach utilization and customer satisfaction
- **Operations Management**: Oversee multiple locations and staff
- **Customer Insights**: Analyze customer behavior and retention

## 💳 Payment Integration

### Stripe Integration

The application uses Stripe for secure payment processing:

- **Test Environment**: Use test card `4242 4242 4242 4242` for development
- **Payment Intents**: Server-side payment confirmation for security
- **Webhooks**: Real-time payment status updates
- **PCI Compliance**: No card data stored locally

### Payment Flow

1. User selects session and coach
2. Payment form with Stripe Elements
3. Client-side card validation
4. Server creates PaymentIntent
5. Client confirms payment
6. Booking confirmed and stored

### Testing Payments

Use these test card numbers in development:

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Declined: 4000 0000 0000 0002
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Component and function testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user journey testing

Key test files:
- `src/__tests__/` - Application integration tests
- `src/features/*/test/` - Feature-specific tests
- `src/shared/hooks/__tests__/` - Custom hook tests

## 🚀 Deployment

### Development Deployment

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

### Production Considerations

1. **Environment Variables**: Update all environment variables for production
2. **Database**: Ensure production database is properly configured
3. **Stripe**: Switch to live Stripe keys
4. **Domain**: Configure proper CORS and domain settings
5. **Security**: Enable all security headers and HTTPS

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or similar
- **Backend**: Railway, Render, or similar
- **Database**: Supabase (managed PostgreSQL)
- **Payments**: Stripe (integrated)

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Code Style

- **ESLint**: Enforced code quality rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Type safety and better developer experience
- **Conventional Commits**: Structured commit messages

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 API Documentation

### Authentication Endpoints

```
POST /auth/login      # User login
POST /auth/register   # User registration
POST /auth/logout     # User logout
GET  /auth/profile    # Get user profile
```

### Booking Endpoints

```
GET  /api/locations   # Get all locations
GET  /api/coaches     # Get available coaches
POST /api/bookings    # Create new booking
GET  /api/bookings    # Get user bookings
```

### Payment Endpoints

```
POST /api/payments/create-intent  # Create payment intent
POST /api/payments/confirm        # Confirm payment
GET  /api/payments/history        # Get payment history
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first styling framework
- **Framer Motion** - Smooth animations and transitions

### Backend & Services
- **Supabase** - Database, authentication, and real-time features
- **Stripe** - Payment processing and billing
- **Express.js** - Optional backend API server

### Development Tools
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Vitest** - Fast unit testing
- **TypeScript** - Static type checking

## 📞 Support

### Getting Help

- **Documentation**: Check this README and `/docs` folder
- **Issues**: Create GitHub issues for bugs or feature requests
- **Development**: Contact the development team

### Common Issues

**Import Path Errors**: Ensure relative paths are correct after restructuring
**Payment Issues**: Verify Stripe keys and test card details
**Database Connection**: Check Supabase credentials and network access
**Build Failures**: Clear `node_modules` and reinstall dependencies

## 📄 License

This project is proprietary software for Empire Performance Coaching. All rights reserved.

---

**Empire Performance Coaching** - Developing the next generation of football talent across Scotland.

For more information, visit our coaching locations in Lochwinnoch, Airdrie, East Kilbride, and Glasgow South.
