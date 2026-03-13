# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a single-page web application built with vanilla JavaScript, HTML, and CSS. It provides four core productivity features: a time-based greeting display, a 25-minute focus timer, a to-do list manager, and a quick links organizer. All data persists to browser Local Storage, enabling a stateful experience across sessions without requiring a backend server.

The application follows a component-based architecture where each feature (greeting, timer, to-do list, quick links) is implemented as a self-contained module with its own initialization, rendering, and event handling logic. The design prioritizes simplicity, maintainability, and performance while adhering to the constraint of using only vanilla JavaScript without frameworks or libraries.

## Architecture

### High-Level Structure

The application consists of three files:
- `index.html` - Single HTML document containing the semantic structure
- `css/styles.css` - Single stylesheet for all visual presentation
- `js/app.js` - Single JavaScript file containing all application logic

### Component Architecture

The JavaScript architecture follows a modular pattern with four primary components:

```
App
├── GreetingComponent
│   ├── updateTime()
│   ├── updateGreeting()
│   └── init()
├── TimerComponent
│   ├── start()
│   ├── stop()
│   ├── reset()
│   ├── tick()
│   └── init()
├── TodoComponent
│   ├── addTask()
│   ├── toggleTask()
│   ├── editTask()
│   ├── deleteTask()
│   ├── saveToStorage()
│   ├── loadFromStorage()
│   └── init()
└── QuickLinksComponent
    ├── addLink()
    ├── deleteLink()
    ├── saveToStorage()
    ├── loadFromStorage()
    └── init()
```

Each component is implemented as an object literal or module pattern with:
- State management (internal data structures)
- DOM manipulation methods (rendering)
- Event handlers (user interactions)
- Storage operations (persistence)
- Initialization method (setup and load)

### Execution Flow

1. **Page Load**: DOMContentLoaded event triggers app initialization
2. **Component Initialization**: Each component initializes in sequence:
   - Greeting: Sets up time/date display and starts update interval
   - Timer: Initializes UI with 25:00 display
   - Todo: Loads tasks from Local Storage and renders
   - Quick Links: Loads links from Local Storage and renders
3. **Runtime**: Components respond to user interactions and update independently
4. **Persistence**: Todo and Quick Links components save to Local Storage on every mutation

## Components and Interfaces

### GreetingComponent

**Responsibilities:**
- Display current time in HH:MM format
- Display current date in readable format
- Display time-appropriate greeting message
- Update time display every minute

**Public Interface:**
```javascript
GreetingComponent = {
  init(): void
  updateTime(): void
  updateGreeting(): void
}
```

**Internal State:**
- `intervalId`: Reference to setInterval for cleanup
- DOM references to time, date, and greeting elements

**Implementation Details:**
- Uses `Date` object for time/date retrieval
- Greeting logic based on hour ranges: 5-11 (morning), 12-16 (afternoon), 17-20 (evening), 21-4 (night)
- Updates every 60 seconds using `setInterval`
- Date formatted using `toLocaleDateString()` with appropriate options

### TimerComponent

**Responsibilities:**
- Manage 25-minute countdown timer
- Provide start, stop, and reset controls
- Update display every second when running
- Stop automatically at 00:00

**Public Interface:**
```javascript
TimerComponent = {
  init(): void
  start(): void
  stop(): void
  reset(): void
  tick(): void
}
```

**Internal State:**
- `totalSeconds`: Current countdown value (initialized to 1500 for 25 minutes)
- `isRunning`: Boolean flag for timer state
- `intervalId`: Reference to setInterval for cleanup
- DOM references to display and control buttons

**Implementation Details:**
- Timer counts down from 1500 seconds (25 minutes)
- Display formatted as MM:SS using zero-padding
- `tick()` decrements `totalSeconds` and updates display
- When `totalSeconds` reaches 0, automatically stops
- Reset returns to 1500 seconds regardless of current state

### TodoComponent

**Responsibilities:**
- Create, read, update, delete tasks
- Toggle task completion status
- Persist tasks to Local Storage
- Load tasks on initialization

**Public Interface:**
```javascript
TodoComponent = {
  init(): void
  addTask(text: string): void
  toggleTask(id: string): void
  editTask(id: string, newText: string): void
  deleteTask(id: string): void
  saveToStorage(): void
  loadFromStorage(): Task[]
  render(): void
}
```

