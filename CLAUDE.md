# Kaveritutka Web App - Project Documentation

## Project Overview

Kaveritutka is a web application that helps parents find playmates for their children (ages 0-7) at local playgrounds in Lahti, Finland. Parents can see playground locations on an interactive map and create anonymous "playtimes" (leikkiajat) to let other families know when they'll be visiting.

## Tech Stack

- **Angular 19** - Frontend framework with standalone components
- **TypeScript 5.7** - Programming language with strict type checking
- **Leaflet 1.9** - Interactive map library with CartoDB Voyager tiles
- **Angular Material 19** - UI component library
- **RxJS 7.8** - Reactive programming
- **SCSS** - Styling with nested selectors

## Key Features

### 1. Interactive Map ([map.component.ts](src/app/features/map-view/map.component.ts))
- CartoDB Voyager map tiles for clean, modern appearance
- Centered on Kiveriönkatu 8, Lahti (60.9872, 25.6447)
- Zoom level 15 (~1km viewing range)
- 6 playground locations marked with custom green markers
- Animated markers (pulsing for ongoing events, glowing for upcoming)
- Click markers to view playground details and playtimes
- Sliding sidebar with playtime information (desktop)
- Mobile-friendly navigation to detail pages

### 2. Playtime System
Modern chip-based form with:
- **Date Selection**: Chips for "Tänään" (Today) or "Huomenna" (Tomorrow)
- **Time Selection**: Dropdown with "Nyt" (Now) or 15-minute intervals from 08:00-21:00
- **Duration Selection**: Chips for 0.5h, 1h, 1.5h, 2h
- **Age Selection**: Chip selector for ages 0-7 years
- **Gender Selection**: Optional icon-based chips (👦 Poika, 👧 Tyttö) with "Poista valinta" button
- **Interests**: Multi-select chips (Jalkapallo, Keinut, Liukumäet, etc.)
- **Multiple Participants**: Support for multiple children in one playtime
- **Additional Info**: Optional textarea for extra details
- **Anonymous by default**: Parent name is optional, defaults to "Anonyymi"

**Components:**
- [playtime-dialog.component.ts](src/app/features/playtime/playtime-dialog/playtime-dialog.component.ts) - Dialog for desktop
- [playtime-form-page.component.ts](src/app/features/playtime/playtime-form-page/playtime-form-page.component.ts) - Full-page form for mobile

### 3. Data Models
- **Playground** ([playground.model.ts](src/app/shared/models/playground.model.ts))
  - id, name, latitude, longitude, address, description, imageUrl

- **Playtime** ([playtime.model.ts](src/app/shared/models/playtime.model.ts))
  - id, playgroundId, parentName, scheduledTime, duration
  - participants: Participant[] (supports multiple children)
  - additionalInfo?: string
  - createdAt: Date

- **Participant**
  - childAge: number
  - childGender: 'boy' | 'girl' | null (optional)
  - interests: string[]

