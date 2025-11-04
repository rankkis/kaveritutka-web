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
- **Supabase** - Authentication provider (Google OAuth with PKCE flow)
- **Backend API** - https://kaveritutka-server.vercel.app (Node.js/Express)

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
  - user_id?: string (optional, set for authenticated users)

- **Participant**
  - childAge: number
  - childGender: 'boy' | 'girl' | null (optional)
  - interests: string[]

- **User** ([user.model.ts](src/app/shared/models/user.model.ts))
  - id, email, displayName, createdAt

- **FriendRequest** ([friend-request.model.ts](src/app/shared/models/friend-request.model.ts))
  - id, user_id, parentName, childName, childAge, description
  - latitude, longitude, city, interests[]
  - status: 'active' | 'closed'

### 4. Services

**Core Services:**
- **UserService** ([user.service.ts](src/app/core/services/user.service.ts)) - User profile management (GET/PUT /users/me)
- **SupabaseService** ([supabase.service.ts](src/app/shared/services/supabase.service.ts)) - Authentication with Google OAuth (PKCE flow)
- **MapStateService** ([map-state.service.ts](src/app/core/services/map-state.service.ts)) - Map state management

**Shared Services:**
- **PlaygroundService** ([playground.service.ts](src/app/shared/services/playground.service.ts)) - Playground data (GET /playgrounds)
- **PlaytimeService** ([playtime.service.ts](src/app/shared/services/playtime.service.ts)) - Playtime management (GET/POST/DELETE /playtimes)
- **FriendRequestService** ([friend-request.service.ts](src/app/shared/services/friend-request.service.ts)) - Friend request management (GET/POST/PATCH/DELETE /friend-requests)

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
│   │   ├── services/                        # Core singleton services
│   │   │   └── map-state.service.ts         # Map state management
│   │   └── auth/                            # Authentication (app-wide)
│   │       ├── auth-callback/               # OAuth callback handler
│   │       ├── auth-provider-dialog/        # Login dialog
│   │       └── welcome/                     # Welcome page for new users
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
- **Purpose**: App-wide singleton services, layout components, and authentication
- **Location**: `src/app/core/`
- **Can import**: `shared/`
- **Cannot import**: `features/`
- **Examples**: MapStateService, HeaderComponent, Auth components (login, callback, welcome)

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

## Angular Component Code Style

### 1. Dependency Injection with `inject()`
Always use Angular's `inject()` function instead of constructor-based injection for cleaner, more functional code.

```typescript
// ✅ Good: Modern inject() function
import { inject } from '@angular/core';

export class MapComponent {
  private readonly playgroundService = inject(PlaygroundService);
  private readonly router = inject(Router);
}

// ❌ Bad: Constructor injection
export class MapComponent {
  constructor(
    private playgroundService: PlaygroundService,
    private router: Router
  ) {}
}
```

### 2. Reactive Data with Async Pipe
Avoid manual subscriptions. Keep data streams reactive and use the `async` pipe in templates.

```typescript
// ✅ Good: Observable exposed directly
export class MapComponent {
  private readonly playtimeService = inject(PlaytimeService);

  playtimes$ = this.playtimeService.getAllPlaytimes();
}

// Template: <div *ngFor="let playtime of playtimes$ | async">

// ❌ Bad: Manual subscription
export class MapComponent {
  playtimes: Playtime[] = [];

  ngOnInit() {
    this.playtimeService.getAllPlaytimes().subscribe(
      playtimes => this.playtimes = playtimes
    );
  }
}
```

### 3. ViewModel Pattern (vm$)
Use the ViewModel pattern for complex state management. All data for the template comes from a single `vm$` observable.

