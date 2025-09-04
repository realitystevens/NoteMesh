/* Theme Manager
   Handles light/dark theme switching and persistence
*/

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('notemesh_theme') || 'light';
        this.applyTheme(this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('notemesh_theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.updateThemeToggleIcon(theme);
    }

    updateThemeToggleIcon(theme) {
        const sunIcon = document.querySelector('.theme-icon.sun');
        const moonIcon = document.querySelector('.theme-icon.moon');
        
        if (theme === 'dark') {
            sunIcon?.classList.remove('hidden');
            moonIcon?.classList.add('hidden');
        } else {
            sunIcon?.classList.add('hidden');
            moonIcon?.classList.remove('hidden');
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            this.applyTheme(theme);
            localStorage.setItem('notemesh_theme', theme);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
} else {
    window.ThemeManager = ThemeManager;
}
