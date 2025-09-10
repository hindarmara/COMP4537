/**
 * COMP4537 Lab 0 - Memory Game
 * Author: Andre Hindarmara, Set S, A01075140
 * Code written with the help of ChatGPT
 */

/**
 * Constants.
 */
const HUE_MIN = 0;
const HUE_MAX = 360;
const SATURATION_MIN = 55;
const SATURATION_MAX = 85;
const LIGHTNESS_MIN = 45;
const LIGHTNESS_MAX = 65;
const INITIAL_WIDTH = 0;
const INITIAL_HEIGHT = 0;
const INITIAL_BUTTON_SPACING = 12;
const EVENT_DOM_CONTENT_LOADED = "DOMContentLoaded";
const ELEMENT_TYPE_BUTTON = "button";
const CLASS_MEMORY_BUTTON = "memory-button";
const CLASS_HIDDEN_NUMBER = "hidden-number";
const CLASS_REVEALED = "revealed";
const CLASS_CORRECT = "correct";
const CLASS_WRONG = "wrong";

const ID_COUNT_LABEL = "#countLabel";
const ID_NUM_OF_BUTTONS = "#numOfButtons";
const ID_GO_BUTTON = "#goButton";
const ID_BUTTON_CONTAINER = "#buttonContainer";
const ID_STATUS_MESSAGE = "#statusMessage";

const CLICK_EVENT = "click";
const POINTER_EVENTS_AUTO = "auto";
const POINTER_EVENTS_NONE = "none";
const CURSOR_POINTER = "pointer";
const CURSOR_DEFAULT = "default";

/**
 * Utility class for random number and color generation, and status message handling.
 */
class Utility {
  /**
   * Returns a random integer between min and max (inclusive).
   * @param {number} min - Minimum value (inclusive).
   * @param {number} max - Maximum value (inclusive).
   * @returns {number} Random integer between min and max.
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a random HSL color string.
   * @returns {string} Random HSL color.
   */
  static randomColor() {
    const hue = Utility.randomInt(HUE_MIN, HUE_MAX);
    const saturation = Utility.randomInt(SATURATION_MIN, SATURATION_MAX);
    const lightness = Utility.randomInt(LIGHTNESS_MIN, LIGHTNESS_MAX);
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }

  /**
   * Sets the status message in the UI.
   * @param {string} message - Message to display.
   */
  static setMessage(message) {
    this.statusMessage.textContent = message;
  }
}

/**
 * Represents a memory game button.
 */
class MemoryButton {
  /**
   * Constructs a MemoryButton instance.
   * @param {number} order - Button's original order label.
   */
  constructor(order) {
    this.id = order;
    this.order = order;
    this.color = Utility.randomColor();
    this.element = document.createElement(ELEMENT_TYPE_BUTTON);
    this.element.type = ELEMENT_TYPE_BUTTON;
    this.element.className = CLASS_MEMORY_BUTTON;
    this.element.style.backgroundColor = this.color;
    this.element.textContent = order;
    this.element.dataset.order = order;
    this.width = INITIAL_WIDTH;
    this.height = INITIAL_HEIGHT;
  }

  /**
   * Appends the button to the parent element and stores its dimensions.
   * @param {HTMLElement} container - Parent DOM element.
   */
  placeButton(container) {
    container.appendChild(this.element);
    const rect = this.element.getBoundingClientRect(); // returns the size and position of an element relative to the viewport (browser window).
    this.width = rect.width;
    this.height = rect.height;
  }

