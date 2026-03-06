/**
 * app.js — Entry point (ES6 module)
 * Imports and initialises all modules.
 */

import { initNewsManager } from './newsManager.js';

// Initialise the news manager when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initNewsManager();
});
