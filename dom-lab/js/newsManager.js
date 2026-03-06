/**
 * newsManager.js
 * Handles adding, highlighting, and deleting news items.
 * Demonstrates DOM techniques:
 *   - <template> element cloning (createElement via template)
 *   - textContent  → update node text
 *   - setAttribute → change img src / alt
 *   - classList    → add / remove / toggle highlight classes
 *   - appendChild  → insert new nodes
 *   - element.remove() → delete nodes
 *   - Event delegation on the news list
 */

// ── Constants ──────────────────────────────────────────────

/** Five nature images for random selection */
const IMAGES = [
  './img/nature1.png',  // forest
  './img/nature2.png',  // mountain
  './img/nature3.png',  // beach
  './img/nature4.png',  // flowers
  './img/nature5.png',  // waterfall
];

/** Alt text matching each image */
const IMAGE_ALTS = [
  'Bosque frondoso lleno de vida',
  'Montaña nevada al atardecer',
  'Playa tropical con aguas cristalinas',
  'Flores silvestres vibrantes',
  'Cascada majestuosa en la selva',
];

/** Human-readable labels for each highlight class */
const HIGHLIGHT_LABELS = {
  'news-item--important': '⚠️ Importante',
  'news-item--urgent': '🔴 Urgente',
  'news-item--announcement': '📢 Anuncio',
  'news-item--recommended': '⭐ Recomendado',
};

/** All highlight modifier class names */
const ALL_HIGHLIGHT_CLASSES = Object.keys(HIGHLIGHT_LABELS);

// ── Helpers ────────────────────────────────────────────────

/**
 * Returns a random index in [0, max).
 * Used to pick a random image via setAttribute.
 * @param {number} max
 * @returns {number}
 */
