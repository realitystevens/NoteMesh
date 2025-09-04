/* Note Manager
   Handles all note operations, storage, and business logic
*/

class NoteManager {
    constructor() {
        this.notes = new Map();
        this.listeners = new Map();
        this.loadNotes();
    }

    addNote(note) {
        this.notes.set(note.id, note);
        this.saveNotes();
        this.emit('noteAdded', note);
        this.emit('notesChanged');
    }

    updateNote(id, updates) {
        const note = this.notes.get(id);
        if (!note) return false;

        Object.assign(note, updates);
        note.updatedAt = new Date();
        
        if (updates.content) {
            note.links = note.extractLinks(updates.content);
            note.wordCount = note.calculateWordCount(updates.content);
        }

        this.saveNotes();
        this.emit('noteUpdated', note);
        this.emit('notesChanged');
        return true;
    }

    deleteNote(id) {
        const note = this.notes.get(id);
        if (!note) return false;

        this.notes.delete(id);
        this.saveNotes();
        this.emit('noteDeleted', { id, note });
        this.emit('notesChanged');
        return true;
    }

    getNote(id) {
        return this.notes.get(id);
    }

    getAllNotes() {
        return Array.from(this.notes.values());
    }

    searchNotes(query) {
        if (!query.trim()) return this.getAllNotes();
        return this.getAllNotes().filter(note => note.matches(query));
    }

    getNotesWithTag(tag) {
        return this.getAllNotes().filter(note => 
            note.tags.some(noteTag => noteTag.toLowerCase() === tag.toLowerCase())
        );
    }

    getAllTags() {
        const tags = new Set();
        this.notes.forEach(note => {
            note.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }

    getTagUsageCount() {
        const tagCount = new Map();
        this.notes.forEach(note => {
            note.tags.forEach(tag => {
                tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
            });
        });
        return tagCount;
    }

    getLinkedNotes(noteTitle) {
        return this.getAllNotes().filter(note => 
            note.links.includes(noteTitle) || note.title === noteTitle
        );
    }

    getBacklinks(noteTitle) {
        return this.getAllNotes().filter(note => 
            note.links.includes(noteTitle) && note.title !== noteTitle
        );
    }

    sortNotes(criteria = 'updated', ascending = false) {
        const notes = this.getAllNotes();
        return notes.sort((a, b) => {
            let comparison = 0;
            switch (criteria) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'created':
                    comparison = a.createdAt - b.createdAt;
                    break;
                case 'updated':
                    comparison = a.updatedAt - b.updatedAt;
                    break;
                case 'wordCount':
                    comparison = a.wordCount - b.wordCount;
                    break;
                default:
                    comparison = a.updatedAt - b.updatedAt;
            }
            return ascending ? comparison : -comparison;
        });
    }

    getRecentNotes(limit = 5) {
        return this.sortNotes('updated', false).slice(0, limit);
    }

    getRandomNote() {
        const notes = this.getAllNotes();
        if (notes.length === 0) return null;
        return notes[Math.floor(Math.random() * notes.length)];
    }

    exportNotes() {
        const data = {
            notes: Array.from(this.notes.values()).map(note => note.serialize()),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    importNotes(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.notes && Array.isArray(data.notes)) {
                data.notes.forEach(noteData => {
                    const note = Note.deserialize(noteData);
                    this.notes.set(note.id, note);
                });
                this.saveNotes();
                this.emit('notesChanged');
                return true;
            }
        } catch (error) {
            console.error('Import failed:', error);
        }
        return false;
    }

    saveNotes() {
        try {
            const data = Array.from(this.notes.values()).map(note => note.serialize());
            localStorage.setItem('notemesh_notes', JSON.stringify(data));
            localStorage.setItem('notemesh_lastSaved', new Date().toISOString());
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    }

    loadNotes() {
        try {
            const data = localStorage.getItem('notemesh_notes');
            if (data) {
                const notesData = JSON.parse(data);
                notesData.forEach(noteData => {
                    const note = Note.deserialize(noteData);
                    this.notes.set(note.id, note);
                });
            }
        } catch (error) {
            console.error('Failed to load notes:', error);
        }
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NoteManager;
} else {
    window.NoteManager = NoteManager;
}
