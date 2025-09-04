// NoteMesh Utility Functions
// A collection of helper functions for the NoteMesh application

/**
 * Date and Time Utilities
 */
const DateUtils = {
    /**
     * Format a date for display
     * @param {Date|string} date - The date to format
     * @param {string} format - The format type ('short', 'long', 'relative')
     * @returns {string} Formatted date string
     */
    formatDate(date, format = 'short') {
        const dateObj = new Date(date);
        
        switch (format) {
            case 'short':
                return dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            
            case 'long':
                return dateObj.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            
            case 'relative':
                return this.getRelativeTime(dateObj);
            
            case 'time':
                return dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            
            default:
                return dateObj.toLocaleDateString();
        }
    },

    /**
     * Get relative time (e.g., "2 hours ago", "yesterday")
     * @param {Date} date - The date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.round(diffMs / 1000);
        const diffMins = Math.round(diffSecs / 60);
        const diffHours = Math.round(diffMins / 60);
        const diffDays = Math.round(diffHours / 24);
        const diffWeeks = Math.round(diffDays / 7);
        const diffMonths = Math.round(diffDays / 30);
        const diffYears = Math.round(diffDays / 365);

        if (diffSecs < 60) {
            return 'just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            if (diffDays === 1) return 'yesterday';
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else if (diffWeeks < 4) {
            return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
        } else if (diffMonths < 12) {
            return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
        } else {
            return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
        }
    },

    /**
     * Check if a date is today
     * @param {Date|string} date - The date to check
     * @returns {boolean} True if the date is today
     */
    isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return today.toDateString() === checkDate.toDateString();
    },

    /**
     * Check if a date is this week
     * @param {Date|string} date - The date to check
     * @returns {boolean} True if the date is this week
     */
    isThisWeek(date) {
        const now = new Date();
        const checkDate = new Date(date);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return checkDate >= startOfWeek && checkDate <= endOfWeek;
    }
};

/**
 * String Manipulation Utilities
 */
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

/**
 * Array and Collection Utilities
 */
const ArrayUtils = {
    /**
     * Remove duplicates from array
     * @param {Array} array - The array to deduplicate
     * @returns {Array} Array without duplicates
     */
    unique(array) {
        return [...new Set(array)];
    },

    /**
     * Group array items by a key
     * @param {Array} array - The array to group
     * @param {string|function} key - The key to group by
     * @returns {Object} Grouped object
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = typeof key === 'function' ? key(item) : item[key];
            groups[groupKey] = groups[groupKey] || [];
            groups[groupKey].push(item);
            return groups;
        }, {});
    },

    /**
     * Sort array by multiple criteria
     * @param {Array} array - The array to sort
     * @param {Array} criteria - Array of sort criteria
     * @returns {Array} Sorted array
     */
    sortBy(array, criteria) {
        return array.sort((a, b) => {
            for (const criterion of criteria) {
                const { key, order = 'asc' } = criterion;
                const aVal = typeof key === 'function' ? key(a) : a[key];
                const bVal = typeof key === 'function' ? key(b) : b[key];
                
                let comparison = 0;
                if (aVal < bVal) comparison = -1;
                if (aVal > bVal) comparison = 1;
                
                if (comparison !== 0) {
                    return order === 'desc' ? -comparison : comparison;
                }
            }
            return 0;
        });
    },

    /**
     * Chunk array into smaller arrays
     * @param {Array} array - The array to chunk
     * @param {number} size - Size of each chunk
     * @returns {Array} Array of chunks
     */
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};

/**
 * Local Storage Utilities
 */
const StorageUtils = {
    /**
     * Set item in localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },

    /**
     * Get item from localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Retrieved value or default
     */
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    },

    /**
     * Clear all localStorage data for the app
     * @param {string} prefix - Key prefix to clear (optional)
     * @returns {boolean} Success status
     */
    clear(prefix = 'notemesh_') {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }
};

/**
 * DOM Utilities
 */
const DOMUtils = {
    /**
     * Create element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string|Node} content - Element content
     * @returns {Element} Created element
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        }
        
        return element;
    },

    /**
     * Add event listener with cleanup tracking
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {function} handler - Event handler
     * @param {Object} options - Event options
     * @returns {function} Cleanup function
     */
    addEventListenerWithCleanup(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        return () => element.removeEventListener(event, handler, options);
    },

    /**
     * Check if element is visible in viewport
     * @param {Element} element - Element to check
     * @returns {boolean} Visibility status
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Smooth scroll to element
     * @param {Element|string} target - Target element or selector
     * @param {number} offset - Offset from top (default: 0)
     */
    scrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            const top = element.offsetTop - offset;
            window.scrollTo({
                top,
                behavior: 'smooth'
            });
        }
    }
};

/**
 * File and Export Utilities
 */
const FileUtils = {
    /**
     * Download data as file
     * @param {string} data - Data to download
     * @param {string} filename - File name
     * @param {string} type - MIME type
     */
    downloadAsFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Read file as text
     * @param {File} file - File to read
     * @returns {Promise<string>} File content
     */
    readAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

/**
 * Validation Utilities
 */
const ValidationUtils = {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Validation result
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} Validation result
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Check if string is empty or whitespace
     * @param {string} str - String to check
     * @returns {boolean} True if empty
     */
    isEmpty(str) {
        return !str || str.trim().length === 0;
    },

    /**
     * Validate string length
     * @param {string} str - String to validate
     * @param {number} min - Minimum length
     * @param {number} max - Maximum length
     * @returns {boolean} Validation result
     */
    isValidLength(str, min = 0, max = Infinity) {
        const length = str ? str.length : 0;
        return length >= min && length <= max;
    }
};

/**
 * Performance Utilities
 */
const PerformanceUtils = {
    /**
     * Debounce function calls
     * @param {function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {function} Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function calls
     * @param {function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Measure function execution time
     * @param {function} func - Function to measure
     * @param {...any} args - Function arguments
     * @returns {Object} Result and execution time
     */
    measureTime(func, ...args) {
        const start = performance.now();
        const result = func.apply(this, args);
        const end = performance.now();
        
        return {
            result,
            executionTime: end - start
        };
    }
};

/**
 * Color Utilities
 */
const ColorUtils = {
    /**
     * Generate random color
     * @returns {string} Random hex color
     */
    randomHex() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    },

    /**
     * Generate color from string (consistent)
     * @param {string} str - Input string
     * @returns {string} Generated hex color
     */
    stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - color.length) + color;
    },

    /**
     * Check if color is light or dark
     * @param {string} hexColor - Hex color code
     * @returns {string} 'light' or 'dark'
     */
    isLightOrDark(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return brightness > 155 ? 'light' : 'dark';
    }
};

// Export utilities for use in other modules
window.NoteMeshUtils = {
    DateUtils,
    StringUtils,
    ArrayUtils,
    StorageUtils,
    DOMUtils,
    FileUtils,
    ValidationUtils,
    PerformanceUtils,
    ColorUtils
};

// Make individual utilities available globally for convenience
window.DateUtils = DateUtils;
window.StringUtils = StringUtils;
window.ArrayUtils = ArrayUtils;
window.StorageUtils = StorageUtils;
window.DOMUtils = DOMUtils;
window.FileUtils = FileUtils;
window.ValidationUtils = ValidationUtils;
window.PerformanceUtils = PerformanceUtils;
window.ColorUtils = ColorUtils;