function randomIndex(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Formats the current date and time as a readable string.
 * @returns {string}
 */
function formatDate() {
  return new Date().toLocaleString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Counter ────────────────────────────────────────────────

/** @type {HTMLElement} */
const counterEl = document.getElementById('news-counter');
/** @type {HTMLElement} */
const emptyState = document.getElementById('empty-state');
/** @type {HTMLUListElement} */
const listEl = document.getElementById('news-list');

/**
 * Refreshes the counter badge and shows/hides the empty-state message.
 */
function updateCounter() {
  const count = listEl.querySelectorAll('.news-item').length;

  // Update textContent — DOM technique demonstrated
  counterEl.textContent = count === 1 ? '1 noticia' : `${count} noticias`;

  // Show/hide empty state using the native hidden attribute
  if (count === 0) {
    emptyState.removeAttribute('hidden');
  } else {
    emptyState.setAttribute('hidden', '');
  }
}

// ── Create News Item ───────────────────────────────────────

/**
 * Clones the <template> element, populates fields, and returns the <li>.
 * Demonstrates:
 *   - document.getElementById + content.cloneNode  (template cloning)
 *   - textContent for text nodes
 *   - setAttribute for src / alt
 *   - classList.add for initial highlight
 *
 * @param {string} title       - News headline entered by the user
 * @param {string} highlightClass - One of ALL_HIGHLIGHT_CLASSES or ''
 * @returns {HTMLLIElement}
 */
export function createNewsItem(title, highlightClass) {
  // 1. Clone the template
  const tpl = document.getElementById('news-item-tpl');
  const clone = tpl.content.cloneNode(true);
  const item = clone.querySelector('.news-item');

  // 2. Pick a random image and update src / alt via setAttribute
  const idx = randomIndex(IMAGES.length);
  const img = item.querySelector('.news-item__img');
  img.setAttribute('src', IMAGES[idx]);          // setAttribute — key DOM technique
  img.setAttribute('alt', IMAGE_ALTS[idx]);

  // 3. Set title via textContent (never innerHTML for user input)
  const titleEl = item.querySelector('.news-item__title');
  titleEl.textContent = title;

  // 4. Set date via textContent
  const dateEl = item.querySelector('.news-item__date');
  dateEl.textContent = `🕐 ${formatDate()}`;

  // 5. Apply highlight class if provided
  if (highlightClass && ALL_HIGHLIGHT_CLASSES.includes(highlightClass)) {
    item.classList.add(highlightClass);           // classList.add — key DOM technique
    const tagEl = item.querySelector('.news-item__tag');
    tagEl.textContent = HIGHLIGHT_LABELS[highlightClass];
  }

  return item;
}

// ── Highlight (update highlight class) ────────────────────

/**
 * Cycles through highlight types on a news item.
 * Uses classList.remove / classList.add — key DOM technique.
 * @param {HTMLLIElement} item
 */
function cycleHighlight(item) {
  // Find currently active highlight class (if any)
  const current = ALL_HIGHLIGHT_CLASSES.find(cls => item.classList.contains(cls));
  const currentIdx = current ? ALL_HIGHLIGHT_CLASSES.indexOf(current) : -1;

  // Remove all existing highlight classes
  item.classList.remove(...ALL_HIGHLIGHT_CLASSES);  // classList.remove — key technique

  // Move to the next class (wrap around; -1 means "none")
  const nextIdx = (currentIdx + 1) % (ALL_HIGHLIGHT_CLASSES.length + 1);

  const tagEl = item.querySelector('.news-item__tag');

  if (nextIdx < ALL_HIGHLIGHT_CLASSES.length) {
    const nextClass = ALL_HIGHLIGHT_CLASSES[nextIdx];
    item.classList.add(nextClass);                  // classList.add
    tagEl.textContent = HIGHLIGHT_LABELS[nextClass];
  } else {
    // No highlight
    tagEl.textContent = '';
  }
}

// ── Change Image ─────────────────────────────────────────

/**
 * Picks a new random image (different from the current one) and
 * updates the card's <img> via setAttribute — key DOM technique.
 * @param {HTMLLIElement} item
 */
function changeImage(item) {
  const img = item.querySelector('.news-item__img');
  const currentSrc = img.getAttribute('src');             // getAttribute

  // Pick a different random index to guarantee the image actually changes
  let idx;
  do {
    idx = randomIndex(IMAGES.length);
  } while (IMAGES[idx] === currentSrc && IMAGES.length > 1);

  img.setAttribute('src', IMAGES[idx]);                   // setAttribute — key DOM technique
  img.setAttribute('alt', IMAGE_ALTS[idx]);               // setAttribute

  // Brief scale-in animation to signal the change
  img.style.transition = 'transform 0ms';
  img.style.transform  = 'scale(1.08)';
  requestAnimationFrame(() => {
    img.style.transition = 'transform 350ms ease';
    img.style.transform  = 'scale(1)';
  });
}

// ── Edit News Item ────────────────────────────────────────

/**
 * Toggles a news item between display mode and inline edit mode.
 * Demonstrates:
 *   - createElement to build an <input>
 *   - textContent to read and write the current title
 *   - replaceWith() to swap elements in the DOM
 *   - classList.add / classList.remove on the edit button
 *
 * @param {HTMLLIElement} item
 * @param {HTMLButtonElement} editBtn
 */
function editItem(item, editBtn) {
  const titleEl = item.querySelector('.news-item__title');

  // ── Enter edit mode ───────────────────────────────────
  if (editBtn.dataset.action === 'edit') {
    // 1. Create title <input> pre-filled with current text
    const input = document.createElement('input');           // createElement
    input.type = 'text';
    input.className = 'news-item__edit-input';
    input.value = titleEl.textContent;                       // textContent (read)
    input.setAttribute('aria-label', 'Editar título');       // setAttribute

    // 2. Create highlight <select> pre-selected to current class
    const select = document.createElement('select');         // createElement
    select.className = 'news-item__edit-select';
    select.setAttribute('aria-label', 'Tipo de resaltado'); // setAttribute

    // None option
    const noneOpt = document.createElement('option');
    noneOpt.value = '';
    noneOpt.textContent = '— Sin resaltado —';              // textContent
    select.appendChild(noneOpt);

    // One option per highlight type
    for (const [cls, label] of Object.entries(HIGHLIGHT_LABELS)) {
      const opt = document.createElement('option');          // createElement
      opt.value = cls;
      opt.textContent = label;                              // textContent
      if (item.classList.contains(cls)) {                   // classList check
        opt.setAttribute('selected', '');                   // setAttribute
      }
      select.appendChild(opt);                              // appendChild
    }

    // 3. Wrap both controls and replace the <h3>
    const editWrap = document.createElement('div');
    editWrap.className = 'news-item__edit-wrap';
    editWrap.appendChild(input);
    editWrap.appendChild(select);
    titleEl.replaceWith(editWrap);                          // replaceWith (DOM swap)
    input.focus();
    input.select();

    // 4. Swap button to "Guardar"
    editBtn.dataset.action = 'save';
    editBtn.classList.remove('btn--edit');                  // classList.remove
    editBtn.classList.add('btn--save');                     // classList.add
    editBtn.innerHTML = '<span aria-hidden="true">💾</span> Guardar';

    // Allow saving with Enter, cancelling with Escape
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') editBtn.click();
      if (e.key === 'Escape') cancelEdit(item, editBtn, titleEl);
    });

    return;
  }

  // ── Save mode ─────────────────────────────────────────
  if (editBtn.dataset.action === 'save') {
    const wrap = item.querySelector('.news-item__edit-wrap');
    const input = wrap.querySelector('.news-item__edit-input');
    const select = wrap.querySelector('.news-item__edit-select');
    const newTitle = input.value.trim() || titleEl.textContent;
    const newClass = select.value;

    // Rebuild <h3> via textContent
    const newTitleEl = document.createElement('h3');        // createElement
    newTitleEl.className = 'news-item__title';
    newTitleEl.textContent = newTitle;                      // textContent (write)
    wrap.replaceWith(newTitleEl);                           // replaceWith

    // Apply chosen highlight class
    item.classList.remove(...ALL_HIGHLIGHT_CLASSES);        // classList.remove all
    const tagEl = item.querySelector('.news-item__tag');
    if (newClass && ALL_HIGHLIGHT_CLASSES.includes(newClass)) {
      item.classList.add(newClass);                         // classList.add
      tagEl.textContent = HIGHLIGHT_LABELS[newClass];
    } else {
      tagEl.textContent = '';
    }

    // Restore button to "Editar"
    editBtn.dataset.action = 'edit';
    editBtn.classList.remove('btn--save');                  // classList.remove
    editBtn.classList.add('btn--edit');                     // classList.add
    editBtn.innerHTML = '<span aria-hidden="true">✏️</span> Editar';
  }
}

