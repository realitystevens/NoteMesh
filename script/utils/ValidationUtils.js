// NoteMesh Validation Utilities
// Functions for input validation and format checking

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

// Export for global access
window.ValidationUtils = ValidationUtils;
