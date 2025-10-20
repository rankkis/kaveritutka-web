# Kaveritutka Web App

A web application for parents to find playmates for their children (ages 0-6) at local playgrounds.

## Features

- Interactive map showing public playgrounds
- Check-in system for parents to schedule playground visits
- View other families' scheduled visits
- Filter by child age, interests, and scheduled time

## Technology Stack

- **Angular 19** - Frontend framework
- **TypeScript** - Programming language
- **Leaflet** - Interactive map library
- **Angular Material** - UI component library
- **RxJS** - Reactive programming
- **SCSS** - Styling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:4200`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run watch` - Build and watch for changes

## Project Structure

```
src/
├── app/
│   ├── features/
│   │   ├── map/              # Map component with playground markers
│   │   └── check-in-dialog/  # Check-in creation dialog
│   ├── shared/
│   │   ├── models/           # Data models
│   │   └── services/         # Business logic services
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/
└── styles.scss
```

## Future Enhancements

- User authentication
- Backend API integration
- Real-time updates using WebSockets
- Push notifications for nearby check-ins
- User profiles and favorites
- Weather information integration
- Photo sharing
- Chat functionality between parents

## License

MIT
