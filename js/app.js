// Productivity Dashboard Application

// ============================================
// Greeting Component
// ============================================
const GreetingComponent = (function() {
  // Private state
  let intervalId = null;
  let greetingElement = null;
  let timeElement = null;
  let dateElement = null;

  // Format time as HH:MM with zero-padding
  function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Format date in readable format
  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get greeting based on hour
  function getGreeting(hour) {
    if (hour >= 5 && hour <= 11) {
      return 'Good morning';
    } else if (hour >= 12 && hour <= 16) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour <= 20) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  }

  // Update time display
  function updateTime() {
    const now = new Date();
    timeElement.textContent = formatTime(now);
  }

  // Update date display
  function updateDate() {
    const now = new Date();
    dateElement.textContent = formatDate(now);
  }

  // Update greeting display
  function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    greetingElement.textContent = getGreeting(hour);
  }

  // Update all displays (batched to minimize reflows)
  function updateAll() {
    // Batch DOM updates to minimize reflows
    const now = new Date();
    const hour = now.getHours();
    
    // Update all three elements in one batch
    timeElement.textContent = formatTime(now);
    dateElement.textContent = formatDate(now);
    greetingElement.textContent = getGreeting(hour);
  }

  // Public interface
  return {
    init: function() {
      try {
        // Cache DOM references
        greetingElement = document.getElementById('greeting');
        timeElement = document.getElementById('time');
        dateElement = document.getElementById('date');

        // Validate DOM elements exist
        if (!greetingElement || !timeElement || !dateElement) {
          console.error('GreetingComponent: Required DOM elements not found');
          return;
        }

        // Initial update
        updateAll();

        // Update every 60 seconds
        intervalId = setInterval(updateAll, 60000);
      } catch (error) {
        console.error('Error initializing GreetingComponent:', error);
      }
    },

    // Cleanup method to prevent memory leaks
    cleanup: function() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },

    updateTime: updateTime,
    updateGreeting: updateGreeting
  };
})();

