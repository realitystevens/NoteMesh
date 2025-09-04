// NoteMesh Local Storage Utilities
// Functions for safe localStorage operations with error handling

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

// Export for global access
window.StorageUtils = StorageUtils;
