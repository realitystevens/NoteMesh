// NoteMesh Graph Renderer (Modular)
// Main graph visualization class that coordinates all graph modules

class GraphRenderer {
    constructor(container, noteManager) {
        this.container = container;
        this.noteManager = noteManager;
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
        this.edges = [];
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.animation = { frame: null, running: false };
        
        // Initialize modular components
        this.config = GraphConfig;
        this.physics = new GraphPhysics(this.config);
        this.renderUtils = null; // Will be initialized after canvas creation
        this.eventHandler = null; // Will be initialized after canvas creation

        this.init();
    }

    init() {
        this.createCanvas();
        this.initializeModules();
        this.bindEvents();
        this.generateGraph();
        this.startAnimation();
    }

    createCanvas() {
        // Clear container
        this.container.innerHTML = '';
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.cursor = 'grab';
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        // Set up canvas size
        this.resizeCanvas();
    }

    initializeModules() {
        // Initialize render utilities
        this.renderUtils = new GraphRenderUtils(this.ctx, this.config);
        
        // Initialize event handler
        this.eventHandler = new GraphEventHandler(
            this.canvas, 
            this.camera, 
            this.getNodeAt.bind(this)
        );
    }

    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    bindEvents() {
        // Window events
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    generateGraph() {
        const notes = this.noteManager.getAllNotes();
        this.nodes = [];
        this.edges = [];
        
        if (notes.length === 0) {
            return;
        }

        // Create nodes for each note
        notes.forEach((note, index) => {
            const node = {
                id: note.id,
                title: note.title,
                content: note.content,
                tags: note.tags,
                x: Math.random() * this.canvas.width / window.devicePixelRatio,
                y: Math.random() * this.canvas.height / window.devicePixelRatio,
                vx: 0,
                vy: 0,
                radius: this.config.node.radius,
                connections: 0,
                note: note
            };
            this.nodes.push(node);
        });

        // Create edges based on note links
        this.nodes.forEach(sourceNode => {
            sourceNode.note.links.forEach(linkTitle => {
                const targetNode = this.nodes.find(node => 
                    node.title.toLowerCase() === linkTitle.toLowerCase()
                );
                
                if (targetNode && sourceNode.id !== targetNode.id) {
                    // Check if edge already exists
                    const existingEdge = this.edges.find(edge =>
                        (edge.source === sourceNode.id && edge.target === targetNode.id) ||
                        (edge.source === targetNode.id && edge.target === sourceNode.id)
                    );
                    
                    if (!existingEdge) {
                        this.edges.push({
                            source: sourceNode.id,
                            target: targetNode.id,
                            strength: 1
                        });
                        sourceNode.connections++;
                        targetNode.connections++;
                    }
                }
            });
        });

        // Create tag-based connections (weaker)
        this.nodes.forEach(nodeA => {
            this.nodes.forEach(nodeB => {
                if (nodeA.id !== nodeB.id) {
                    const commonTags = nodeA.tags.filter(tag => 
                        nodeB.tags.includes(tag)
                    );
                    
                    if (commonTags.length > 0) {
                        const existingEdge = this.edges.find(edge =>
                            (edge.source === nodeA.id && edge.target === nodeB.id) ||
                            (edge.source === nodeB.id && edge.target === nodeA.id)
                        );
                        
                        if (!existingEdge) {
                            this.edges.push({
                                source: nodeA.id,
                                target: nodeB.id,
                                strength: 0.3,
                                type: 'tag',
                                commonTags: commonTags
                            });
                        }
                    }
                }
            });
        });

        // Adjust node sizes based on connections
        this.nodes.forEach(node => {
            node.radius = Math.max(
                this.config.node.radius,
                this.config.node.radius + node.connections * 2
            );
        });

        // Center the graph
        this.centerGraph();
    }

    centerGraph() {
        if (this.nodes.length === 0) return;
        
        const centerX = this.canvas.width / (2 * window.devicePixelRatio);
        const centerY = this.canvas.height / (2 * window.devicePixelRatio);
        
        // Calculate current center
        const bounds = this.getGraphBounds();
        const currentCenterX = (bounds.minX + bounds.maxX) / 2;
        const currentCenterY = (bounds.minY + bounds.maxY) / 2;
        
        // Move all nodes to center
        const offsetX = centerX - currentCenterX;
        const offsetY = centerY - currentCenterY;
        
        this.nodes.forEach(node => {
            node.x += offsetX;
            node.y += offsetY;
        });
    }

    getGraphBounds() {
        if (this.nodes.length === 0) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        }
        
        return this.nodes.reduce((bounds, node) => ({
            minX: Math.min(bounds.minX, node.x),
            maxX: Math.max(bounds.maxX, node.x),
            minY: Math.min(bounds.minY, node.y),
            maxY: Math.max(bounds.maxY, node.y)
        }), {
            minX: this.nodes[0].x,
            maxX: this.nodes[0].x,
            minY: this.nodes[0].y,
            maxY: this.nodes[0].y
        });
    }