/**
 * Cancels an active edit, restoring the original title heading.
 */
function cancelEdit(item, editBtn, originalTitleEl) {
  const wrap = item.querySelector('.news-item__edit-wrap');
  if (!wrap) return;
  const restored = document.createElement('h3');
  restored.className = 'news-item__title';
  restored.textContent = originalTitleEl.textContent;
  wrap.replaceWith(restored);
  editBtn.dataset.action = 'edit';
  editBtn.classList.remove('btn--save');
  editBtn.classList.add('btn--edit');
  editBtn.innerHTML = '<span aria-hidden="true">✏️</span> Editar';
}



/**
 * Animates and removes a news item from the DOM.
 * Uses element.remove() — key DOM technique.
 * @param {HTMLLIElement} item
 */
function removeItem(item) {
  item.classList.add('news-item--removing');  // classList.add — triggers CSS animation

  // Wait for the CSS animation to finish, then remove the node
  item.addEventListener('animationend', () => {
    item.remove();                            // node.remove() — key DOM technique
    updateCounter();
  }, { once: true });
}

// ── Event Delegation on the list ──────────────────────────

/**
 * Attaches a single delegated click listener to the news list.
 * Handles both "highlight" and "delete" actions for all items.
 */
function initListEvents() {
  listEl.addEventListener('click', (event) => {
    // Walk up from the click target to find the button
    const btn = event.target.closest('[data-action]');
    if (!btn) return;

    const item = btn.closest('.news-item');
    const action = btn.dataset.action;

    if (action === 'highlight') {
      cycleHighlight(item);
    } else if (action === 'change-image') {
      changeImage(item);                                  // setAttribute — key DOM technique
    } else if (action === 'edit' || action === 'save') {
      editItem(item, btn);
    } else if (action === 'delete') {
      removeItem(item);
    }
  });
}

// ── Form Submit ────────────────────────────────────────────

/**
 * Initialises the news manager:
 *  - Binds form submit event
 *  - Attaches list delegation
 *  - Sets initial counter state
 */
export function initNewsManager() {
  const form = document.getElementById('news-form');
  const inputEl = document.getElementById('news-title');
  const selectEl = document.getElementById('news-highlight');

  // Handle form submission
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = inputEl.value.trim();
    if (!title) {
      // Briefly highlight the empty input
      inputEl.focus();
      inputEl.style.borderColor = 'var(--clr-urgent)';
      setTimeout(() => { inputEl.style.borderColor = ''; }, 1200);
      return;
    }

    const highlightClass = selectEl.value;

    // Create and append the new news item
    const newItem = createNewsItem(title, highlightClass);
    listEl.appendChild(newItem);    // appendChild — key DOM technique

    // Reset form
    inputEl.value = '';
    selectEl.value = '';
    inputEl.focus();

    updateCounter();
  });

  // Delegate click events on the list
  initListEvents();

  // Set initial counter
  updateCounter();
}
