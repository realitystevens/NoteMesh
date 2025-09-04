// NoteMesh Array and Collection Utilities
// Functions for array manipulation, sorting, and grouping

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

// Export for global access
window.ArrayUtils = ArrayUtils;