    startAnimation() {
        if (!this.config.animation.enabled) return;
        
        this.animation.running = true;
        const animate = () => {
            if (!this.animation.running) return;
            
            this.updatePhysics();
            this.render();
            
            this.animation.frame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    stopAnimation() {
        this.animation.running = false;
        if (this.animation.frame) {
            cancelAnimationFrame(this.animation.frame);
        }
    }

    updatePhysics() {
        this.physics.updatePhysics(
            this.nodes, 
            this.edges, 
            this.canvas, 
            this.eventHandler ? this.eventHandler.dragNode : null
        );
    }

    render() {
        const canvasWidth = this.canvas.width / window.devicePixelRatio;
        const canvasHeight = this.canvas.height / window.devicePixelRatio;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        if (this.nodes.length === 0) {
            this.renderUtils.renderEmptyState(this.canvas);
            return;
        }
        
        // Apply camera transform
        this.ctx.save();
        this.ctx.translate(this.camera.x, this.camera.y);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        
        // Render edges and nodes
        this.renderUtils.renderEdges(
            this.edges, 
            this.nodes, 
            this.eventHandler ? this.eventHandler.selectedNode : null,
            this.eventHandler ? this.eventHandler.hoveredNode : null
        );
        
        this.renderUtils.renderNodes(
            this.nodes,
            this.eventHandler ? this.eventHandler.selectedNode : null,
            this.eventHandler ? this.eventHandler.hoveredNode : null
        );
        
        this.ctx.restore();
        
        // Render UI elements
        this.renderUtils.renderUI(
            this.nodes, 
            this.edges, 
            this.camera,
            this.eventHandler ? this.eventHandler.selectedNode : null,
            this.canvas
        );
    }

    // Utility methods
    getNodeAt(x, y) {
        const transformedX = (x - this.camera.x) / this.camera.zoom;
        const transformedY = (y - this.camera.y) / this.camera.zoom;
        
        return this.nodes.find(node => {
            const dx = transformedX - node.x;
            const dy = transformedY - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= node.radius;
        });
    }

    // Public methods
    refresh() {
        this.generateGraph();
    }

    destroy() {
        this.stopAnimation();
        // Remove event listeners
        window.removeEventListener('resize', this.resizeCanvas.bind(this));
    }

    zoomToFit() {
        if (this.nodes.length === 0) return;
        
        const bounds = this.getGraphBounds();
        const padding = 50;
        const canvasWidth = this.canvas.width / window.devicePixelRatio;
        const canvasHeight = this.canvas.height / window.devicePixelRatio;
        
        const graphWidth = bounds.maxX - bounds.minX + padding * 2;
        const graphHeight = bounds.maxY - bounds.minY + padding * 2;
        
        const scaleX = canvasWidth / graphWidth;
        const scaleY = canvasHeight / graphHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        
        this.camera.zoom = scale;
        this.camera.x = (canvasWidth - (bounds.maxX + bounds.minX) * scale) / 2;
        this.camera.y = (canvasHeight - (bounds.maxY + bounds.minY) * scale) / 2;
    }
}

// Export for global access
window.GraphRenderer = GraphRenderer;