**Internal State:**
- `tasks`: Array of Task objects
- DOM references to input field, task list container, and form

**Implementation Details:**
- Each task has unique ID generated using `Date.now()` or UUID-like string
- Tasks stored as array in Local Storage under key `productivity-dashboard-tasks`
- Completed tasks styled differently (strikethrough, opacity)
- Edit mode toggles input field for inline editing
- Input validation prevents empty task creation
- Re-renders entire list on any mutation for simplicity

### QuickLinksComponent

**Responsibilities:**
- Create and delete quick links
- Open links in new tabs
- Persist links to Local Storage
- Load links on initialization

**Public Interface:**
```javascript
QuickLinksComponent = {
  init(): void
  addLink(name: string, url: string): void
  deleteLink(id: string): void
  saveToStorage(): void
  loadFromStorage(): Link[]
  render(): void
}
```

**Internal State:**
- `links`: Array of Link objects
- DOM references to name input, URL input, links container, and form

**Implementation Details:**
- Each link has unique ID generated using `Date.now()` or UUID-like string
- Links stored as array in Local Storage under key `productivity-dashboard-links`
- Links open in new tab using `target="_blank"` with `rel="noopener noreferrer"` for security
- Input validation prevents empty name or URL
- URL format validation is minimal (browser handles invalid URLs)
- Re-renders entire list on any mutation

## Data Models

### Task Model

```javascript
{
  id: string,          // Unique identifier (timestamp or UUID)
  text: string,        // Task description
  completed: boolean,  // Completion status
  createdAt: number    // Timestamp of creation (milliseconds)
}
```

**Storage Key:** `productivity-dashboard-tasks`

**Storage Format:** JSON array of Task objects

**Example:**
```json
[
  {
    "id": "1704067200000",
    "text": "Complete project documentation",
    "completed": false,
    "createdAt": 1704067200000
  },
  {
    "id": "1704067260000",
    "text": "Review pull requests",
    "completed": true,
    "createdAt": 1704067260000
  }
]
```

### Link Model

```javascript
{
  id: string,       // Unique identifier (timestamp or UUID)
  name: string,     // Display name for the link
  url: string,      // Target URL
  createdAt: number // Timestamp of creation (milliseconds)
}
```

**Storage Key:** `productivity-dashboard-links`

**Storage Format:** JSON array of Link objects

**Example:**
```json
[
  {
    "id": "1704067200000",
    "name": "GitHub",
    "url": "https://github.com",
    "createdAt": 1704067200000
  },
  {
    "id": "1704067260000",
    "name": "Documentation",
    "url": "https://developer.mozilla.org",
    "createdAt": 1704067260000
  }
]
```

### Local Storage Interface

**Storage Operations:**

```javascript
// Save tasks
localStorage.setItem('productivity-dashboard-tasks', JSON.stringify(tasks));

// Load tasks
const tasks = JSON.parse(localStorage.getItem('productivity-dashboard-tasks') || '[]');

// Save links
localStorage.setItem('productivity-dashboard-links', JSON.stringify(links));

// Load links
const links = JSON.parse(localStorage.getItem('productivity-dashboard-links') || '[]');
```

**Error Handling:**
- Wrap all Local Storage operations in try-catch blocks
- Handle `QuotaExceededError` gracefully
- Handle JSON parse errors with fallback to empty arrays
- Display user-friendly warning if Local Storage is unavailable

## UI Layout and Styling

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Productivity Dashboard</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="container">
    <!-- Greeting Section -->
    <section class="greeting-section">
      <h1 id="greeting"></h1>
      <div id="time"></div>
      <div id="date"></div>
    </section>

    <!-- Timer Section -->
    <section class="timer-section">
      <h2>Focus Timer</h2>
      <div id="timer-display">25:00</div>
      <div class="timer-controls">
        <button id="timer-start">Start</button>
        <button id="timer-stop">Stop</button>
        <button id="timer-reset">Reset</button>
      </div>
    </section>

    <!-- Todo Section -->
    <section class="todo-section">
      <h2>To-Do List</h2>
      <form id="todo-form">
        <input type="text" id="todo-input" placeholder="Add a new task...">
        <button type="submit">Add</button>
      </form>
      <ul id="todo-list"></ul>
    </section>

    <!-- Quick Links Section -->
    <section class="links-section">
      <h2>Quick Links</h2>
      <form id="links-form">
        <input type="text" id="link-name" placeholder="Link name">
        <input type="text" id="link-url" placeholder="URL">
        <button type="submit">Add</button>
      </form>
      <div id="links-container"></div>
    </section>
  </div>

  <script src="js/app.js"></script>