**Reference**: [VM Pattern in Angular](https://www.angularspace.com/vm-pattern-in-angular/)

```typescript
// ✅ Good: Single vm$ observable
export class MapComponent {
  private readonly playgroundService = inject(PlaygroundService);
  private readonly playtimeService = inject(PlaytimeService);

  private selectedPlaygroundId$ = new BehaviorSubject<string | null>(null);

  vm$ = combineLatest({
    playgrounds: this.playgroundService.getAll(),
    playtimes: this.playtimeService.getAllPlaytimes(),
    selectedId: this.selectedPlaygroundId$
  }).pipe(
    map(({ playgrounds, playtimes, selectedId }) => ({
      playgrounds,
      playtimes,
      selectedPlayground: playgrounds.find(p => p.id === selectedId)
    }))
  );

  // Public methods update BehaviorSubjects, not the vm directly
  selectPlayground(id: string): void {
    this.selectedPlaygroundId$.next(id);
  }
}
```

```html
<!-- Template: Single async pipe at the root -->
<ng-container *ngIf="vm$ | async as vm">
  <div *ngFor="let playground of vm.playgrounds">
    {{ playground.name }}
  </div>
  <div *ngIf="vm.selectedPlayground">
    {{ vm.selectedPlayground.description }}
  </div>
</ng-container>
```

**Key principles:**
- Only **one public property** for template: `vm$`
- Template starts with: `<ng-container *ngIf="vm$ | async as vm">`
- Build `vm$` using `combineLatest()` from RxJS
- Public methods don't mutate `vm$` directly—they update source observables/subjects
- All reactive state flows through `vm$`

### 4. Component Structure & Organization
Components must follow a consistent structure with alphabetical ordering within each section.

**Order of sections:**
1. **Properties** (private subjects, signals, etc.)
2. **ViewModel builder** (`vm$` definition)
3. **Public methods** (called from template)
4. **Lifecycle methods** (`ngOnInit`, `ngOnDestroy`, etc.)
5. **Private methods** (internal helpers)

**Alphabetical ordering** applies within each section.

```typescript
export class PlaytimeDialogComponent {
  // 1. PROPERTIES (alphabetical)
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private selectedDate$ = new BehaviorSubject<Date>(new Date());
  private selectedTime$ = new BehaviorSubject<string>('now');

  // 2. VIEWMODEL BUILDER
  vm$ = combineLatest({
    date: this.selectedDate$,
    time: this.selectedTime$,
    timeSlots: this.generateTimeSlots()
  });

  // 3. PUBLIC METHODS (alphabetical)
  selectDate(date: Date): void {
    this.selectedDate$.next(date);
  }

  selectTime(time: string): void {
    this.selectedTime$.next(time);
  }

  submitForm(): void {
    // Form submission logic
  }

  // 4. LIFECYCLE METHODS
  ngOnInit(): void {
    // Initialization
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  // 5. PRIVATE METHODS (alphabetical)
  // (Avoid when possible—use helpers instead)
}
```

### 5. Pure Helper Functions over Private Methods
Extract complex logic into **pure helper functions** in separate files instead of private methods. These helpers should:
- Be **pure functions** (same input → same output, no side effects)
- Live in `src/app/shared/utils/` or feature-specific `helpers/` folders
- Have **unit tests**

```typescript
// ✅ Good: Pure helper function (testable)
// src/app/shared/utils/time-helpers.ts
export function isPlaytimeOngoing(playtime: Playtime, now: Date): boolean {
  const endTime = new Date(playtime.scheduledTime.getTime() + playtime.duration * 60000);
  return now >= playtime.scheduledTime && now <= endTime;
}

// Component uses the helper
import { isPlaytimeOngoing } from '@shared/utils/time-helpers';

export class MapComponent {
  vm$ = combineLatest({
    playtimes: this.playtimeService.getAllPlaytimes(),
    now: interval(1000).pipe(map(() => new Date()))
  }).pipe(
    map(({ playtimes, now }) => ({
      ongoingPlaytimes: playtimes.filter(p => isPlaytimeOngoing(p, now))
    }))
  );
}

// ❌ Bad: Private method in component (harder to test)
export class MapComponent {
  private isPlaytimeOngoing(playtime: Playtime): boolean {
    const now = new Date();
    const endTime = new Date(playtime.scheduledTime.getTime() + playtime.duration * 60000);
    return now >= playtime.scheduledTime && now <= endTime;
  }
}
```

**Benefits:**
- ✅ Easier to test (pure functions)
- ✅ Reusable across components
- ✅ Components stay focused on orchestration
- ✅ Clear separation of concerns

### Summary Checklist
- [ ] Use `inject()` instead of constructor injection
- [ ] Expose observables with `async` pipe (avoid manual subscriptions)
- [ ] Use `vm$` pattern with `combineLatest()` for complex state
- [ ] Template starts with `<ng-container *ngIf="vm$ | async as vm">`
- [ ] Follow component structure: Properties → vm$ → Public → Lifecycle → Private
- [ ] Use alphabetical ordering within each section
- [ ] Extract logic to pure helper functions with unit tests

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

### Accessibility
- **Use semantic navigation**: Always use `<a>` tags with `[routerLink]` for navigation instead of click handlers
  - ✅ Good: `<a [routerLink]="['/path']">Link</a>`
  - ❌ Bad: `<div (click)="navigate()">Link</div>`
- **Benefits**: Screen reader support, keyboard navigation (Tab/Enter), right-click context menu, browser features
- **Add aria-labels**: Include descriptive `aria-label` attributes for screen readers when link text isn't self-explanatory
- **Focus visible styles**: Use `:focus-visible` pseudo-class for keyboard focus indicators
- **Remove text decoration**: Add `text-decoration: none` to styled anchor tags to maintain design consistency

## Backend API Integration

### Authentication
- **Provider**: Supabase with Google OAuth
- **Flow**: PKCE (Proof Key for Code Exchange) for enhanced security
- **Token Management**: Automatic token refresh via Supabase SDK
- **Session Storage**: Persisted in localStorage
- **HTTP Interceptor**: Automatically adds Bearer token to API requests

### API Endpoints

**Base URL**: `https://kaveritutka-server.vercel.app`

**Authentication** (via Supabase):
- Google OAuth login redirects to `/auth/callback`
- Access tokens are JWT tokens from Supabase
- Tokens automatically added to requests via [auth.interceptor.ts](src/app/core/interceptors/auth.interceptor.ts)

**User Management**:
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile (displayName)

**Playgrounds** (Public):
- `GET /playgrounds` - Get all playgrounds
- `GET /playgrounds/:id` - Get playground by ID

**Playtimes** (Optional Auth):
- `GET /playtimes` - Get all playtimes (public)
- `POST /playtimes` - Create playtime (optional auth, sets user_id if authenticated)
- `GET /playtimes/my` - Get user's playtimes (requires auth)
- `GET /playtimes/playground/:playgroundId` - Get playtimes for specific playground
- `DELETE /playtimes/:id` - Delete playtime (requires auth, owner only)

**Friend Requests** (Mixed Auth):
- `GET /friend-requests?latitude=X&longitude=Y&radius=Z` - Get requests by location (public)
- `POST /friend-requests` - Create request (requires auth)
- `GET /friend-requests/my` - Get user's requests (requires auth)
- `PATCH /friend-requests/:id` - Update request (requires auth, owner only)
- `DELETE /friend-requests/:id` - Delete request (requires auth, owner only)
- `POST /friend-requests/:id/close` - Close request (requires auth, owner only)
- `POST /friend-requests/:id/contact` - Send contact message (requires auth)
- `POST /friend-requests/:id/propose-playtime` - Propose playtime (requires auth)

### HTTP Interceptors
1. **AuthInterceptor** - Adds Supabase JWT token to all requests to backend API
2. **HttpErrorInterceptor** - Centralized error handling and user-friendly error messages

### Error Handling
- All API errors are caught and logged
- User-friendly Finnish error messages displayed via Material snackbars
- Automatic retry logic for token refresh failures
- Graceful degradation when services are unavailable

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

### Features
- Real-time updates via WebSockets
- Push notifications for nearby playtimes
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
