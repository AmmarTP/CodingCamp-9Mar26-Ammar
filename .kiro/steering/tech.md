# Technology Stack

## Core Technologies

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript (ES6+)**: No frameworks or external dependencies
- **Local Storage API**: Client-side data persistence

## Browser Compatibility

Target browsers with full feature support:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Architecture Pattern

**Component-Based Modular Design**: Each feature implemented as a self-contained module using the revealing module pattern:

```javascript
const ComponentName = (function() {
  // Private state and methods
  let privateState = {};
  
  function privateMethod() { /* ... */ }
  
  // Public interface
  return {
    init: function() { /* ... */ },
    publicMethod: function() { /* ... */ }
  };
})();
```

## File Structure

```
/
├── index.html          # Single HTML document
├── css/
│   └── styles.css      # Single stylesheet
├── js/
│   └── app.js          # Single JavaScript file
└── package.json        # Jest testing configuration
```

## Development Commands

```bash
# Install dependencies (Jest for testing)
npm install

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Code Style Guidelines

- Use ES6+ features (const/let, arrow functions, template literals)
- Implement error handling with try-catch blocks
- Cache DOM references during component initialization
- Use semantic HTML elements and proper ARIA attributes
- Follow mobile-first responsive design principles
- Maintain consistent 1rem/2rem spacing scale

## Performance Considerations

- Minimize DOM queries by caching references
- Use DocumentFragment for batched DOM updates
- Clear intervals to prevent memory leaks
- Debounce rapid user inputs when necessary
- Keep data structures simple (arrays, not complex objects)