# PDS Maker - Open Source Philippine Government PDS Platform

A comprehensive, API-first platform for creating, validating, and processing Philippine Civil Service Commission (CSC) Personal Data Sheets (PDS) with automatic formatting correction.

## 🚀 Features

- **API-First Architecture** - RESTful APIs for all functionality
- **Auto-Fix Engine** - Automatically corrects common PDS formatting errors
- **Multi-Format Support** - Import/export Excel, Word, and PDF formats
- **Real-Time Validation** - Instant feedback based on CSC requirements
- **Integration Ready** - Easy to integrate with existing HR systems
- **Open Source** - MIT licensed for maximum adoption

## 🏗️ Architecture

```
pds-maker/
├── api/                 # Core API services
├── web/                 # Web application
├── mobile-sdk/          # React Native/Flutter SDK
├── docs/               # API documentation
├── examples/           # Integration examples
├── tests/              # Test suites
└── deployment/         # Docker/K8s configs
```

## 🛠️ Technology Stack

- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Redis caching
- **Frontend**: React.js with TypeScript
- **API Documentation**: OpenAPI/Swagger
- **Authentication**: JWT with OAuth2 support
- **Containerization**: Docker with Kubernetes deployment

## 🎯 Problem Solved

Philippine government employees often face repeated PDS rejections due to formatting errors, causing frustration and wasted resources. This platform automates the complex CSC formatting requirements and provides instant validation.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/pds-maker.git
cd pds-maker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

## 📚 Documentation

### For Users
- [User Manual](docs/USER_MANUAL.md) - Complete guide for using PDS Maker
- [Common Errors and Fixes](docs/COMMON_ERRORS.md) - Solutions for formatting issues
- [FAQ](docs/FAQ.md) - Frequently asked questions

### For Developers
- [API Integration Guide](docs/API_INTEGRATION.md) - Complete API documentation with examples
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Architecture and development setup
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project

### API Reference
- [Swagger Documentation](http://localhost:3001/api-docs) - Interactive API documentation (when running locally)
- [API Examples](examples/) - Code examples in multiple languages

## 🔧 Development

The platform is built with an API-first approach, making it easy to:
- Build web applications
- Create mobile apps
- Integrate with existing systems
- Develop custom solutions

## 📞 Support

- [GitHub Issues](https://github.com/your-org/pds-maker/issues)
- [Documentation](docs/)
- [Community Discord](https://discord.gg/pds-maker)

---

Built with ❤️ for the Philippine government and its employees.