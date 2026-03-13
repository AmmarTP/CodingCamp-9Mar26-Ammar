# Project Structure

## Directory Organization

```
productivity-dashboard/
├── index.html                    # Main HTML document
├── package.json                  # Jest configuration and dependencies
├── css/
│   └── styles.css               # Single stylesheet with CSS Grid layout
├── js/
│   └── app.js                   # All JavaScript components in one file
├── __tests__/                   # Jest test files
│   ├── components.test.js       # Component unit tests
│   └── performance.test.js      # Performance validation tests
├── .kiro/                       # Kiro configuration
│   ├── specs/                   # Feature specifications
│   │   └── productivity-dashboard/
│   │       ├── requirements.md  # Requirements document
│   │       ├── design.md        # Technical design document
│   │       └── tasks.md         # Implementation tasks
│   └── steering/                # Project guidance files
│       ├── product.md           # Product overview
│       ├── tech.md              # Technology stack
│       └── structure.md         # This file
└── test-*.html                  # Manual testing files
```

## Component Architecture

All components are defined in `js/app.js` using the revealing module pattern:

- **GreetingComponent**: Time, date, and greeting display
- **TimerComponent**: 25-minute focus timer functionality  
- **TodoComponent**: Task management with CRUD operations
- **QuickLinksComponent**: Bookmark management
- **SettingsComponent**: Dark mode and preferences
- **StorageManager**: Local Storage availability checking

## CSS Organization

Single stylesheet (`css/styles.css`) organized by:

1. **CSS Custom Properties**: Theme variables for colors and spacing
2. **Reset and Base Styles**: Normalize and typography
3. **Layout Components**: Grid and container styles
4. **Component Styles**: Individual feature styling
5. **Responsive Breakpoints**: Mobile-first media queries
6. **Utility Classes**: Accessibility and helper classes

## Data Storage

- **Tasks**: Stored in Local Storage under key `productivity-dashboard-tasks`
- **Links**: Stored in Local Storage under key `productivity-dashboard-links`
- **Settings**: Individual keys for dark mode and preferences
- **Format**: JSON arrays with objects containing id, text, timestamps

## Testing Structure

- **Unit Tests**: Component-specific functionality testing
- **Property-Based Tests**: Universal behavior validation using fast-check
- **Manual Tests**: Browser compatibility and visual validation
- **Integration Tests**: Cross-component interaction testing

## File Naming Conventions

- Use kebab-case for HTML/CSS files: `test-accessibility.html`
- Use camelCase for JavaScript identifiers: `updateGreeting()`
- Use SCREAMING_SNAKE_CASE for constants: `STORAGE_KEY`
- Use descriptive names for test files: `test-error-handling.html`

## Development Workflow

1. **Specifications**: Requirements and design documents in `.kiro/specs/`
2. **Implementation**: Single-file approach for simplicity
3. **Testing**: Jest for automated tests, manual HTML files for browser testing
4. **Documentation**: Inline comments and separate markdown files