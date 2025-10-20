# Kaveritutka Web App - Project Documentation

## Project Overview

Kaveritutka is a web application that helps parents find playmates for their children (ages 0-7) at local playgrounds in Lahti, Finland. Parents can see playground locations on an interactive map and create anonymous check-ins to let other families know when they'll be visiting.

## Tech Stack

- **Angular 19** - Frontend framework with standalone components
- **TypeScript 5.7** - Programming language with strict type checking
- **Leaflet 1.9** - Interactive map library with CartoDB Voyager tiles
- **Angular Material 19** - UI component library
- **RxJS 7.8** - Reactive programming
- **SCSS** - Styling with nested selectors

## Key Features

### 1. Interactive Map ([map.component.ts](src/app/features/map/map.component.ts))
- CartoDB Voyager map tiles for clean, modern appearance
- Centered on Kiveriönkatu 8, Lahti (60.9872, 25.6447)
- Zoom level 15 (~1km viewing range)
- 6 playground locations marked with custom green markers
- Click markers to view playground details and check-ins
- Sliding sidebar with check-in information

### 2. Check-in System ([check-in-dialog.component.ts](src/app/features/check-in-dialog/check-in-dialog.component.ts))
Modern chip-based form with:
- **Date Selection**: Chips for "Tänään" (Today) or "Huomenna" (Tomorrow)
- **Time Selection**: Dropdown with "Nyt" (Now) or 15-minute intervals from 08:00-21:00
- **Age Selection**: Chip selector for ages 0-7 years
- **Gender Selection**: Optional icon-based chips (👦 Poika, 👧 Tyttö) with "Poista valinta" button
- **Interests**: Multi-select chips (Jalkapallo, Keinut, Liukumäet, etc.)
- **Additional Info**: Optional textarea for extra details
- Anonymous check-ins (no parent name required)

### 3. Data Models
- **Playground** ([playground.model.ts](src/app/shared/models/playground.model.ts))
  - id, name, latitude, longitude, address, description
- **CheckIn** ([check-in.model.ts](src/app/shared/models/check-in.model.ts))
  - id, playgroundId, parentName (anonymous), scheduledTime, childAge
  - childGender: 'boy' | 'girl' | null (optional)
  - interests: string[]
  - additionalInfo?: string

### 4. Services
- **PlaygroundService** - Mock data for 6 Lahti playgrounds
- **CheckInService** - Mock check-ins with reactive BehaviorSubject

## Playgrounds in Lahti

1. **Kariniemen leikkipuisto** - Kariniementie (by the lake)
2. **Kiveriön leikkipaikka** - Kiveriönkatu (closest to default address)
3. **Laune leikkipuisto** - Launeenkatu
4. **Myllypohjan leikkipaikka** - Myllypohja
5. **Möysän leikkipuisto** - Möysäntie
6. **Jalkarannantien leikkipaikka** - Jalkarannan tie (harbor area)

## Project Structure

```
src/
├── app/
│   ├── features/
│   │   ├── map/                    # Map view with sidebar
│   │   │   ├── map.component.ts
│   │   │   ├── map.component.html
│   │   │   └── map.component.scss
│   │   └── check-in-dialog/        # Check-in creation dialog
│   │       ├── check-in-dialog.component.ts
│   │       ├── check-in-dialog.component.html
│   │       └── check-in-dialog.component.scss
│   ├── shared/
│   │   ├── models/                 # TypeScript interfaces
│   │   │   ├── playground.model.ts
│   │   │   └── check-in.model.ts
│   │   └── services/               # Business logic
│   │       ├── playground.service.ts
│   │       └── check-in.service.ts
│   ├── app.component.ts            # Root component
│   ├── app.config.ts               # App configuration
│   └── app.routes.ts               # Routing configuration
├── environments/                    # Environment configs
├── styles.scss                      # Global styles
└── index.html                       # Entry HTML
```

## Development

### Setup
```bash
npm install
npm start
```

Application runs on http://localhost:4200

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run watch` - Build with file watching

## Design Decisions

### Finnish-First
- All UI text in Finnish
- Date/time formats use Finnish locale (fi-FI)
- Comments in code can be English for developer clarity

### Anonymous by Default
- No user authentication required
- Check-ins use "Anonyymi" as parent name
- Focus on quick, easy participation

### Chip-Based UI
- Faster than typing
- Mobile-friendly touch targets
- Clear visual feedback for selections
- Modern, clean appearance

### Optional Gender
- Gender selection is nullable by default
- "Poista valinta" button to clear selection
- Displays as "lapsi" when null
- More inclusive approach

### Map Styling
- CartoDB Voyager tiles (free up to 75k views/month)
- Clean, modern aesthetic
- Good balance of detail and minimalism
- Better than default OpenStreetMap for app UX

## Known Issues

### Styling Challenges
Material Design form fields with outline appearance have complex layering:
- Background color requires targeting `.mdc-notched-outline`
- Text visibility needs `z-index: 1` and `position: relative`
- Avoid `!important` flags where possible
- Dialog scrollbars can be removed with `overflow: visible`

## Future Enhancements

### Backend Integration
- Replace mock services with real API calls
- User authentication (optional profiles)
- Real-time updates via WebSockets
- Push notifications for nearby check-ins

### Features
- Weather integration
- Photo sharing
- Direct messaging between parents
- Favorite playgrounds
- Check-in history
- Playground ratings/reviews
- Filtering by child age/interests
- "Notify me" feature for specific playgrounds

### Technical
- PWA support for offline capability
- Geolocation for "nearest playground"
- i18n support (Swedish, English)
- Analytics integration
- Error tracking (Sentry)
- Performance monitoring

## Contributing

This is a personal project for the Lahti area. If you want to adapt it for your city:

1. Update playground locations in [playground.service.ts](src/app/shared/services/playground.service.ts)
2. Change default map center in [map.component.ts](src/app/features/map/map.component.ts)
3. Adjust zoom level as needed for your area
4. Update interests list for your locale in [check-in-dialog.component.ts](src/app/features/check-in-dialog/check-in-dialog.component.ts)

## License

MIT License - Feel free to use and modify for your own city!

## Acknowledgments

- Built with Angular 19 and standalone components
- Map tiles by CARTO (CartoDB Voyager)
- Inspired by the need for parents to connect in local communities
- Similar project structure to [milloin-web](https://milloin.xyz)
