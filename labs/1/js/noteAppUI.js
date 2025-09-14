// Part of this code is written with AI assistance

const TWO_SECONDS = 2000;
const READER_TITLE = "Lab 1 – Reader";
const WRITER_TITLE = "Lab 1 – Writer";
const STORAGE_KEY = "notes"; // keep this in sync with writer
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
      btn.setAttribute("data-remove", note.id);
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
    this.lastSaved = Utility.time();
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
    if (storedNotes) {
      try {
        const arr = JSON.parse(storedNotes);
        // Rehydrate Notes: keep Note methods by assigning saved fields onto a new Note
        this.noteApp.notes = arr.map((n) => Object.assign(new Note(n.body), n));
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
      if (e.target.matches("button[data-remove]")) {
        const id = e.target.getAttribute("data-remove");
        this.noteApp.removeNote(id);
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

  if (pageTitle === WRITER_TITLE) {
    document.getElementById("pageTitle").textContent = window.MESSAGES.WRITER_TITLE;
    document.getElementById("addNoteBtn").textContent = window.MESSAGES.ADD_NOTE;
    document.getElementById("backHome").textContent = window.MESSAGES.BACK_HOME;
    new NotesAppUI(app, WRITER_MODE);
  } else if (pageTitle === READER_TITLE) {
    document.getElementById("pageTitle").textContent = window.MESSAGES.READER_TITLE;
    document.getElementById("backHome").textContent = window.MESSAGES.BACK_HOME;
    new NotesAppUI(app, READER_MODE);
  }
});
