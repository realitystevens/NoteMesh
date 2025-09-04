// NoteMesh Application - A Personal Knowledge Management System
// Built with Vanilla JavaScript and Object-Oriented Programming

class Note {
    constructor(title, content, tags = [], id = null) {
        this.id = id || this.generateId();
        this.title = title;
        this.content = content;
        this.tags = Array.isArray(tags) ? tags : this.parseTags(tags);
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.links = this.extractLinks(content);
        this.wordCount = this.calculateWordCount(content);
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    parseTags(tags) {
        if (typeof tags === 'string') {
            return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
        return tags || [];
    }

    extractLinks(content) {
        // Extract [[Note Title]] style links
        const linkRegex = /\[\[([^\]]+)\]\]/g;
        const links = [];
        let match;
        while ((match = linkRegex.exec(content)) !== null) {
            links.push(match[1].trim());
        }
        return [...new Set(links)]; // Remove duplicates
    }

    calculateWordCount(content) {
        return content.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    updateContent(newContent) {
        this.content = newContent;
        this.updatedAt = new Date();
        this.links = this.extractLinks(newContent);
        this.wordCount = this.calculateWordCount(newContent);
    }

    updateTitle(newTitle) {
        this.title = newTitle;
        this.updatedAt = new Date();
    }

    updateTags(newTags) {
        this.tags = this.parseTags(newTags);
        this.updatedAt = new Date();
    }

    serialize() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            tags: this.tags,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            links: this.links,
            wordCount: this.wordCount
        };
    }

    static deserialize(data) {
        const note = new Note(data.title, data.content, data.tags, data.id);
        note.createdAt = new Date(data.createdAt);
        note.updatedAt = new Date(data.updatedAt);
        note.links = data.links || [];
        note.wordCount = data.wordCount || 0;
        return note;
    }

