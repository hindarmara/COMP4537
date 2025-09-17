class Note {
  constructor(body) {
    this.body = body;
    this.modified = new Date().toLocaleString();
  }

  updateBody(newBody) {
    this.body = newBody;
    this.modified = new Date().toLocaleString();
  }
}

class NoteApp {
  constructor() {
    this.notes = [];
  }

  addNote(note) {
    this.notes.push(note);
  }

  getNotes() {
    return this.notes;
  }
}