// ============================================
// Timer Component
// ============================================
const TimerComponent = (function() {
  // Private state
  let totalSeconds = 1500; // 25 minutes in seconds
  let isRunning = false;
  let intervalId = null;
  let displayElement = null;
  let startButton = null;
  let stopButton = null;
  let resetButton = null;

  // Format seconds as MM:SS with zero-padding
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Update display with current time
  function updateDisplay() {
    displayElement.textContent = formatTime(totalSeconds);
  }

  // Decrement timer and update display
  function tick() {
    // Prevent negative values
    if (totalSeconds > 0) {
      totalSeconds--;
      updateDisplay();
      
      // Auto-stop when reaching 00:00
      if (totalSeconds === 0) {
        stop();
      }
    } else {
      // Safety check: stop if somehow negative
      console.error('Timer reached invalid state (negative value). Stopping timer.');
      stop();
      totalSeconds = 0;
      updateDisplay();
    }
  }

  // Start the countdown
  function start() {
    if (!isRunning && totalSeconds > 0) {
      // Prevent multiple intervals by clearing any existing interval
      if (intervalId !== null) {
        console.warn('Clearing existing timer interval before starting new one.');
        clearInterval(intervalId);
      }
      
      isRunning = true;
      intervalId = setInterval(tick, 1000);
    } else if (totalSeconds <= 0) {
      console.warn('Cannot start timer: timer is at zero. Please reset first.');
    }
  }

  // Stop/pause the countdown
  function stop() {
    if (isRunning) {
      isRunning = false;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  }

  // Reset timer to 25 minutes
  function reset() {
    stop();
    totalSeconds = 1500;
    updateDisplay();
  }

  // Public interface
  return {
    init: function() {
      try {
        // Cache DOM references
        displayElement = document.getElementById('timer-display');
        startButton = document.getElementById('timer-start');
        stopButton = document.getElementById('timer-stop');
        resetButton = document.getElementById('timer-reset');

        // Validate DOM elements exist
        if (!displayElement || !startButton || !stopButton || !resetButton) {
          console.error('TimerComponent: Required DOM elements not found');
          return;
        }

        // Initialize display
        updateDisplay();

        // Attach event listeners
        startButton.addEventListener('click', start);
        stopButton.addEventListener('click', stop);
        resetButton.addEventListener('click', reset);
      } catch (error) {
        console.error('Error initializing TimerComponent:', error);
      }
    },

    // Cleanup method to prevent memory leaks
    cleanup: function() {
      stop(); // This will clear the interval if running
    },

    start: start,
    stop: stop,
    reset: reset,
    tick: tick
  };
})();

// ============================================
// Todo Component
// ============================================
const TodoComponent = (function() {
  // Private state
  let tasks = [];
  let formElement = null;
  let inputElement = null;
  let listElement = null;
  let filterTabs = null;
  let sortSelect = null;
  let currentFilter = 'all';
  let currentSort = 'newest';

  // Storage key constant
  const STORAGE_KEY = 'productivity-dashboard-tasks';

  /**
   * Task Data Model Structure:
   * {
   *   id: string,          // Unique identifier (timestamp-based)
   *   text: string,        // Task description
   *   completed: boolean,  // Completion status
   *   createdAt: number    // Timestamp of creation (milliseconds)
   * }
   */

  // Save tasks to localStorage
  function saveToStorage() {
    // Check if localStorage is available before attempting to save
    if (!StorageManager.isAvailable()) {
      console.warn('localStorage unavailable. Tasks will not be persisted.');
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to storage:', error);
      // Handle QuotaExceededError or other storage errors
      if (error.name === 'QuotaExceededError') {
        console.error('Storage limit reached. Please delete some items to free up space.');
        alert('Storage limit reached. Your tasks cannot be saved. Please delete some items to free up space.');
      } else {
        console.error('Unexpected error saving tasks:', error.message);
      }
    }
  }

  // Load tasks from localStorage
  function loadFromStorage() {
    // Check if localStorage is available before attempting to load
    if (!StorageManager.isAvailable()) {
      console.warn('localStorage unavailable. Starting with empty tasks.');
      return [];
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that parsed data is an array
        if (Array.isArray(parsed)) {
          return parsed;
        } else {
          console.warn('Invalid tasks data format in storage. Initializing with empty array.');
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to load tasks from storage:', error);
      // Handle corrupted data with fallback to empty array
      console.warn('Corrupted tasks data. Initializing with empty array.');
      return [];
    }
  }

  // Add a new task
  function addTask(text) {
    // Trim and validate text (reject whitespace-only)
    const trimmedText = text.trim();
    if (trimmedText === '') {
      console.warn('Cannot add task: text is empty or whitespace-only.');
      // Show visual feedback for invalid input
      showInputError(inputElement);
      return; // Reject empty or whitespace-only text
    }

    // Check for duplicates if setting is enabled
    if (SettingsComponent.isDuplicatesAllowed()) {
      const isDuplicate = tasks.some(task => task.text.toLowerCase() === trimmedText.toLowerCase());
      if (isDuplicate) {
        console.warn('Cannot add task: duplicate task detected.');
        showInputError(inputElement);
        showToast('Duplicate task detected! This task already exists.', 'error');
        return;
      }
    }

    try {
      // Create new task object
      const task = {
        id: String(Date.now()), // Unique ID based on timestamp
        text: trimmedText,
        completed: false,
        createdAt: Date.now()
      };

      // Add to tasks array
      tasks.push(task);

      // Save to storage
      saveToStorage();

      // Re-render
      render();
      
      // Update statistics
      updateStatistics();
    } catch (error) {
      console.error('Error adding task:', error);
      showInputError(inputElement);
    }
  }

  // Toggle task completion status
  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveToStorage();
      render();
      updateStatistics();
    }
  }

  // Edit task text while preserving id and status
  function editTask(id, newText) {
    const trimmedText = newText.trim();
    if (trimmedText === '') {
      console.warn('Cannot edit task: new text is empty or whitespace-only.');
      return; // Don't allow empty text
    }

    try {
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.text = trimmedText;
        saveToStorage();
        render();
      } else {
        console.error(`Task with id ${id} not found.`);
      }
    } catch (error) {
      console.error('Error editing task:', error);
    }
  }

  // Delete task by id
  function deleteTask(id) {
    try {
      const originalLength = tasks.length;
      tasks = tasks.filter(t => t.id !== id);
      
      if (tasks.length === originalLength) {
        console.warn(`Task with id ${id} not found for deletion.`);
      }
      
      saveToStorage();
      render();
      updateStatistics();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  // Filter tasks based on current filter
  function getFilteredTasks() {
    let filtered = [...tasks];
    
    // Apply filter
    switch (currentFilter) {
      case 'active':
        filtered = filtered.filter(task => !task.completed);
        break;
      case 'done':
        filtered = filtered.filter(task => task.completed);
        break;
      case 'all':
      default:
        // Show all tasks
        break;
    }
    
    // Apply sorting
    switch (currentSort) {
      case 'oldest':
        filtered.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'a-z':
        filtered.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
        break;
      case 'z-a':
        filtered.sort((a, b) => b.text.toLowerCase().localeCompare(a.text.toLowerCase()));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }
    
    return filtered;
  }

  // Handle filter tab clicks
  function handleFilterChange(filter) {
    currentFilter = filter;
    
    // Update active tab
    filterTabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.filter === filter) {
        tab.classList.add('active');
      }
    });
    
    render();
  }

  // Handle sort change
  function handleSortChange(sort) {
    currentSort = sort;
    render();
  }

  // Render all tasks to the DOM (optimized with DocumentFragment for batching)
  function render() {
    // Clear existing list
    listElement.innerHTML = '';

    // Get filtered and sorted tasks
    const filteredTasks = getFilteredTasks();

    // Use DocumentFragment to batch DOM updates and minimize reflows
    const fragment = document.createDocumentFragment();

    // Render each task
    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      if (task.completed) {
        li.classList.add('completed');
      }

      // Task text (clickable to toggle)
      const textSpan = document.createElement('span');
      textSpan.className = 'todo-text';
      textSpan.textContent = task.text;
      textSpan.setAttribute('role', 'button');
      textSpan.setAttribute('tabindex', '0');
      textSpan.setAttribute('aria-label', `Toggle completion for: ${task.text}`);
      textSpan.addEventListener('click', () => toggleTask(task.id));
      // Add keyboard support for accessibility
      textSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTask(task.id);
        }
      });

      // Edit button
      const editButton = document.createElement('button');
      editButton.className = 'todo-edit';
      editButton.textContent = 'Edit';
      editButton.setAttribute('aria-label', `Edit task: ${task.text}`);
      editButton.addEventListener('click', () => {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null) {
          editTask(task.id, newText);
        }
      });

      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'todo-delete';
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('aria-label', `Delete task: ${task.text}`);
      deleteButton.addEventListener('click', () => deleteTask(task.id));

      // Assemble task item
      li.appendChild(textSpan);
      li.appendChild(editButton);
      li.appendChild(deleteButton);

      // Add to fragment instead of directly to DOM
      fragment.appendChild(li);
    });

    // Single DOM update - append all tasks at once
    listElement.appendChild(fragment);
  }

  // Handle form submission
  function handleSubmit(event) {
    event.preventDefault();
    const text = inputElement.value;
    addTask(text);
    inputElement.value = ''; // Clear input
  }

  // Update statistics
  function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    SettingsComponent.updateStats(total, completed);
  }

  // Public interface
  return {
    init: function() {
      try {
        // Cache DOM references
        formElement = document.getElementById('todo-form');
        inputElement = document.getElementById('todo-input');
        listElement = document.getElementById('todo-list');
        filterTabs = document.querySelectorAll('.filter-tab');
        sortSelect = document.getElementById('task-sort');

        // Validate DOM elements exist
        if (!formElement || !inputElement || !listElement || !filterTabs.length || !sortSelect) {
          console.error('TodoComponent: Required DOM elements not found');
          return;
        }

        // Load tasks from storage
        tasks = loadFromStorage();

        // Render initial tasks
        render();

        // Update statistics
        updateStatistics();

        // Attach event listeners
        formElement.addEventListener('submit', handleSubmit);
        
        // Filter tab event listeners
        filterTabs.forEach(tab => {
          tab.addEventListener('click', () => {
            handleFilterChange(tab.dataset.filter);
          });
        });
        
        // Sort dropdown event listener
        sortSelect.addEventListener('change', (e) => {
          handleSortChange(e.target.value);
        });
      } catch (error) {
        console.error('Error initializing TodoComponent:', error);
      }
    },

    addTask: addTask,
    toggleTask: toggleTask,
    editTask: editTask,
    deleteTask: deleteTask,
    render: render,
    saveToStorage: saveToStorage,
    loadFromStorage: loadFromStorage
  };
})();

