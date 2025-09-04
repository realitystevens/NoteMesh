// NoteMesh Color Utilities
// Functions for color generation, manipulation, and analysis

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

// Export for global access
window.ColorUtils = ColorUtils;
