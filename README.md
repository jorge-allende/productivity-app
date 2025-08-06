# Productivity App

A modern productivity application featuring a Kanban board and calendar integration built with React, TypeScript, and Convex.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Start with Convex backend
npx convex dev
```

## 📁 Project Structure

```
productivity-app/
├── src/              # Application source code
├── convex/           # Convex backend functions
├── docs/             # Documentation
├── docker/           # Docker configuration
├── scripts/          # Utility scripts
├── public/           # Static assets
└── coverage/         # Test coverage reports
```

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

### Docker Development

```bash
# Start with Docker
make dev

# View logs
make logs

# Run tests in container
make test
```

## 📚 Documentation

- [Quick Start Guide](docs/QUICK_START.md)
- [Local Development Setup](docs/LOCAL_DEV_SETUP.md)
- [Convex Setup](docs/CONVEX_SETUP.md)
- [Docker Setup](docs/DOCKER_README.md)
- [CI Testing Guide](docs/CI_TESTING_GUIDE.md)
- [Product Requirements](docs/PRODUCT_REQUIREMENTS_DOCUMENT.md)

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Backend**: Convex (real-time database)
- **State**: Zustand (theme only), React Context
- **UI**: @dnd-kit, shadcn/ui components
- **Testing**: Jest, React Testing Library
- **Build**: Create React App, Docker

## 🔧 Configuration

1. Copy `.env.local.example` to `.env.local`
2. Add your Convex deployment URL
3. Configure Auth0 credentials

See [Environment Setup](docs/ENVIRONMENT_SETUP.md) for detailed configuration.

## 🐳 Docker Support

Full Docker support for development and production environments. See [Docker README](docs/DOCKER_README.md) for details.

## 📝 License

This project is private and proprietary.