  /**
   * Positions the button randomly within the given container rectangle.
   * Ensures the button stays fully inside the container.
   * @param {DOMRect} btnContainer - Bounding rectangle of the container.
   */
  setPositionWithin(btnContainer) {
    const maxLeft = Math.max(0, btnContainer.width - this.width);
    const maxTop = Math.max(0, btnContainer.height - this.height);
    const left = Utility.randomInt(0, Math.floor(maxLeft));
    const top = Utility.randomInt(0, Math.floor(maxTop));
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  /**
   * Reveals the button's number visually.
   */
  showNumber() {
    this.element.classList.remove(CLASS_HIDDEN_NUMBER);
    this.element.classList.add(CLASS_REVEALED);
    this.element.textContent = this.order;
  }

  /**
   * Hides the button's number visually (for gameplay).
   */
  hideNumber() {
    this.element.classList.add(CLASS_HIDDEN_NUMBER);
    this.element.textContent = this.order; // keep accessible label (screen readers) via aria if needed
  }

  /**
   * Marks the button as correct (for styling).
   */
  markCorrect() {
    this.element.classList.add(CLASS_CORRECT);
  }

  /**
   * Marks the button as wrong (for styling).
   */
  markWrong() {
    this.element.classList.add(CLASS_WRONG);
  }

  /**
   * Enables or disables pointer events for the button.
   * @param {boolean} enable - Whether to enable pointer events.
   */
  enablePointer(enable) {
    this.element.style.pointerEvents = enable ? POINTER_EVENTS_AUTO : POINTER_EVENTS_NONE;
    this.element.style.cursor = enable ? CURSOR_POINTER : CURSOR_DEFAULT;
  }
}

/**
 * Controls the memory game logic and state.
 */
class GameManager {
  /**
   * Creates and places memory buttons on the board.
   * @param {number} buttonCount - Number of buttons to create.
   * @returns {MemoryButton[]} Array of created MemoryButton instances.
   */
  createAndPlaceButtons(buttonCount) {
    const btns = [];
    for (let i = 1; i <= buttonCount; i++) {
      const btn = new MemoryButton(i);
      btns.push(btn);
    }
    btns.forEach((btnEl) => btnEl.placeButton(this.buttonContainer));
    return btns;
  }

  /**
   * Arranges buttons in rows within the board container.
   * @param {MemoryButton[]} btns - Array of MemoryButton instances.
   */
  layoutButtons(btns) {
    const boardRectangle = this.buttonContainer.getBoundingClientRect();
    const btnSpacing = INITIAL_BUTTON_SPACING;
    let x = btnSpacing;
    let y = btnSpacing;
    const rowHeight = btns.length > 0 ? btns[0].height : 0;
    for (const b of btns) {
      if (x + b.width > boardRectangle.width - btnSpacing) {
        x = btnSpacing;
        y += rowHeight + btnSpacing;
      }
      b.element.style.left = `${x}px`;
      b.element.style.top = `${y}px`;
      x += b.width + btnSpacing;
    }
  }
  /**
   * Initializes the game manager.
   * @param {HTMLElement} buttonContainer - Container for buttons.
   * @param {HTMLElement} statusMessage - Status message element.
   */
  constructor(buttonContainer, statusMessage) {
    this.buttonContainer = buttonContainer;
    this.statusMessage = statusMessage;
    this.buttons = []; // holds button objects
    this.originalOrder = [];
    this.expectedIndex = 0;
    this.isInProgress = false;
    Utility.statusMessage = statusMessage;
    this.scrambleTimer = null;
    this.scrambleTimeout = null;
  }

  /**
   * Resets the game state and UI.
   */
  gameReset() {
    if (this.scrambleTimer) {
      clearInterval(this.scrambleTimer);
      this.scrambleTimer = null;
    }
    if (this.scrambleTimeout) {
      clearTimeout(this.scrambleTimeout);
      this.scrambleTimeout = null;
    }
    this.buttonContainer.innerHTML = "";
    this.buttons.length = 0;
    this.originalOrder.length = 0;
    this.expectedIndex = 0;
    this.isInProgress = false;
    Utility.setMessage(window.MESSAGES.RESET_DONE);
  }

