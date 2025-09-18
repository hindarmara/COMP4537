// Part of this code is written with AI assistance

const DELAY_IN_MS = 2000;
const READER_TITLE = "Lab 1 – Reader";
const WRITER_TITLE = "Lab 1 – Writer";
const STORAGE_KEY = "notes";
const WRITER_MODE = "writer";
const READER_MODE = "reader";

class NotesAppUI {
  /**
   * Creates an instance of the UI for the note application.
   * Initializes the UI based on the provided mode (WRITER_MODE or READER_MODE).
   * Loads notes, sets up event listeners, and manages auto-save or auto-refresh functionality.
   *
   * @param {NoteApp} noteApp - The note application instance containing notes and related methods.
   * @param {string} mode - The mode of the UI, either WRITER_MODE or READER_MODE.
   */
  constructor(noteApp, mode) {
    this.noteApp = noteApp;
    this.notesContainer = document.getElementById("notesContainer");
    this.saveStatus = document.getElementById("saveStatus");
    this.mode = mode;

    this.loadNotes();

    switch (mode) {
      case WRITER_MODE:
        this.renderWriter();
        this.initializeEventListeners();
        this.saveNotes();
        this.lastSavedData = JSON.stringify(this.noteApp.getNotes());
        setInterval(() => this.autoSave(), DELAY_IN_MS);
        break;

      case READER_MODE:
        this.renderReader();
        setInterval(() => this.renderReader(), DELAY_IN_MS);
        break;

      default:
        console.log(`Unknown mode: ${mode}`);
    }
  }

