# SRPS Donation Management System

A comprehensive donation management platform built with Laravel and React (Inertia.js) for managing donations, transactions, and administrative functions.

## Features

### 🏠 Main Navigation
- **Dashboard** - Overview and analytics
- **Transactions** - Payment processing and management
- **Support** - Customer service and help desk

### 📊 Reports
- **Payment History** - Track all successful payments
- **Refund History** - Monitor refund requests and processing
- **Settlement History** - Settlement tracking and reporting

### ⚙️ System Management

#### Settings
- **General Settings** - Core application configuration
- **Form Settings** - Donation form customization
- **Payment Settings** - Payment gateway configuration
- **Email Settings** - Email templates and SMTP configuration

#### Master Data
- **Currencies** - Supported currency management
- **Countries** - Geographic country settings
- **States** - State/region configuration
- **Gateways** - Payment gateway integration

#### Frontend Management
- **Themes** - UI theme customization
- **Widgets** - Dashboard widget configuration
- **Pages** - Static page management

#### Administration
- **Roles** - User role management
- **Permissions** - Access control configuration
- **Users** - User account management

### 🛠️ Developer Tools
- **Database Backup** - Automated backup management
- **Cache** - Application cache management
- **Error Logs** - System error monitoring
- **Activity Logs** - User activity tracking

## Technology Stack

- **Backend**: Laravel 11
- **Frontend**: React with Inertia.js
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Testing**: Pest PHP
- **Database**: SQLite (configurable)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amitpriyadarshidev/srps-donation.git
   cd srps-donation
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database Setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Build assets**
   ```bash
   npm run build
   ```

## Development

### Start Development Server
```bash
# Backend
php artisan serve

# Frontend (in another terminal)
npm run dev
```

### Running Tests
```bash
# PHP tests
php artisan test

# Or with Pest
./vendor/bin/pest
```

### Code Quality
```bash
# PHP CS Fixer
composer run-script cs-fix

# TypeScript checking
npm run type-check
```

## Project Structure

```
├── app/
│   ├── Http/Controllers/     # Laravel controllers
│   ├── Models/              # Eloquent models
│   └── Traits/              # Reusable traits
├── resources/
│   ├── js/
│   │   ├── components/      # React components
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Inertia pages
│   │   └── types/           # TypeScript definitions
│   └── css/                 # Stylesheets
├── routes/
│   ├── web.php             # Web routes
│   ├── auth.php            # Authentication routes
│   └── settings.php        # Settings routes
└── database/
    ├── migrations/         # Database migrations
    └── seeders/           # Database seeders
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please use the built-in support system or contact the development team.

---

**Last Updated**: September 21, 2025
