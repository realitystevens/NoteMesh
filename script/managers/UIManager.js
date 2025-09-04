/* UI Manager
   Handles all user interface interactions, rendering, and event management
*/

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
        
        // Mobile elements
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.mobileNavOverlay = document.getElementById('mobile-nav-overlay');
        this.closeMobileNavBtn = document.getElementById('close-mobile-nav');
        this.mobileNavButtons = document.querySelectorAll('.mobile-nav-btn');
        this.mobileNewNoteBtn = document.getElementById('mobile-new-note');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
    }

    bindEvents() {
        // Navigation
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Theme toggle
        this.themeToggle?.addEventListener('click', () => {
            this.themeManager.toggleTheme();
        });

        // New note buttons
        this.newNoteBtn?.addEventListener('click', () => this.openNoteEditor());
        this.newNoteSidebarBtn?.addEventListener('click', () => this.openNoteEditor());

        // Random note
        this.randomNoteBtn?.addEventListener('click', () => this.openRandomNote());

        // Search
        this.globalSearch?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.globalSearch?.addEventListener('focus', () => {
            if (this.searchQuery) {
                this.searchResults?.classList.remove('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (this.globalSearch && this.searchResults && 
                !this.globalSearch.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.searchResults.classList.add('hidden');
            }
        });

        // Controls
        this.sortSelect?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderNotes();
        });

        this.tagFilter?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderNotes();
        });

        this.viewToggles?.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.switchLayout(e.target.dataset.layout);
            });
        });

        // Editor events
        this.saveNoteBtn?.addEventListener('click', () => this.saveNote());
        this.cancelEditorBtn?.addEventListener('click', () => this.closeNoteEditor());
        this.closeEditorBtn?.addEventListener('click', () => this.closeNoteEditor());

        // Detail events
        this.editNoteBtn?.addEventListener('click', () => this.editCurrentNote());
        this.deleteNoteBtn?.addEventListener('click', () => this.deleteCurrentNote());
        this.closeDetailBtn?.addEventListener('click', () => this.closeNoteDetail());

        // Tags input suggestions
        this.noteTagsInput?.addEventListener('input', (e) => {
            this.showTagSuggestions(e.target.value);
        });

        // Modal close on backdrop click
        this.noteEditorModal?.addEventListener('click', (e) => {
            if (e.target === this.noteEditorModal) {
                this.closeNoteEditor();
            }
        });

        this.noteDetailModal?.addEventListener('click', (e) => {
            if (e.target === this.noteDetailModal) {
                this.closeNoteDetail();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Mobile menu events
        this.mobileMenuBtn?.addEventListener('click', () => {
            this.toggleMobileNav();
        });
        
        this.closeMobileNavBtn?.addEventListener('click', () => {
            this.closeMobileNav();
        });
        
        this.mobileNavButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
                this.closeMobileNav();
            });
        });
        
        this.mobileNewNoteBtn?.addEventListener('click', () => {
            this.openNoteEditor();
            this.closeMobileNav();
        });
        
        // Sidebar overlay events
        this.sidebarOverlay?.addEventListener('click', () => {
            this.closeSidebar();
        });
        
        // Sidebar toggle button
        this.sidebarToggle?.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // Mobile nav overlay events
        this.mobileNavOverlay?.addEventListener('click', (e) => {
            if (e.target === this.mobileNavOverlay) {
                this.closeMobileNav();
            }
        });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
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
            this.loadingScreen?.classList.add('hidden');
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
        
        // Update mobile nav buttons
        this.mobileNavButtons?.forEach(btn => {
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
        this.viewToggles?.forEach(toggle => {
            toggle.classList.toggle('active', toggle.dataset.layout === layout);
        });
        
        // Update container class
        if (this.notesContainer) {
            this.notesContainer.className = `notes-container ${layout}-layout`;
        }
        
        this.renderNotes();
    }

    handleSearch(query) {
        this.searchQuery = query;
        
        if (query.trim()) {
            const results = this.noteManager.searchNotes(query);
            this.renderSearchResults(results);
            this.searchResults?.classList.remove('hidden');
        } else {
            this.searchResults?.classList.add('hidden');
        }
        
        if (this.currentView === 'notes') {
            this.renderNotes();
        }
    }

    renderSearchResults(results) {
        if (!this.searchResults) return;
        
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
        
        if (this.totalNotesEl) this.totalNotesEl.textContent = notes.length;
        if (this.totalTagsEl) this.totalTagsEl.textContent = tags.length;
        if (this.totalWordsEl) this.totalWordsEl.textContent = totalWords.toLocaleString();
    }

    updateTagFilter() {
        if (!this.tagFilter) return;
        
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
        if (!this.recentNotesContainer) return;
        
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
        if (!this.notesContainer) return;
        
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
        if (!this.tagsContainer) return;
        
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
        if (!this.graphContainer) return;
        
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
                if (this.editorTitle) this.editorTitle.textContent = 'Edit Note';
                if (this.noteTitleInput) this.noteTitleInput.value = note.title;
                if (this.noteContentInput) this.noteContentInput.value = note.content;
                if (this.noteTagsInput) this.noteTagsInput.value = note.tags.join(', ');
            }
        } else {
            if (this.editorTitle) this.editorTitle.textContent = 'New Note';
            if (this.noteTitleInput) this.noteTitleInput.value = '';
            if (this.noteContentInput) this.noteContentInput.value = '';
            if (this.noteTagsInput) this.noteTagsInput.value = '';
        }
        
        this.noteEditorModal?.classList.remove('hidden');
        this.noteTitleInput?.focus();
    }

    closeNoteEditor() {
        this.noteEditorModal?.classList.add('hidden');
        this.currentEditingNote = null;
        this.suggestedTags?.classList.remove('show');
    }

    saveNote() {
        const title = this.noteTitleInput?.value.trim() || '';
        const content = this.noteContentInput?.value.trim() || '';
        const tags = this.noteTagsInput?.value.trim() || '';
        
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
        
        if (this.detailTitle) this.detailTitle.textContent = note.title;
        if (this.detailCreated) this.detailCreated.textContent = this.formatDate(note.createdAt);
        if (this.detailUpdated) this.detailUpdated.textContent = this.formatDate(note.updatedAt);
        if (this.detailContent) this.detailContent.innerHTML = this.renderNoteContent(note.content);
        
        // Render tags
        if (this.detailTags) {
            this.detailTags.innerHTML = note.tags.map(tag => 
                `<span class="tag" onclick="app.filterByTag('${tag}')">${this.escapeHtml(tag)}</span>`
            ).join('');
        }
        
        // Render linked notes
        const backlinks = this.noteManager.getBacklinks(note.title);
        if (this.linkedNotesEl) {
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
        }
        
        // Set up action buttons
        if (this.editNoteBtn) this.editNoteBtn.onclick = () => this.openNoteEditor(noteId);
        if (this.deleteNoteBtn) this.deleteNoteBtn.onclick = () => this.deleteNote(noteId);
        
        this.noteDetailModal?.classList.remove('hidden');
    }

    closeNoteDetail() {
        this.noteDetailModal?.classList.add('hidden');
    }

    editCurrentNote() {
        const noteId = this.editNoteBtn?.onclick?.toString().match(/'([^']+)'/)?.[1];
        if (noteId) {
            this.closeNoteDetail();
            this.openNoteEditor(noteId);
        }
    }

    deleteCurrentNote() {
        const noteId = this.deleteNoteBtn?.onclick?.toString().match(/'([^']+)'/)?.[1];
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
        if (this.tagFilter) this.tagFilter.value = tag;
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
        if (!this.suggestedTags) return;
        
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
        if (!this.noteTagsInput || !this.suggestedTags) return;
        
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
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Close mobile elements on Escape
        if (e.key === 'Escape') {
            if (this.mobileNavOverlay && !this.mobileNavOverlay.classList.contains('hidden')) {
                this.closeMobileNav();
                return;
            }
            if (this.sidebar && this.sidebar.classList.contains('open')) {
                this.closeSidebar();
                return;
            }
        }
        
        // Ctrl/Cmd + N: New note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.openNoteEditor();
        }
        
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.globalSearch?.focus();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            if (this.noteEditorModal && !this.noteEditorModal.classList.contains('hidden')) {
                this.closeNoteEditor();
            } else if (this.noteDetailModal && !this.noteDetailModal.classList.contains('hidden')) {
                this.closeNoteDetail();
            }
        }
    }

    showNotification(message, type = 'success') {
        if (!this.notificationText || !this.notification) return;
        
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

    // Mobile Navigation Methods
    toggleMobileNav() {
        if (!this.mobileNavOverlay) return;
        
        this.mobileNavOverlay.classList.toggle('hidden');
        if (!this.mobileNavOverlay.classList.contains('hidden')) {
            this.updateMobileNavButtons();
        }
    }

    closeMobileNav() {
        this.mobileNavOverlay?.classList.add('hidden');
    }

    updateMobileNavButtons() {
        this.mobileNavButtons?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === this.currentView);
        });
    }

    toggleSidebar() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && this.sidebar && this.sidebarOverlay) {
            this.sidebar.classList.toggle('open');
            this.sidebarOverlay.classList.toggle('show');
            
            // Prevent body scroll when sidebar is open
            if (this.sidebar.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    closeSidebar() {
        if (this.sidebar && this.sidebarOverlay) {
            this.sidebar.classList.remove('open');
            this.sidebarOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Handle window resize
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile) {
            // Close mobile elements when switching to desktop
            this.closeMobileNav();
            this.closeSidebar();
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
} else {
    window.UIManager = UIManager;
}