</body>
</html>
```

### CSS Architecture

**Design Principles:**
- Mobile-first responsive design
- CSS Grid for main layout
- Flexbox for component-level layouts
- CSS custom properties for theming
- Minimal, clean aesthetic

**Color Scheme:**
```css
:root {
  --primary-bg: #f5f5f5;
  --secondary-bg: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent: #4a90e2;
  --accent-hover: #357abd;
  --border: #e0e0e0;
  --completed: #999999;
  --shadow: rgba(0, 0, 0, 0.1);
}
```

**Typography:**
- Primary font: System font stack for performance
- Heading sizes: h1 (2.5rem), h2 (1.5rem)
- Body text: 1rem with 1.5 line-height
- Monospace for timer display

**Layout:**
- Container: max-width 1200px, centered
- Grid: 2 columns on desktop, 1 column on mobile
- Sections: padding, border-radius, box-shadow for card effect
- Spacing: consistent 1rem/2rem scale

**Interactive Elements:**
- Buttons: padding, border-radius, hover states
- Inputs: border, focus states with outline
- Tasks: hover effects, cursor pointer
- Links: button-style with hover animation

### Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (single column)
- Desktop: ≥ 768px (two column grid)

**Mobile Adjustments:**
- Reduced font sizes
- Full-width buttons
- Stacked form inputs
- Reduced padding/margins

## Implementation Approach

### JavaScript Module Pattern

Each component uses the revealing module pattern:

```javascript
const ComponentName = (function() {
  // Private state
  let privateVar = null;
  
  // Private methods
  function privateMethod() {
    // Implementation
  }
  
  // Public interface
  return {
    init: function() {
      // Initialization
    },
    publicMethod: function() {
      // Public functionality
    }
  };
})();
```

### Event Handling Strategy

- Use event delegation where appropriate (todo list, links container)
- Attach event listeners during component initialization
- Prevent default form submission behavior
- Clean up intervals on component destruction (if needed)

### DOM Manipulation

- Cache DOM references during initialization
- Use `innerHTML` for simple updates
- Use `createElement` and `appendChild` for complex structures
- Minimize reflows by batching DOM updates

### State Management

- Each component maintains its own state
- No global state object (components are independent)
- State changes trigger re-renders
- Storage operations are synchronous (Local Storage API)

### Error Handling Strategy

- Try-catch blocks around all Local Storage operations
- Graceful degradation if Local Storage unavailable
- Input validation before processing
- Console logging for debugging (can be removed in production)

### Performance Considerations

- Debounce rapid user inputs if needed
- Use `requestAnimationFrame` for smooth animations (if added)
- Minimize DOM queries by caching references
- Avoid memory leaks by clearing intervals
- Keep data structures simple (arrays, not complex graphs)

### Browser Compatibility

- Use ES6 features supported by target browsers (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Avoid experimental APIs
- Test Local Storage availability before use
- Use standard DOM APIs (no jQuery or framework-specific methods)


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Time Format Consistency

For any Date object, the time formatting function should produce a string in HH:MM format with proper zero-padding (e.g., "09:45", "14:03", "00:00").

**Validates: Requirements 1.1**

### Property 2: Date Format Readability

For any Date object, the date formatting function should produce a human-readable string containing the day, month, and year information.

**Validates: Requirements 1.2**

### Property 3: Greeting Time Range Mapping

For any hour value (0-23), the greeting function should return exactly one of: "Good morning" (5-11), "Good afternoon" (12-16), "Good evening" (17-20), or "Good night" (21-4), with no gaps or overlaps in coverage.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 4: Timer Format Consistency

For any non-negative integer representing seconds, the timer formatting function should produce a string in MM:SS format with proper zero-padding (e.g., "25:00", "03:45", "00:00").

**Validates: Requirements 2.7**

### Property 5: Timer Stop Preserves Time

For any timer state with remaining time T, stopping the timer should preserve the value T without modification.

**Validates: Requirements 2.4**

### Property 6: Timer Reset Idempotence

For any timer state, calling reset should set the timer to 1500 seconds (25 minutes), and calling reset again should produce the same result.

**Validates: Requirements 2.5**

### Property 7: Task Creation Increases Count

For any task list and any non-empty task text, adding the task should increase the task list length by exactly one.

**Validates: Requirements 3.1**

### Property 8: Task Order Preservation

For any sequence of task additions, the displayed task list should maintain the order in which tasks were created (first created appears first).

**Validates: Requirements 3.2**

### Property 9: Task Toggle Idempotence

For any task, toggling its completion status twice should return it to its original completion state.

**Validates: Requirements 3.3**

### Property 10: Task Edit Preserves Identity

For any task with ID and any new text, editing the task text should preserve the task's ID and completion status while updating only the text field.

**Validates: Requirements 3.4**

### Property 11: Task Deletion Removes Exactly One

For any task list and any task ID in that list, deleting the task should reduce the list length by exactly one and the deleted task should not appear in the resulting list.

**Validates: Requirements 3.5**

### Property 12: Task Storage Round-Trip

For any array of tasks, saving to Local Storage and then loading should produce an equivalent array with the same tasks in the same order with the same properties.

**Validates: Requirements 3.7, 3.8, 5.1, 5.3**

### Property 13: Link Creation Increases Count

For any link list and any non-empty name and URL, adding the link should increase the link list length by exactly one.

**Validates: Requirements 4.1**

### Property 14: Link Deletion Removes Exactly One

For any link list and any link ID in that list, deleting the link should reduce the list length by exactly one and the deleted link should not appear in the resulting list.

**Validates: Requirements 4.4**

### Property 15: Link Storage Round-Trip

For any array of links, saving to Local Storage and then loading should produce an equivalent array with the same links in the same order with the same properties.

**Validates: Requirements 4.5, 4.6, 5.2, 5.4**

### Property 16: Empty Task Rejection

For any string composed entirely of whitespace characters (including empty string), attempting to create a task should be rejected and the task list should remain unchanged.

**Validates: Requirements 9.1**

### Property 17: Empty Link Field Rejection

For any combination where either the name or URL is an empty string or whitespace-only, attempting to create a link should be rejected and the link list should remain unchanged.

**Validates: Requirements 9.2**

### Property 18: Permissive URL Validation

For any string provided as a URL (including invalid URL formats), the link creation should accept and store the value, allowing the browser to handle navigation errors.

**Validates: Requirements 9.3**

## Error Handling

### Local Storage Errors

**QuotaExceededError:**
- Catch when storage limit is reached
- Display user-friendly message: "Storage limit reached. Please delete some items."
- Allow application to continue functioning with in-memory state
- Disable save operations until space is available

**JSON Parse Errors:**
- Wrap all `JSON.parse()` calls in try-catch blocks
- On parse error, log warning to console
- Return empty array as fallback: `[]`
- Initialize with clean state rather than crashing

**Storage Unavailable:**
- Check for Local Storage availability on initialization
- If unavailable (private browsing, disabled), display warning banner
- Continue functioning with in-memory state only
- Disable persistence features gracefully

### Input Validation Errors

**Empty Task Text:**
- Trim input before validation
- Reject if resulting string is empty
- Provide visual feedback (shake animation, red border)
- Keep focus on input field

**Empty Link Fields:**
- Validate both name and URL are non-empty after trimming
- Reject if either field is empty
- Highlight empty fields with visual feedback
- Keep focus on first empty field

**Invalid Data Types:**
- Validate loaded data structure matches expected format
- Check for required properties (id, text, completed for tasks)
- Discard malformed items, keep valid ones
- Log warnings for debugging

### Timer Edge Cases

**Timer at Zero:**
- Stop interval when reaching 0
- Prevent negative values
- Disable start button when at zero
- Require reset before starting again

**Rapid Button Clicks:**
- Disable buttons during state transitions
- Prevent multiple intervals from running
- Clear existing interval before starting new one

### DOM Errors

**Missing Elements:**
- Check for element existence before manipulation
- Log error if critical elements missing
- Fail gracefully rather than throwing exceptions

**Event Handler Errors:**
- Wrap event handlers in try-catch
- Log errors to console
- Prevent one component error from breaking others

## Testing Strategy

### Dual Testing Approach

The application will use both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples demonstrating correct behavior
- Edge cases (timer at zero, empty inputs, corrupted storage)
- Error conditions (storage unavailable, invalid JSON)
- Integration points between components
- DOM manipulation and event handling

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Round-trip properties (storage serialization)
- Idempotence properties (toggle, reset)
- Invariant preservation (order, count)

Both approaches are complementary and necessary. Unit tests catch specific bugs and validate concrete scenarios, while property-based tests verify general correctness across a wide input space.

### Property-Based Testing Configuration

**Library Selection:**
- Use `fast-check` for JavaScript property-based testing
- Install via npm: `npm install --save-dev fast-check`
- Import in test files: `import fc from 'fast-check'`

**Test Configuration:**
- Minimum 100 iterations per property test
- Use appropriate generators (fc.string(), fc.integer(), fc.array())
- Configure timeout for longer-running tests
- Seed tests for reproducibility when debugging

**Property Test Structure:**

Each property test must:
1. Reference the design document property number in a comment
2. Use the tag format: `// Feature: productivity-dashboard, Property X: [property text]`
3. Generate random inputs using fast-check arbitraries
4. Assert the property holds for all generated inputs
5. Run minimum 100 iterations

