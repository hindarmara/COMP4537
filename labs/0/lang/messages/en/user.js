/* ChatGPT used. */

const MESSAGES = Object.freeze({
  LABEL_COUNT: "How many buttons to create? (min 3, max 7)",
  ERR_COUNT_RANGE: "Enter a number between 3 and 7.",
  STARTING: (n) => `Creating ${n} buttons…`,
  SHOWING_ORDER: (n) => `Showing original order for ${n} second${n === 1 ? "" : "s"}…`,
  SCRAMBLING: (done, total) => `Scrambling ${done}/${total}…`,
  CLICK_IN_ORDER: "Now click buttons in the original order.",
  CORRECT_SO_FAR: (k, n) => `Good — ${k}/${n} correct so far…`,
  ALL_CORRECT: "Excellent memory!",
  WRONG_ORDER: "Wrong order! Revealing the correct order…",
  RESET_DONE: "Game reset.",
  CLEARED: "Cleared previous game.",
});

window.MESSAGES = MESSAGES;
