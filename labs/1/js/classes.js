class Utility {
  static time() {
    return new Date().toLocaleString();
  }

  static generateId() {
    return "n-" + crypto.randomUUID();
  }
}

class Note {
  constructor(body) {
    this.id = Utility.generateId();
    this.body = body;
    this.modified = Utility.time();
  }

  updateBody(newBody) {
    this.body = newBody;
    this.modified = Utility.time();
  }
}

class NoteApp {
  constructor() {
    this.notes = [];
  }

  addNote(note) {
    this.notes.push(note);
  }

  removeNote(noteId) {
    this.notes = this.notes.filter((n) => n.id !== noteId);
  }

  getNotes() {
    return this.notes;
  }

  // updateNote(noteId, newBody) {
  //   console.log(noteId);
  //   const note = this.notes.find((n) => n.id === noteId);
  //   if (note) {
  //     note.updateBody(newBody);
  //   }
  // }
}
