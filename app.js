// Note class for managing individual notes
// This class represents a single note with properties for title, content, tags, and timestamps
// It includes methods for updating content and tags, serializing to JSON, and deserializing from JSON

class Note {
    constructor(title, content, tags = [], id = null) {
        this.id = id || Date.now();
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    updateContent(newContent) {
        this.content = newContent;
        this.updatedAt = new Date();
    }

    updateTags(newTags) {
        this.tags = newTags.split(',').map(tag => tag.trim());
        this.updatedAt = new Date();
    }

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(json) {
        const obj = JSON.parse(json);
        const note = new Note(
            obj.title,
            obj.content,
            Array.isArray(obj.tags) ? obj.tags : obj.tags.split(',').map(tag => tag.trim()),
            obj.id
        );
        note.createdAt = new Date(obj.createdAt);
        note.updatedAt = new Date(obj.updatedAt);
        return note;
    }
}

// Note Manager for handling collections of notes
class NoteManager {
    constructor() {
        this.notes = [];
        this.loadNotes();
    }

    addNote(note) {
        this.notes.push(note);
        this.saveNotes();
    }

    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes.map(note => note.serialize())));
    }

    loadNotes() {
        const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
        this.notes = savedNotes.map(Note.deserialize);
    }

    getAllNotes() {
        return this.notes;
    }
}

// DOM Manipulation for the UI
const noteManager = new NoteManager();
const notesContainer = document.getElementById('notes');
const editor = document.getElementById('note-editor');
const newNoteBtn = document.getElementById('newNoteBtn');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const noteTagsInput = document.getElementById('note-tags');

function renderNotes() {
    notesContainer.innerHTML = '';
    noteManager.getAllNotes().forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        noteDiv.innerHTML = `<h3>${note.title}</h3><p>${note.content}</p><small>Tags: ${note.tags.join(', ')}</small>`;
        notesContainer.appendChild(noteDiv);
    });
}

newNoteBtn.addEventListener('click', () => {
    editor.classList.remove('hidden');
});

cancelNoteBtn.addEventListener('click', () => {
    editor.classList.add('hidden');
});

saveNoteBtn.addEventListener('click', () => {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const tags = noteTagsInput.value.trim();

    if (title && content) {
        // Convert tags string to array
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        const note = new Note(title, content, tagsArray);
        noteManager.addNote(note);
        renderNotes();
        editor.classList.add('hidden');
        noteTitleInput.value = '';
        noteContentInput.value = '';
        noteTagsInput.value = '';
    }
});



renderNotes();