// ============================================
// Quick Links Component
// ============================================
const QuickLinksComponent = (function() {
  // Private state
  let links = [];
  let formElement = null;
  let nameInputElement = null;
  let urlInputElement = null;
  let containerElement = null;

  // Storage key constant
  const STORAGE_KEY = 'productivity-dashboard-links';

  /**
   * Link Data Model Structure:
   * {
   *   id: string,       // Unique identifier (timestamp-based)
   *   name: string,     // Display name for the link
   *   url: string,      // Target URL
   *   createdAt: number // Timestamp of creation (milliseconds)
   * }
   */

  // Save links to localStorage
  function saveToStorage() {
    // Check if localStorage is available before attempting to save
    if (!StorageManager.isAvailable()) {
      console.warn('localStorage unavailable. Links will not be persisted.');
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch (error) {
      console.error('Failed to save links to storage:', error);
      // Handle QuotaExceededError or other storage errors
      if (error.name === 'QuotaExceededError') {
        console.error('Storage limit reached. Please delete some items to free up space.');
        alert('Storage limit reached. Your links cannot be saved. Please delete some items to free up space.');
      } else {
        console.error('Unexpected error saving links:', error.message);
      }
    }
  }

  // Load links from localStorage
  function loadFromStorage() {
    // Check if localStorage is available before attempting to load
    if (!StorageManager.isAvailable()) {
      console.warn('localStorage unavailable. Starting with empty links.');
      return [];
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that parsed data is an array
        if (Array.isArray(parsed)) {
          return parsed;
        } else {
          console.warn('Invalid links data format in storage. Initializing with empty array.');
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to load links from storage:', error);
      // Handle corrupted data with fallback to empty array
      console.warn('Corrupted links data. Initializing with empty array.');
      return [];
    }
  }

  // Add a new link
  function addLink(name, url) {
    // Trim and validate name and URL (reject whitespace-only)
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    
    if (trimmedName === '' || trimmedUrl === '') {
      console.warn('Cannot add link: name or URL is empty or whitespace-only.');
      // Show visual feedback for invalid inputs
      if (trimmedName === '') {
        showInputError(nameInputElement);
      }
      if (trimmedUrl === '') {
        showInputError(urlInputElement);
      }
      return; // Reject empty or whitespace-only fields
    }

    try {
      // Create new link object
      const link = {
        id: String(Date.now()), // Unique ID based on timestamp
        name: trimmedName,
        url: trimmedUrl,
        createdAt: Date.now()
      };

      // Add to links array
      links.push(link);

      // Save to storage
      saveToStorage();

      // Re-render
      render();
    } catch (error) {
      console.error('Error adding link:', error);
      showInputError(nameInputElement);
      showInputError(urlInputElement);
    }
  }

  // Delete link by id
  function deleteLink(id) {
    try {
      const originalLength = links.length;
      links = links.filter(l => l.id !== id);
      
      if (links.length === originalLength) {
        console.warn(`Link with id ${id} not found for deletion.`);
      }
      
      saveToStorage();
      render();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  }

  // Render all links to the DOM (optimized with DocumentFragment for batching)
  function render() {
    // Clear existing container
    containerElement.innerHTML = '';

    // Use DocumentFragment to batch DOM updates and minimize reflows
    const fragment = document.createDocumentFragment();

    // Render each link
    links.forEach(link => {
      const linkWrapper = document.createElement('div');
      linkWrapper.className = 'link-item';

      // Link button (opens in new tab with security attributes)
      const linkButton = document.createElement('a');
      linkButton.className = 'link-button';
      linkButton.href = link.url;
      linkButton.textContent = link.name;
      linkButton.target = '_blank';
      linkButton.rel = 'noopener noreferrer';

      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'link-delete';
      deleteButton.textContent = '×';
      deleteButton.setAttribute('aria-label', `Delete link: ${link.name}`);
      deleteButton.addEventListener('click', () => deleteLink(link.id));

      // Assemble link item
      linkWrapper.appendChild(linkButton);
      linkWrapper.appendChild(deleteButton);

      // Add to fragment instead of directly to DOM
      fragment.appendChild(linkWrapper);
    });

    // Single DOM update - append all links at once
    containerElement.appendChild(fragment);
  }

  // Handle form submission
  function handleSubmit(event) {
    event.preventDefault();
    const name = nameInputElement.value;
    const url = urlInputElement.value;
    addLink(name, url);
    nameInputElement.value = ''; // Clear name input
    urlInputElement.value = ''; // Clear URL input
  }

  // Public interface
  return {
    init: function() {
      try {
        // Cache DOM references
        formElement = document.getElementById('links-form');
        nameInputElement = document.getElementById('link-name');
        urlInputElement = document.getElementById('link-url');
        containerElement = document.getElementById('links-container');

        // Validate DOM elements exist
        if (!formElement || !nameInputElement || !urlInputElement || !containerElement) {
          console.error('QuickLinksComponent: Required DOM elements not found');
          return;
        }

        // Load links from storage
        links = loadFromStorage();

        // Render initial links
        render();

        // Attach event listeners
        formElement.addEventListener('submit', handleSubmit);
      } catch (error) {
        console.error('Error initializing QuickLinksComponent:', error);
      }
    },

    addLink: addLink,
    deleteLink: deleteLink,
    render: render,
    saveToStorage: saveToStorage,
    loadFromStorage: loadFromStorage
  };
})();

// ============================================
// Settings Component
// ============================================
const SettingsComponent = (function() {
  let darkModeToggle = null;
  let duplicatesToggle = null;
  let totalTasksElement = null;
  let completedTasksElement = null;
  let allowDuplicates = true;

  const DARK_MODE_KEY = 'productivity-dashboard-dark-mode';
  const DUPLICATES_KEY = 'productivity-dashboard-allow-duplicates';

  // Toggle dark mode
  function toggleDarkMode(enabled) {
    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    if (StorageManager.isAvailable()) {
      localStorage.setItem(DARK_MODE_KEY, enabled);
    }
  }

  // Toggle duplicates setting
  function toggleDuplicates(enabled) {
    allowDuplicates = enabled;
    
    if (StorageManager.isAvailable()) {
      localStorage.setItem(DUPLICATES_KEY, enabled);
    }
  }

  // Update statistics display
  function updateStats(total, completed) {
    if (totalTasksElement && completedTasksElement) {
      totalTasksElement.textContent = total;
      completedTasksElement.textContent = completed;
    }
  }

  // Load settings from storage
  function loadSettings() {
    if (StorageManager.isAvailable()) {
      const darkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
      const duplicates = localStorage.getItem(DUPLICATES_KEY);
      
      if (darkModeToggle) {
        darkModeToggle.checked = darkMode;
        toggleDarkMode(darkMode);
      }
      
      if (duplicatesToggle) {
        duplicatesToggle.checked = duplicates !== 'false';
        allowDuplicates = duplicates !== 'false';
      }
    }
  }

  return {
    init: function() {
      try {
        darkModeToggle = document.getElementById('dark-mode-toggle');
        duplicatesToggle = document.getElementById('duplicates-toggle');
        totalTasksElement = document.getElementById('total-tasks');
        completedTasksElement = document.getElementById('completed-tasks');

        if (!darkModeToggle || !duplicatesToggle || !totalTasksElement || !completedTasksElement) {
          console.error('SettingsComponent: Required DOM elements not found');
          return;
        }

        // Load saved settings
        loadSettings();

        // Attach event listeners
        darkModeToggle.addEventListener('change', (e) => {
          toggleDarkMode(e.target.checked);
        });

        duplicatesToggle.addEventListener('change', (e) => {
          toggleDuplicates(e.target.checked);
        });
      } catch (error) {
        console.error('Error initializing SettingsComponent:', error);
      }
    },

    updateStats: updateStats,
    isDuplicatesAllowed: function() { return allowDuplicates; }
  };
})();

// ============================================
// Storage Availability Check
// ============================================
const StorageManager = (function() {
  let isAvailable = false;

  // Check if localStorage is available
  function checkAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }

  // Display warning banner if storage is unavailable
  function displayWarningBanner() {
    const banner = document.createElement('div');
    banner.id = 'storage-warning';
    banner.className = 'storage-warning';
    banner.innerHTML = `
      <strong>⚠️ Warning:</strong> Local Storage is unavailable. Your tasks and links will not be saved between sessions.
    `;
    
    // Insert banner at the top of the container
    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(banner, container.firstChild);
    }
  }

  // Public interface
  return {
    init: function() {
      isAvailable = checkAvailability();
      
      if (!isAvailable) {
        displayWarningBanner();
      }
      
      return isAvailable;
    },
    
    isAvailable: function() {
      return isAvailable;
    }
  };
})();

// ============================================
// Utility Functions
// ============================================

/**
 * Show visual feedback for invalid input
 * Adds error class and removes it after animation
 */
function showInputError(inputElement) {
  if (!inputElement) {
    console.error('showInputError called with null/undefined element');
    return;
  }
  
  // Add error class for visual feedback
  inputElement.classList.add('input-error');
  
  // Remove error class after animation completes
  setTimeout(() => {
    inputElement.classList.remove('input-error');
  }, 600); // Match animation duration
}

/**
 * Show toast notification
 * Displays a temporary message that auto-dismisses
 */
function showToast(message, type = 'error') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Add to body
  document.body.appendChild(toast);
  
  // Trigger animation by adding show class after a brief delay
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// ============================================
// Application Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Check localStorage availability on startup
    StorageManager.init();
    
    // Initialize all components in sequence
    GreetingComponent.init();
    SettingsComponent.init();
    TimerComponent.init();
    TodoComponent.init();
    QuickLinksComponent.init();
    
    console.log('Productivity Dashboard initialized successfully');
  } catch (error) {
    console.error('Critical error during application initialization:', error);
    // Display error message to user
    const container = document.querySelector('.container');
    if (container) {
      const errorBanner = document.createElement('div');
      errorBanner.className = 'storage-warning';
      errorBanner.style.backgroundColor = '#f8d7da';
      errorBanner.style.color = '#721c24';
      errorBanner.style.borderColor = '#f5c6cb';
      errorBanner.innerHTML = `
        <strong>⚠️ Error:</strong> Failed to initialize the dashboard. Please refresh the page or check the console for details.
      `;
      container.insertBefore(errorBanner, container.firstChild);
    }
  }
});