    matches(query) {
        const searchTerm = query.toLowerCase();
        return (
            this.title.toLowerCase().includes(searchTerm) ||
            this.content.toLowerCase().includes(searchTerm) ||
            this.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
}

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

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('notemesh_theme') || 'light';
        this.applyTheme(this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('notemesh_theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.updateThemeToggleIcon(theme);
    }

    updateThemeToggleIcon(theme) {
        const sunIcon = document.querySelector('.theme-icon.sun');
        const moonIcon = document.querySelector('.theme-icon.moon');
        
        if (theme === 'dark') {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }
}

class UIManager {
    constructor(noteManager, themeManager) {
        this.noteManager = noteManager;
        this.themeManager = themeManager;
        this.currentView = 'notes';
        this.currentLayout = 'list';
        this.currentSort = 'updated';
        this.currentFilter = '';
        this.searchQuery = '';
        this.currentEditingNote = null;

        this.initializeElements();
        this.bindEvents();
        this.setupNoteManagerListeners();
        this.hideLoadingScreen();
        this.render();
    }

    initializeElements() {
        // Main elements
        this.app = document.getElementById('app');
        this.loadingScreen = document.getElementById('loading-screen');
        
        // Navigation
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.views = document.querySelectorAll('.view');
        
        // Search
        this.globalSearch = document.getElementById('global-search');
        this.searchResults = document.getElementById('search-results');
        
        // Theme toggle
        this.themeToggle = document.getElementById('theme-toggle');
        
        // Buttons
        this.newNoteBtn = document.getElementById('new-note-btn');
        this.newNoteSidebarBtn = document.getElementById('new-note-sidebar');
        this.randomNoteBtn = document.getElementById('random-note');
        
        // Controls
        this.sortSelect = document.getElementById('sort-select');
        this.tagFilter = document.getElementById('tag-filter');
        this.viewToggles = document.querySelectorAll('.view-toggle');
        
        // Containers
        this.notesContainer = document.getElementById('notes-container');
        this.graphContainer = document.getElementById('graph-container');
        this.tagsContainer = document.getElementById('tags-container');
        this.recentNotesContainer = document.getElementById('recent-notes');
        
        // Stats
        this.totalNotesEl = document.getElementById('total-notes');
        this.totalTagsEl = document.getElementById('total-tags');
        this.totalWordsEl = document.getElementById('total-words');
        
        // Modals
        this.noteEditorModal = document.getElementById('note-editor-modal');
        this.noteDetailModal = document.getElementById('note-detail-modal');
        
        // Editor elements
        this.editorTitle = document.getElementById('editor-title');
        this.noteTitleInput = document.getElementById('note-title');
        this.noteContentInput = document.getElementById('note-content');
        this.noteTagsInput = document.getElementById('note-tags');
        this.suggestedTags = document.getElementById('suggested-tags');
        this.saveNoteBtn = document.getElementById('save-note');
        this.cancelEditorBtn = document.getElementById('cancel-editor');
        this.closeEditorBtn = document.getElementById('close-editor');
        
        // Detail elements
        this.detailTitle = document.getElementById('detail-title');
        this.detailCreated = document.getElementById('detail-created');
        this.detailUpdated = document.getElementById('detail-updated');
        this.detailContent = document.getElementById('detail-content');
        this.detailTags = document.getElementById('detail-tags');
        this.linkedNotesEl = document.getElementById('linked-notes');
        this.editNoteBtn = document.getElementById('edit-note');
        this.deleteNoteBtn = document.getElementById('delete-note');
        this.closeDetailBtn = document.getElementById('close-detail');
        
        // Notification
        this.notification = document.getElementById('notification');
        this.notificationText = document.querySelector('.notification-text');
    }

    bindEvents() {
        // Navigation
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.themeManager.toggleTheme();
        });

        // New note buttons
        this.newNoteBtn.addEventListener('click', () => this.openNoteEditor());
        this.newNoteSidebarBtn.addEventListener('click', () => this.openNoteEditor());

        // Random note
        this.randomNoteBtn.addEventListener('click', () => this.openRandomNote());

        // Search
        this.globalSearch.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.globalSearch.addEventListener('focus', () => {
            if (this.searchQuery) {
                this.searchResults.classList.remove('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.globalSearch.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.searchResults.classList.add('hidden');
            }
        });

        // Controls
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderNotes();
        });

        this.tagFilter.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderNotes();
        });

        this.viewToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.switchLayout(e.target.dataset.layout);
            });
        });

        // Editor events
        this.saveNoteBtn.addEventListener('click', () => this.saveNote());
        this.cancelEditorBtn.addEventListener('click', () => this.closeNoteEditor());
        this.closeEditorBtn.addEventListener('click', () => this.closeNoteEditor());

        // Detail events
        this.editNoteBtn.addEventListener('click', () => this.editCurrentNote());
        this.deleteNoteBtn.addEventListener('click', () => this.deleteCurrentNote());
        this.closeDetailBtn.addEventListener('click', () => this.closeNoteDetail());

        // Tags input suggestions
        this.noteTagsInput.addEventListener('input', (e) => {
            this.showTagSuggestions(e.target.value);
        });

        // Modal close on backdrop click
        this.noteEditorModal.addEventListener('click', (e) => {
            if (e.target === this.noteEditorModal) {
                this.closeNoteEditor();
            }
        });

        this.noteDetailModal.addEventListener('click', (e) => {
            if (e.target === this.noteDetailModal) {
                this.closeNoteDetail();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupNoteManagerListeners() {
        this.noteManager.on('notesChanged', () => {
            this.render();
        });

        this.noteManager.on('noteAdded', (note) => {
            this.showNotification(`Note "${note.title}" created successfully!`);
        });

        this.noteManager.on('noteUpdated', (note) => {
            this.showNotification(`Note "${note.title}" updated successfully!`);
        });

        this.noteManager.on('noteDeleted', (data) => {
            this.showNotification(`Note "${data.note.title}" deleted successfully!`);
        });
    }

    hideLoadingScreen() {
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
        }, 1000);
    }

    render() {
        this.updateStats();
        this.updateTagFilter();
        this.renderRecentNotes();
        
        if (this.currentView === 'notes') {
            this.renderNotes();
        } else if (this.currentView === 'tags') {
            this.renderTags();
        } else if (this.currentView === 'graph') {
            this.renderGraph();
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update nav buttons
        this.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update views
        this.views.forEach(viewEl => {
            viewEl.classList.toggle('active', viewEl.id === `${view}-view`);
        });
        
        this.render();
    }

    switchLayout(layout) {
        this.currentLayout = layout;
        
        // Update toggle buttons
        this.viewToggles.forEach(toggle => {
            toggle.classList.toggle('active', toggle.dataset.layout === layout);
        });
        
        // Update container class
        this.notesContainer.className = `notes-container ${layout}-layout`;
        
        this.renderNotes();
    }

    handleSearch(query) {
        this.searchQuery = query;
        
        if (query.trim()) {
            const results = this.noteManager.searchNotes(query);
            this.renderSearchResults(results);
            this.searchResults.classList.remove('hidden');
        } else {
            this.searchResults.classList.add('hidden');
        }
        
        if (this.currentView === 'notes') {
            this.renderNotes();
        }
    }

    renderSearchResults(results) {
        this.searchResults.innerHTML = '';
        
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            return;
        }
        
        results.slice(0, 5).forEach(note => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="search-result-title">${this.escapeHtml(note.title)}</div>
                <div class="search-result-content">${this.escapeHtml(note.content.substring(0, 100))}...</div>
            `;
            item.addEventListener('click', () => {
                this.openNoteDetail(note.id);
                this.searchResults.classList.add('hidden');
            });
            this.searchResults.appendChild(item);
        });
    }

    updateStats() {
        const notes = this.noteManager.getAllNotes();
        const tags = this.noteManager.getAllTags();
        const totalWords = notes.reduce((sum, note) => sum + note.wordCount, 0);
        
        this.totalNotesEl.textContent = notes.length;
        this.totalTagsEl.textContent = tags.length;
        this.totalWordsEl.textContent = totalWords.toLocaleString();
    }

    updateTagFilter() {
        const tags = this.noteManager.getAllTags();
        const currentValue = this.tagFilter.value;
        
        this.tagFilter.innerHTML = '<option value="">All Tags</option>';
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            if (tag === currentValue) {
                option.selected = true;
            }
            this.tagFilter.appendChild(option);
        });
    }

    renderRecentNotes() {
        const recentNotes = this.noteManager.getRecentNotes(5);
        this.recentNotesContainer.innerHTML = '';
        
        recentNotes.forEach(note => {
            const item = document.createElement('div');
            item.className = 'recent-note';
            item.innerHTML = `
                <div class="recent-note-title">${this.escapeHtml(note.title)}</div>
                <div class="recent-note-date">${this.formatDate(note.updatedAt)}</div>
            `;
            item.addEventListener('click', () => this.openNoteDetail(note.id));
            this.recentNotesContainer.appendChild(item);
        });
    }

    renderNotes() {
        let notes = this.searchQuery 
            ? this.noteManager.searchNotes(this.searchQuery)
            : this.noteManager.getAllNotes();
        
        if (this.currentFilter) {
            notes = notes.filter(note => note.tags.includes(this.currentFilter));
        }
        
        notes = this.noteManager.sortNotes(this.currentSort, false);
        
        this.notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            this.notesContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No notes found</h3>
                    <p>Create your first note to get started!</p>
                    <button class="primary-btn" onclick="app.openNoteEditor()">
                        <span class="material-icons btn-icon">add</span>
                        Create Note
                    </button>
                </div>
            `;
            return;
        }
        
        notes.forEach(note => {
            const noteEl = this.createNoteElement(note);
            this.notesContainer.appendChild(noteEl);
        });
    }

    createNoteElement(note) {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-card';
        noteEl.innerHTML = `
            <div class="note-card-header">
                <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                <div class="note-actions">
                    <button class="note-action" onclick="app.openNoteEditor('${note.id}')" title="Edit">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="note-action danger" onclick="app.deleteNote('${note.id}')" title="Delete">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
            <div class="note-content">${this.escapeHtml(note.content)}</div>
            <div class="note-tags">
                ${note.tags.map(tag => `<span class="tag" onclick="app.filterByTag('${tag}')">${this.escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="note-meta">
                <span class="meta-item">
                    <span class="material-icons">schedule</span>
                    ${this.formatDate(note.updatedAt)}
                </span>
                <span class="meta-item">
                    <span class="material-icons">description</span>
                    ${note.wordCount} words
                </span>
            </div>
        `;
        
        noteEl.addEventListener('click', (e) => {
            if (!e.target.closest('.note-actions')) {
                this.openNoteDetail(note.id);
            }
        });
        
        return noteEl;
    }

    renderTags() {
        const tagUsage = this.noteManager.getTagUsageCount();
        this.tagsContainer.innerHTML = '';
        
        if (tagUsage.size === 0) {
            this.tagsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No tags found</h3>
                    <p>Add tags to your notes to see them here!</p>
                </div>
            `;
            return;
        }
        
        Array.from(tagUsage.entries())
            .sort((a, b) => b[1] - a[1])
            .forEach(([tag, count]) => {
                const tagEl = document.createElement('div');
                tagEl.className = 'tag-group';
                
                const notes = this.noteManager.getNotesWithTag(tag);
                tagEl.innerHTML = `
                    <h3 class="tag-group-title">${this.escapeHtml(tag)}</h3>
                    <div class="tag-group-count">${count} note${count !== 1 ? 's' : ''}</div>
                    <div class="tag-group-notes">
                        ${notes.slice(0, 5).map(note => `
                            <a href="#" class="tag-group-note" onclick="app.openNoteDetail('${note.id}'); return false;">
                                ${this.escapeHtml(note.title)}
                            </a>
                        `).join('')}
                        ${notes.length > 5 ? `<div class="tag-group-more">+${notes.length - 5} more</div>` : ''}
                    </div>
                `;
                
                this.tagsContainer.appendChild(tagEl);
            });
    }

    renderGraph() {
        // Graph rendering will be handled by graph.js
        if (window.GraphRenderer) {
            const graphRenderer = new GraphRenderer(this.graphContainer, this.noteManager);
            graphRenderer.render();
        } else {
            this.graphContainer.innerHTML = `
                <div class="graph-placeholder">
                    <h3>Graph View</h3>
                    <p>Graph visualization is loading...</p>
                </div>
            `;
        }
    }

    openNoteEditor(noteId = null) {
        this.currentEditingNote = noteId;
        
        if (noteId) {
            const note = this.noteManager.getNote(noteId);
            if (note) {
                this.editorTitle.textContent = 'Edit Note';
                this.noteTitleInput.value = note.title;
                this.noteContentInput.value = note.content;
                this.noteTagsInput.value = note.tags.join(', ');
            }
        } else {
            this.editorTitle.textContent = 'New Note';
            this.noteTitleInput.value = '';
            this.noteContentInput.value = '';
            this.noteTagsInput.value = '';
        }
        
        this.noteEditorModal.classList.remove('hidden');
        this.noteTitleInput.focus();
    }

    closeNoteEditor() {
        this.noteEditorModal.classList.add('hidden');
        this.currentEditingNote = null;
        this.suggestedTags.classList.remove('show');
    }

    saveNote() {
        const title = this.noteTitleInput.value.trim();
        const content = this.noteContentInput.value.trim();
        const tags = this.noteTagsInput.value.trim();
        
        if (!title || !content) {
            this.showNotification('Please enter both title and content', 'error');
            return;
        }
        
        if (this.currentEditingNote) {
            // Update existing note
            this.noteManager.updateNote(this.currentEditingNote, {
                title,
                content,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : []
            });
        } else {
            // Create new note
            const note = new Note(title, content, tags);
            this.noteManager.addNote(note);
        }
        
        this.closeNoteEditor();
    }

    openNoteDetail(noteId) {
        const note = this.noteManager.getNote(noteId);
        if (!note) return;
        
        this.detailTitle.textContent = note.title;
        this.detailCreated.textContent = this.formatDate(note.createdAt);
        this.detailUpdated.textContent = this.formatDate(note.updatedAt);
        this.detailContent.innerHTML = this.renderNoteContent(note.content);
        
        // Render tags
        this.detailTags.innerHTML = note.tags.map(tag => 
            `<span class="tag" onclick="app.filterByTag('${tag}')">${this.escapeHtml(tag)}</span>`
        ).join('');
        
        // Render linked notes
        const backlinks = this.noteManager.getBacklinks(note.title);
        if (backlinks.length > 0) {
            this.linkedNotesEl.innerHTML = `
                <h3>Linked Notes</h3>
                ${backlinks.map(linkedNote => `
                    <a href="#" class="linked-note" onclick="app.openNoteDetail('${linkedNote.id}'); return false;">
                        ${this.escapeHtml(linkedNote.title)}
                    </a>
                `).join('')}
            `;
        } else {
            this.linkedNotesEl.innerHTML = '';
        }
        
        // Set up action buttons
        this.editNoteBtn.onclick = () => this.openNoteEditor(noteId);
        this.deleteNoteBtn.onclick = () => this.deleteNote(noteId);
        
        this.noteDetailModal.classList.remove('hidden');
    }

    closeNoteDetail() {
        this.noteDetailModal.classList.add('hidden');
    }

    editCurrentNote() {
        const noteId = this.editNoteBtn.onclick.toString().match(/'([^']+)'/)?.[1];
        if (noteId) {
            this.closeNoteDetail();
            this.openNoteEditor(noteId);
        }
    }

    deleteCurrentNote() {
        const noteId = this.deleteNoteBtn.onclick.toString().match(/'([^']+)'/)?.[1];
        if (noteId) {
            this.deleteNote(noteId);
            this.closeNoteDetail();
        }
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.noteManager.deleteNote(noteId);
        }
    }

    filterByTag(tag) {
        this.currentFilter = tag;
        this.tagFilter.value = tag;
        this.switchView('notes');
        this.renderNotes();
    }

    openRandomNote() {
        const randomNote = this.noteManager.getRandomNote();
        if (randomNote) {
            this.openNoteDetail(randomNote.id);
        } else {
            this.showNotification('No notes available', 'info');
        }
    }

    showTagSuggestions(input) {
        const existingTags = this.noteManager.getAllTags();
        const currentTags = input.split(',').map(tag => tag.trim().toLowerCase());
        const lastTag = currentTags[currentTags.length - 1];
        
        if (lastTag && lastTag.length > 0) {
            const suggestions = existingTags.filter(tag => 
                tag.toLowerCase().includes(lastTag) && 
                !currentTags.slice(0, -1).includes(tag.toLowerCase())
            );
            
            if (suggestions.length > 0) {
                this.suggestedTags.innerHTML = suggestions.map(tag => 
                    `<div class="suggested-tag" onclick="app.selectSuggestedTag('${tag}')">${this.escapeHtml(tag)}</div>`
                ).join('');
                this.suggestedTags.classList.add('show');
            } else {
                this.suggestedTags.classList.remove('show');
            }
        } else {
            this.suggestedTags.classList.remove('show');
        }
    }

    selectSuggestedTag(tag) {
        const currentValue = this.noteTagsInput.value;
        const tags = currentValue.split(',').map(t => t.trim());
        tags[tags.length - 1] = tag;
        this.noteTagsInput.value = tags.join(', ') + ', ';
        this.suggestedTags.classList.remove('show');
        this.noteTagsInput.focus();
    }

    renderNoteContent(content) {
        // Convert [[Note Title]] links to clickable links
        return content.replace(/\[\[([^\]]+)\]\]/g, (match, noteTitle) => {
            const linkedNote = this.noteManager.getAllNotes().find(note => 
                note.title.toLowerCase() === noteTitle.toLowerCase()
            );
            
            if (linkedNote) {
                return `<a href="#" class="note-link" onclick="app.openNoteDetail('${linkedNote.id}'); return false;">${this.escapeHtml(noteTitle)}</a>`;
            } else {
                return `<span class="note-link-missing" title="Note not found">${this.escapeHtml(noteTitle)}</span>`;
            }
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: New note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.openNoteEditor();
        }
        
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.globalSearch.focus();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            if (!this.noteEditorModal.classList.contains('hidden')) {
                this.closeNoteEditor();
            } else if (!this.noteDetailModal.classList.contains('hidden')) {
                this.closeNoteDetail();
            }
        }
    }

    showNotification(message, type = 'success') {
        this.notificationText.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.classList.remove('hidden');
        
        setTimeout(() => {
            this.notification.classList.add('hidden');
        }, 3000);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const noteManager = new NoteManager();
    const themeManager = new ThemeManager();
    window.app = new UIManager(noteManager, themeManager);
});

// Export for external access
window.NoteMesh = {
    Note,
    NoteManager,
    ThemeManager,
    UIManager
};