  /**
   * Starts a new game with the specified number of buttons.
   * @param {number} buttonCount - Number of buttons to create.
   */
  gameStart(buttonCount) {
    this.gameReset();
    Utility.setMessage(window.MESSAGES.STARTING(buttonCount));
    this.isInProgress = true;

    // Create and layout buttons
    const btns = this.createAndPlaceButtons(buttonCount);
    this.layoutButtons(btns);

    this.buttons = btns;
    this.originalOrder = btns.map((b) => b.order);

    const showSeconds = buttonCount;
    Utility.setMessage(window.MESSAGES.SHOWING_ORDER(showSeconds));

    this.scrambleTimeout = setTimeout(() => {
      let count = 0;
      const total = buttonCount;
      this.scrambleTimer = setInterval(() => {
        count++;
        const rect = this.buttonContainer.getBoundingClientRect();
        for (const b of this.buttons) {
          b.setPositionWithin(rect);
        }
        if (count >= total) {
          clearInterval(this.scrambleTimer);
          this.scrambleTimer = null;
          if (this.scrambleTimeout) {
            clearTimeout(this.scrambleTimeout);
            this.scrambleTimeout = null;
          }
          this.enablePlay();
        } else {
          Utility.setMessage(window.MESSAGES.SCRAMBLING(count, total));
        }
      }, 2000);
    }, showSeconds * 1000);
  }

  /**
   * Enables gameplay after scrambling is complete.
   * Hides button numbers and sets up click handlers.
   */
  enablePlay() {
    // Hide numbers and allow clicking
    for (const b of this.buttons) {
      b.hideNumber();
      b.enablePointer(true);
      b.element.onclick = () => this.handleClick(b);
    }
    this.expectedIndex = 0;
    Utility.setMessage(window.MESSAGES.CLICK_IN_ORDER);
    this.isInProgress = false; // Scrambling done; now gameplay stage
  }

  /**
   * Handles a button click during gameplay.
   * Checks if the clicked button is correct, updates UI, and ends game on mistake.
   * @param {MemoryButton} b - The clicked MemoryButton instance.
   */
  handleClick(b) {
    const expectedId = this.originalOrder[this.expectedIndex]; // 1..n
    if (b.id === expectedId) {
      b.showNumber();
      b.markCorrect();
      b.enablePointer(false);
      this.expectedIndex++;

      Utility.setMessage(
        window.MESSAGES.CORRECT_SO_FAR(this.expectedIndex, this.originalOrder.length)
      );
      if (this.expectedIndex === this.originalOrder.length) {
        Utility.setMessage(window.MESSAGES.ALL_CORRECT);
        // Lock remaining
        for (const x of this.buttons) x.enablePointer(false);
      }
    } else {
      // Wrong — reveal all and end
      Utility.setMessage(window.MESSAGES.WRONG_ORDER);
      for (const x of this.buttons) {
        x.showNumber();
        if (x === b) x.markWrong();
        x.enablePointer(false);
      }
    }
  }
}

/**
 * Initializes the game UI and event listeners when the DOM is loaded.
 */
window.addEventListener(EVENT_DOM_CONTENT_LOADED, () => {
  const countLabel = document.querySelector(ID_COUNT_LABEL);
  if (countLabel) countLabel.textContent = window.MESSAGES.LABEL_COUNT;

  const numButtons = document.querySelector(ID_NUM_OF_BUTTONS);
  const goButton = document.querySelector(ID_GO_BUTTON);
  const buttonContainer = document.querySelector(ID_BUTTON_CONTAINER);
  const statusMessage = document.querySelector(ID_STATUS_MESSAGE);

  const game = new GameManager(buttonContainer, statusMessage);

  const validateNumberOfButtons = () => {
    const numberInput = Number(numButtons.value);
    return Number.isInteger(numberInput) && numberInput >= 3 && numberInput <= 7
      ? numberInput
      : null;
  };

  goButton.addEventListener(CLICK_EVENT, () => {
    const buttonCount = validateNumberOfButtons();
    if (buttonCount === null) {
      statusMessage.textContent = window.MESSAGES.ERR_COUNT_RANGE;
      return;
    }

    statusMessage.textContent = window.MESSAGES.CLEARED;
    game.gameStart(buttonCount);
  });
});
