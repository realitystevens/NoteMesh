/* NoteMesh Application - Main Entry Point
   A Personal Knowledge Management System
   Built with Vanilla JavaScript and Object-Oriented Programming
*/

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create instances of our managers
    const noteManager = new NoteManager();
    const themeManager = new ThemeManager();
    
    // Initialize the UI Manager (this handles all the UI logic)
    window.app = new UIManager(noteManager, themeManager);
    
    // Make managers available globally for debugging/development
    window.noteManager = noteManager;
    window.themeManager = themeManager;
});

// Export for external access
window.NoteMesh = {
    Note,
    NoteManager,
    ThemeManager,
    UIManager
};
