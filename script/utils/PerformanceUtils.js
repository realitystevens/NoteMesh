// NoteMesh Performance Utilities
// Functions for optimization, debouncing, and performance measurement

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

// Export for global access
window.PerformanceUtils = PerformanceUtils;
