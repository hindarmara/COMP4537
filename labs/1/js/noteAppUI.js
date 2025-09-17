// Part of this code is written with AI assistance

// const { element } = require("prop-types");

const TWO_SECONDS = 2000;
const READER_TITLE = "Lab 1 – Reader";
const WRITER_TITLE = "Lab 1 – Writer";
const STORAGE_KEY = "notes";
const WRITER_MODE = "writer";
const READER_MODE = "reader";

class NotesAppUI {
  constructor(noteApp, mode = WRITER_MODE) {
    this.noteApp = noteApp;
    this.notesContainer = document.getElementById("notesContainer");
    this.saveStatus = document.getElementById("saveStatus");
    this.mode = mode;

    // 1) Load BEFORE wiring events or saving
    this.loadNotes();

    // 2) Wire events after elements exist
    if (mode === WRITER_MODE) {
      this.initializeEventListeners();
      this.renderWriter();
      this.saveNotes();
      this.lastSavedData = JSON.stringify(this.noteApp.getNotes());
      setInterval(() => this.autoSave(), TWO_SECONDS);
    } else if (mode === READER_MODE) {
      this.renderReader();
      setInterval(() => this.renderReader(), TWO_SECONDS);
    }
  }

  buildNoteCard(note, index) {
    const col = document.createElement("div");
    col.className = "col";

    const card = document.createElement("article");
    card.className = "card shadow-sm h-100";

    const body = document.createElement("div");
    body.className = "card-body";

    if (this.mode === WRITER_MODE) {
      const textAreaElement = document.createElement("textarea");
      textAreaElement.className = "form-control mb-2";
      textAreaElement.setAttribute("data-idx", String(index));
      textAreaElement.value = note.body ?? "";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-danger btn-sm mt-2";
      btn.setAttribute("data-remove-idx", String(index));
      btn.textContent = window.MESSAGES.REMOVE_NOTE;

      body.append(textAreaElement, btn);
    } else {
      const p = document.createElement("p");
      p.className = "card-text";
      p.textContent = note.body ?? ""; // avoid HTML injection
      body.appendChild(p);
    }

    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

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

    const frag = document.createDocumentFragment();
    notes.forEach((note, index) => {
      const card = this.buildNoteCard(note, index);
      frag.appendChild(card);
    });
    c.appendChild(frag);
  }

  renderWriter() {
    this.renderCommon();
  }

  renderReader() {
    this.loadNotes(); // reload to get latest from storage

    if (this.saveStatus) {
      this.saveStatus.textContent = `${
        window.MESSAGES.LAST_RETRIEVED_AT
      } ${new Date().toLocaleString()}`;
    }
    this.renderCommon();
  }

  saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.noteApp.getNotes()));
    this.lastSaved = new Date().toLocaleString();
    this.saveStatus.textContent = `${window.MESSAGES.LAST_SAVED_AT} ${this.lastSaved}`;
  }

  autoSave() {
    const currentData = JSON.stringify(this.noteApp.getNotes());
    if (currentData !== this.lastSavedData) {
      this.saveNotes();
      this.lastSavedData = currentData;
    }
  }

  loadNotes() {
    const storedNotes = localStorage.getItem(STORAGE_KEY);
    console.log("Loaded from storage:", storedNotes);
    if (storedNotes) {
      try {
        const notesArray = JSON.parse(storedNotes);
        // Rehydrate Notes: keep Note methods by assigning saved fields onto a new Note
        this.noteApp.notes = notesArray.map((n) => Object.assign(new Note(n.body), n));
      } catch {
        this.noteApp.notes = [];
      }
    }
  }

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

    // Only attach if container has textareas/buttons (writer mode)
    this.notesContainer.addEventListener("click", (e) => {
      if (e.target.matches("button[data-remove-idx]")) {
        const idx = Number(e.target.getAttribute("data-remove-idx"));
        this.noteApp.notes.splice(idx, 1); // Remove by index
        this.renderWriter();
        this.saveNotes();
      }
    });

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
