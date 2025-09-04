/**
 * Note Model
 * Represents a single note with title, content, tags, and metadata
 */
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

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Note;
} else {
    window.Note = Note;
}