  /**
   * Builds a DOM element representing a note card.
   * Creates different UI elements based on the current mode (writer/reader).
   * In writer mode, includes a textarea and remove button.
   * In reader mode, displays note content as read-only text.
   *
   * @param {Note} note - The note object containing the note data.
   * @param {number} index - The index of the note in the notes array.
   * @returns {HTMLElement} A div element containing the complete note card.
   */
  buildNoteCard(note, index) {
    const col = document.createElement("div");
    col.className = "col";

    const card = document.createElement("article");
    card.className = "card shadow-sm h-100";

    const body = document.createElement("div");
    body.className = "card-body";

    if (this.mode === WRITER_MODE) {
      const textArea = document.createElement("textarea");
      textArea.className = "form-control mb-2";
      textArea.setAttribute("data-idx", String(index));
      textArea.value = note.body ?? "";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-danger btn-sm mt-2";
      btn.setAttribute("data-remove-idx", String(index));
      btn.textContent = window.MESSAGES.REMOVE_NOTE;

      body.append(textArea, btn);
    } else {
      const p = document.createElement("p");
      p.className = "card-text";
      p.textContent = note.body ?? "";
      body.appendChild(p);
    }

    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  /**
   * Renders the common UI elements for both writer and reader modes.
   * Clears the notes container and either displays an empty state message
   * or creates note cards for all existing notes using a document fragment for performance.
   */
  renderCommon() {
    const c = this.notesContainer;
    c.innerHTML = "";

    const notes = this.noteApp.getNotes();

    if (!notes.length) {
      const empty = document.createElement("div");
      empty.className = "text-center text-muted";
      empty.textContent = window.MESSAGES.EMPTY_PLACEHOLDER;
      c.appendChild(empty);
      return;
    }

    const documentFragment = document.createDocumentFragment();
    notes.forEach((note, index) => {
      const card = this.buildNoteCard(note, index);
      documentFragment.appendChild(card);
    });
    c.appendChild(documentFragment);
  }

  /**
   * Renders the UI for writer mode.
   * Calls renderCommon to display all notes with editable textareas and remove buttons.
   */
  renderWriter() {
    this.renderCommon();
  }

  /**
   * Renders the UI for reader mode.
   * Reloads notes from storage, updates the status display with retrieval time,
   * and calls renderCommon to display read-only note cards.
   */
  renderReader() {
    this.loadNotes();

    if (this.saveStatus) {
      this.saveStatus.textContent = `${
        window.MESSAGES.LAST_RETRIEVED_AT
      } ${new Date().toLocaleString()}`;
    }
    this.renderCommon();
  }

  /**
   * Saves the current notes to localStorage and updates the save status display.
   * Stores the notes array as JSON and shows the last saved timestamp to the user.
   */
  saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.noteApp.getNotes()));
    this.lastSaved = new Date().toLocaleString();
    this.saveStatus.textContent = `${window.MESSAGES.LAST_SAVED_AT} ${this.lastSaved}`;
  }

  /**
   * Automatically saves notes if there have been changes since the last save.
   * Compares current note data with the last saved state to avoid unnecessary saves.
   * Called periodically by setInterval in writer mode.
   */
  autoSave() {
    const currentData = JSON.stringify(this.noteApp.getNotes());
    if (currentData !== this.lastSavedData) {
      this.saveNotes();
      this.lastSavedData = currentData;
    }
  }

  /**
   * Loads notes from localStorage and deserializes them into Note objects.
   * If stored data exists, parses JSON and recreates Note instances.
   * Falls back to empty array if parsing fails or no data exists.
   */
  loadNotes() {
    const storedNotes = localStorage.getItem(STORAGE_KEY);
    console.log("Loaded from storage:", storedNotes);

    if (storedNotes) {
      try {
        const notesArray = JSON.parse(storedNotes);
        this.noteApp.notes = notesArray.map((n) => Object.assign(new Note(n.body), n));
      } catch {
        this.noteApp.notes = [];
      }
    }
  }

  /**
   * Sets up event listeners for writer mode functionality.
   * Handles add note button clicks, note removal, and textarea input changes.
   * Uses event delegation for dynamic note elements.
   */
  initializeEventListeners() {
    const addBtn = document.getElementById("addNoteBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const note = new Note("");
        this.noteApp.addNote(note);
        this.renderWriter();
        this.saveNotes();
      });
    }

    // Event listener for Remove button in writer mode
    this.notesContainer.addEventListener("click", (e) => {
      if (e.target.matches("button[data-remove-idx]")) {
        const idx = Number(e.target.getAttribute("data-remove-idx"));
        this.noteApp.notes.splice(idx, 1); // Remove by index
        this.renderWriter(); // Re-render after removal
        this.saveNotes(); // Update localStorage
      }
    });

    // Event listener for textarea input in writer mode
    this.notesContainer.addEventListener("input", (e) => {
      if (e.target.matches("textarea[data-idx]")) {
        const idx = Number(e.target.getAttribute("data-idx"));
        this.noteApp.notes[idx].updateBody(e.target.value);
        this.saveNotes();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // For index.html
  if (document.getElementById("appTitle")) {
    const $ = (s) => document.querySelector(s);
    $("#appTitle").textContent = window.MESSAGES.APP_TITLE;
    $("#openWriter").textContent = window.MESSAGES.OPEN_WRITER;
    $("#openReader").textContent = window.MESSAGES.OPEN_READER;
  }

  if (document.getElementById("year")) {
    const year = document.getElementById("year");
    if (year) {
      year.textContent = new Date().getFullYear();
    }
  }

  const pageTitle = document.title;
  const app = new NoteApp();
  const elementId = (elementId) => document.getElementById(elementId);

  if (pageTitle === WRITER_TITLE) {
    elementId("pageTitle").textContent = window.MESSAGES.WRITER_TITLE;
    elementId("addNoteBtn").textContent = window.MESSAGES.ADD_NOTE;
    elementId("backHome").textContent = window.MESSAGES.BACK_HOME;
    new NotesAppUI(app, WRITER_MODE);
  } else if (pageTitle === READER_TITLE) {
    elementId("pageTitle").textContent = window.MESSAGES.READER_TITLE;
    elementId("backHome").textContent = window.MESSAGES.BACK_HOME;
    new NotesAppUI(app, READER_MODE);
  }
});
