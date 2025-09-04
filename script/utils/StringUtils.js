// NoteMesh String Manipulation Utilities
// Functions for text processing, formatting, and validation

const StringUtils = {
    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - The text to escape
     * @returns {string} Escaped HTML string
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    },

    /**
     * Truncate text to a specified length
     * @param {string} text - The text to truncate
     * @param {number} length - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated text
     */
    truncate(text, length = 100, suffix = '...') {
        if (!text || text.length <= length) return text || '';
        return text.substring(0, length).trim() + suffix;
    },

    /**
     * Convert text to slug format
     * @param {string} text - The text to convert
     * @returns {string} Slug format string
     */
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Capitalize first letter of each word
     * @param {string} text - The text to capitalize
     * @returns {string} Capitalized text
     */
    titleCase(text) {
        return text.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    /**
     * Count words in text
     * @param {string} text - The text to count
     * @returns {number} Word count
     */
    wordCount(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    /**
     * Extract reading time estimate
     * @param {string} text - The text to analyze
     * @param {number} wordsPerMinute - Average reading speed (default: 200)
     * @returns {number} Reading time in minutes
     */
    readingTime(text, wordsPerMinute = 200) {
        const words = this.wordCount(text);
        return Math.ceil(words / wordsPerMinute);
    },

    /**
     * Highlight search terms in text
     * @param {string} text - The text to search in
     * @param {string} searchTerm - The term to highlight
     * @returns {string} Text with highlighted terms
     */
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm.trim()) return this.escapeHtml(text);
        
        const escapedText = this.escapeHtml(text);
        const escapedTerm = this.escapeHtml(searchTerm);
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        
        return escapedText.replace(regex, '<mark>$1</mark>');
    }
};

// Export for global access
window.StringUtils = StringUtils;
