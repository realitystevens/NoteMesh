// NoteMesh Graph Configuration
// Configuration constants and settings for graph visualization

const GraphConfig = {
    node: {
        radius: 8,
        radiusSelected: 12,
        radiusHovered: 10,
        colors: {
            default: '#6366f1',
            selected: '#f59e0b',
            hovered: '#8b5cf6',
            text: '#1e293b',
            textSelected: '#ffffff'
        }
    },
    edge: {
        width: 2,
        widthHovered: 3,
        colors: {
            default: '#cbd5e1',
            highlighted: '#6366f1'
        }
    },
    physics: {
        repulsion: 100,
        attraction: 0.01,
        damping: 0.95,
        minDistance: 50,
        maxDistance: 200
    },
    animation: {
        enabled: true,
        fps: 60
    }
};

// Export for global access
window.GraphConfig = GraphConfig;