Example:
```javascript
// Feature: productivity-dashboard, Property 12: Task Storage Round-Trip
test('task storage round-trip preserves data', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        id: fc.string(),
        text: fc.string(),
        completed: fc.boolean(),
        createdAt: fc.integer()
      })),
      (tasks) => {
        const saved = JSON.stringify(tasks);
        const loaded = JSON.parse(saved);
        expect(loaded).toEqual(tasks);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Test Framework:**
- Use Jest for unit testing
- Install via npm: `npm install --save-dev jest`
- Configure for browser environment with jsdom

**Coverage Areas:**

1. **Greeting Component:**
   - Test specific time values produce correct greetings
   - Test boundary conditions (4:59, 5:00, 11:59, 12:00, etc.)
   - Test date formatting with known dates

2. **Timer Component:**
   - Test initialization to 25 minutes
   - Test start/stop/reset state transitions
   - Test countdown logic with mocked intervals
   - Test zero boundary condition
   - Test display formatting with specific values

3. **Todo Component:**
   - Test adding valid tasks
   - Test rejecting empty/whitespace tasks
   - Test toggling completion status
   - Test editing task text
   - Test deleting tasks
   - Test storage operations with mocked localStorage
   - Test loading corrupted data

4. **Quick Links Component:**
   - Test adding valid links
   - Test rejecting empty name/URL
   - Test accepting invalid URL formats
   - Test deleting links
   - Test storage operations with mocked localStorage
   - Test loading corrupted data

5. **Integration Tests:**
   - Test component initialization sequence
   - Test multiple components interacting
   - Test storage key uniqueness
   - Test error handling across components

### Test Execution

**Running Tests:**
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- greeting.test.js

# Run in watch mode
npm test -- --watch
```

**Coverage Goals:**
- Aim for 80%+ code coverage
- Focus on critical paths and error handling
- Document any intentionally untested code

### Manual Testing Checklist

Some requirements require manual verification:

1. **Visual Design (Requirement 6):**
   - Verify layout in different browsers
   - Check responsive behavior at various screen sizes
   - Validate typography and spacing
   - Test hover states and visual feedback

2. **Performance (Requirement 7):**
   - Measure initial load time
   - Test interaction responsiveness
   - Monitor timer update smoothness
   - Check for UI blocking during storage operations

3. **Browser Compatibility (Requirement 8):**
   - Test in Chrome 90+
   - Test in Firefox 88+
   - Test in Edge 90+
   - Test in Safari 14+
   - Verify all features work consistently

4. **Accessibility:**
   - Test keyboard navigation
   - Verify screen reader compatibility
   - Check color contrast ratios
   - Test with browser zoom