### 4. Services
- **PlaygroundService** ([playground.service.ts](src/app/shared/services/playground.service.ts)) - Mock data for 6 Lahti playgrounds
- **PlaytimeService** ([playtime.service.ts](src/app/shared/services/playtime.service.ts)) - Mock playtimes with reactive BehaviorSubject, time-based filtering
- **MapStateService** ([map-state.service.ts](src/app/core/services/map-state.service.ts)) - Manages map state (center, zoom, location detection)

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
│   ├── core/                                # Core module (singleton services, layout)
│   │   ├── layout/
│   │   │   └── header/                      # App header component
│   │   │       ├── header.component.ts
│   │   │       ├── header.component.html
│   │   │       └── header.component.scss
│   │   └── services/                        # Core singleton services
│   │       └── map-state.service.ts         # Map state management
│   │
│   ├── features/                            # Feature modules (isolated, no cross-imports)
│   │   ├── map-view/                        # Map feature
│   │   │   ├── map.component.ts
│   │   │   ├── map.component.html
│   │   │   └── map.component.scss
│   │   │
│   │   ├── playtime/                        # Playtime feature
│   │   │   ├── playtime-dialog/             # Dialog for desktop
│   │   │   │   ├── playtime-dialog.component.ts
│   │   │   │   ├── playtime-dialog.component.html
│   │   │   │   └── playtime-dialog.component.scss
│   │   │   ├── playtime-form-page/          # Full page for mobile
│   │   │   │   ├── playtime-form-page.component.ts
│   │   │   │   ├── playtime-form-page.component.html
│   │   │   │   └── playtime-form-page.component.scss
│   │   │   └── playtime-form/               # Shared form component
│   │   │       ├── playtime-form.component.ts
│   │   │       ├── playtime-form.component.html
│   │   │       └── playtime-form.component.scss
│   │   │
│   │   └── playground/                      # Playground feature
│   │       └── playground-detail-page/      # Detail page
│   │           ├── playground-detail-page.component.ts
│   │           ├── playground-detail-page.component.html
│   │           └── playground-detail-page.component.scss
│   │
│   ├── shared/                              # Shared across features
│   │   ├── models/                          # TypeScript interfaces
│   │   │   ├── playground.model.ts
│   │   │   └── playtime.model.ts
│   │   ├── services/                        # Business logic
│   │   │   ├── playground.service.ts
│   │   │   └── playtime.service.ts
│   │   ├── utils/
│   │   │   └── generate-time-slots.helper.ts
│   │   └── constants/
│   │       └── playtime.constants.ts
│   │
│   ├── app.component.ts                     # Root component
│   ├── app.config.ts                        # App configuration
│   └── app.routes.ts                        # Routing configuration
│
├── environments/                             # Environment configs
├── styles.scss                               # Global styles
└── index.html                                # Entry HTML
```

## Architecture Principles

### Core Module
- **Purpose**: App-wide singleton services and layout components
- **Location**: `src/app/core/`
- **Can import**: `shared/`
- **Cannot import**: `features/`
- **Examples**: MapStateService, HeaderComponent

### Feature Modules
- **Purpose**: Self-contained business features
- **Location**: `src/app/features/`
- **Structure**: Components are directly in feature folders (no intermediate `components/` folder)
- **Can import**: `shared/`, `core/`
- **Cannot import**: Other features (❌ no cross-feature imports)
- **Communication**: Features communicate via shared services
- **Examples**: map-view, playtime, playground

### Shared Module
- **Purpose**: Reusable code across features
- **Location**: `src/app/shared/`
- **Can import**: Nothing (no dependencies on core or features)
- **Contains**: Models, services, utilities, constants, reusable components
- **Examples**: Playground model, PlaytimeService

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

### "Playtime" Terminology
- Changed from "check-in" to "playtime" (leikkiaika) for better UX
- More natural language for parents
- Clearer intent: scheduling playmate meetups, not just arrival tracking

### Anonymous by Default
- No user authentication required
- Playtimes use "Anonyymi" as default parent name
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

### Responsive Design
- **Desktop**: Sidebar for playtimes, dialogs for forms
- **Mobile** (≤768px): Full-page navigation, dedicated form pages
- Preserves map state across navigation

### Map Styling
- CartoDB Voyager tiles (free up to 75k views/month)
- Clean, modern aesthetic
- Good balance of detail and minimalism
- Better than default OpenStreetMap for app UX
- Animated markers indicate event status:
  - **Pulsing green**: Ongoing playtime (happening now)
  - **Glowing light green**: Upcoming playtime (within 2 hours)
  - **Standard green**: Future playtimes or no events

## Known Issues

### Styling Challenges
Material Design form fields with outline appearance have complex layering:
- Background color requires targeting `.mdc-notched-outline`
- Text visibility needs `z-index: 1` and `position: relative`
- Avoid `!important` flags where possible
- Dialog scrollbars can be removed with `overflow: visible`

### Build Warnings
- Some component SCSS files exceed 4kB budget (minor)
- Leaflet is CommonJS module (expected, not ESM)

## Future Enhancements

### Backend Integration
- Replace mock services with real API calls
- User authentication (optional profiles)
- Real-time updates via WebSockets
- Push notifications for nearby playtimes

### Features
- Weather integration
- Photo sharing
- Direct messaging between parents
- Favorite playgrounds
- Playtime history
- Playground ratings/reviews
- Filtering by child age/interests
- "Notify me" feature for specific playgrounds

### Technical
- Complete feature module isolation (Phase 3 of refactoring)
- PWA support for offline capability
- Geolocation for "nearest playground"
- i18n support (Swedish, English)
- Analytics integration
- Error tracking (Sentry)
- Performance monitoring

## Contributing

This is a personal project for the Lahti area. If you want to adapt it for your city:

1. Update playground locations in [playground.service.ts](src/app/shared/services/playground.service.ts)
2. Change default map center in [map.component.ts](src/app/features/map-view/map.component.ts)
3. Adjust zoom level as needed for your area
4. Update interests list for your locale in [playtime-dialog.component.ts](src/app/features/playtime/playtime-dialog/playtime-dialog.component.ts)

## License

MIT License - Feel free to use and modify for your own city!

## Acknowledgments

- Built with Angular 19 and standalone components
- Map tiles by CARTO (CartoDB Voyager)
- Inspired by the need for parents to connect in local communities
- Similar project structure to [milloin-web](https://milloin.xyz)

## Recent Changes

### 2025-01-XX: Major Refactoring - Complete Feature Isolation

#### Phase 1: Terminology Improvement
1. **Renamed "check-in" → "playtime" (leikkiaika)** across entire codebase
   - Better UX: More natural language for parents
   - All models, services, components, routes, and UI text updated
   - Clearer intent: Scheduling playmate meetups, not just arrival tracking

#### Phase 2: Core Module Creation
1. **Created `core/` module** for app-wide singleton services and layout
   - Extracted `HeaderComponent` from `AppComponent`
   - Moved `MapStateService` from `shared/` to `core/services/`
   - Established clear architectural boundaries

#### Phase 3: Complete Feature Isolation ✅
1. **Reorganized features into self-contained modules**
   - `map` → `map-view/`
   - `playtime-dialog` + `playtime-form-page` → `playtime/`
   - `playground-detail` → `playground/`
2. **Each feature is now isolated**
   - No cross-feature imports (features cannot import from other features)
   - Features only import from `core/` and `shared/`
   - Prevents circular dependencies
   - Enables independent development and testing
3. **Flattened feature structure**
   - Removed intermediate `components/` folders
   - Component folders now directly under feature folders
   - Cleaner, more direct paths (e.g., `features/map-view/map.component.ts`)
4. **Updated all import paths** to reflect new structure
5. **Routes updated** to use new component paths

#### Benefits Achieved
- ✅ **No circular dependencies**: Features are completely isolated
- ✅ **Better maintainability**: Clear separation of concerns
- ✅ **Scalability**: Easy to add new features without pollution
- ✅ **Build succeeds**: No errors, only minor budget warnings for SCSS files
- ✅ **Industry-standard architecture**: Core/Features/Shared pattern
