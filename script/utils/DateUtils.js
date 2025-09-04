// NoteMesh Date and Time Utilities
// Functions for date formatting, relative time, and date validation

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

// Export for global access
window.DateUtils = DateUtils;
