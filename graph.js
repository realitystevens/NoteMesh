// NoteMesh Graph Visualization
// Interactive network graph for visualizing note connections and relationships

class GraphRenderer {
    constructor(container, noteManager) {
        this.container = container;
        this.noteManager = noteManager;
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
        this.edges = [];
        this.selectedNode = null;
        this.hoveredNode = null;
        this.isDragging = false;
        this.dragNode = null;
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.animation = { frame: null, running: false };
        
        // Configuration
        this.config = {
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

        this.init();
    }

    init() {
        this.createCanvas();
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

    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        this.canvas.addEventListener('click', this.onClick.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
        
        // Window events
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    generateGraph() {
        const notes = this.noteManager.getAllNotes();
        this.nodes = [];
        this.edges = [];
        
        if (notes.length === 0) {
            this.renderEmptyState();
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
        const { repulsion, attraction, damping, minDistance, maxDistance } = this.config.physics;
        
        // Apply forces between nodes
        this.nodes.forEach(nodeA => {
            this.nodes.forEach(nodeB => {
                if (nodeA.id === nodeB.id) return;
                
                const dx = nodeB.x - nodeA.x;
                const dy = nodeB.y - nodeA.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance === 0) return;
                
                // Repulsion force
                if (distance < maxDistance) {
                    const force = repulsion / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    
                    nodeA.vx -= fx;
                    nodeA.vy -= fy;
                    nodeB.vx += fx;
                    nodeB.vy += fy;
                }
            });
        });
        
        // Apply spring forces for connected nodes
        this.edges.forEach(edge => {
            const sourceNode = this.nodes.find(n => n.id === edge.source);
            const targetNode = this.nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return;
            
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance === 0) return;
            
            const targetDistance = edge.type === 'tag' ? maxDistance * 1.5 : maxDistance;
            const force = attraction * (distance - targetDistance) * edge.strength;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            sourceNode.vx += fx;
            sourceNode.vy += fy;
            targetNode.vx -= fx;
            targetNode.vy -= fy;
        });
        
        // Update positions and apply damping
        this.nodes.forEach(node => {
            if (node === this.dragNode) return; // Don't move dragged nodes
            
            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx;
            node.y += node.vy;
            
            // Keep nodes within canvas bounds
            const margin = node.radius + 10;
            const canvasWidth = this.canvas.width / window.devicePixelRatio;
            const canvasHeight = this.canvas.height / window.devicePixelRatio;
            
            if (node.x < margin) {
                node.x = margin;
                node.vx = 0;
            }
            if (node.x > canvasWidth - margin) {
                node.x = canvasWidth - margin;
                node.vx = 0;
            }
            if (node.y < margin) {
                node.y = margin;
                node.vy = 0;
            }
            if (node.y > canvasHeight - margin) {
                node.y = canvasHeight - margin;
                node.vy = 0;
            }
        });
    }

    render() {
        const ctx = this.ctx;
        const canvasWidth = this.canvas.width / window.devicePixelRatio;
        const canvasHeight = this.canvas.height / window.devicePixelRatio;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Apply camera transform
        ctx.save();
        ctx.translate(this.camera.x, this.camera.y);
        ctx.scale(this.camera.zoom, this.camera.zoom);
        
        // Render edges
        this.renderEdges();
        
        // Render nodes
        this.renderNodes();
        
        ctx.restore();
        
        // Render UI elements
        this.renderUI();
    }

    renderEdges() {
        const ctx = this.ctx;
        
        this.edges.forEach(edge => {
            const sourceNode = this.nodes.find(n => n.id === edge.source);
            const targetNode = this.nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return;
            
            const isHighlighted = 
                sourceNode === this.selectedNode || 
                targetNode === this.selectedNode ||
                sourceNode === this.hoveredNode || 
                targetNode === this.hoveredNode;
            
            ctx.strokeStyle = isHighlighted 
                ? this.config.edge.colors.highlighted 
                : this.config.edge.colors.default;
            ctx.lineWidth = isHighlighted 
                ? this.config.edge.widthHovered 
                : this.config.edge.width;
            
            if (edge.type === 'tag') {
                ctx.setLineDash([5, 5]);
                ctx.globalAlpha = 0.5;
            } else {
                ctx.setLineDash([]);
                ctx.globalAlpha = 1;
            }
            
            ctx.beginPath();
            ctx.moveTo(sourceNode.x, sourceNode.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.stroke();
            
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        });
    }

    renderNodes() {
        const ctx = this.ctx;
        
        this.nodes.forEach(node => {
            const isSelected = node === this.selectedNode;
            const isHovered = node === this.hoveredNode;
            
            // Determine node appearance
            let radius = node.radius;
            let fillColor = this.config.node.colors.default;
            let textColor = this.config.node.colors.text;
            
            if (isSelected) {
                radius = this.config.node.radiusSelected;
                fillColor = this.config.node.colors.selected;
                textColor = this.config.node.colors.textSelected;
            } else if (isHovered) {
                radius = this.config.node.radiusHovered;
                fillColor = this.config.node.colors.hovered;
            }
            
            // Draw node circle
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Draw node label
            ctx.fillStyle = textColor;
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const maxTextWidth = radius * 4;
            const text = this.truncateText(node.title, maxTextWidth);
            
            // Draw text background for better readability
            if (!isSelected) {
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const textHeight = 16;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(
                    node.x - textWidth / 2 - 4,
                    node.y + radius + 4,
                    textWidth + 8,
                    textHeight
                );
                
                ctx.fillStyle = textColor;
            }
            
            ctx.fillText(text, node.x, node.y + radius + 12);
        });
    }

    renderUI() {
        const ctx = this.ctx;
        const canvasWidth = this.canvas.width / window.devicePixelRatio;
        const canvasHeight = this.canvas.height / window.devicePixelRatio;
        
        // Render graph statistics
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const stats = [
            `Notes: ${this.nodes.length}`,
            `Connections: ${this.edges.length}`,
            `Zoom: ${Math.round(this.camera.zoom * 100)}%`
        ];
        
        stats.forEach((stat, index) => {
            ctx.fillText(stat, 16, 16 + index * 20);
        });
        
        // Render selected node info
        if (this.selectedNode) {
            this.renderNodeInfo(this.selectedNode);
        }
    }

    renderNodeInfo(node) {
        const ctx = this.ctx;
        const canvasWidth = this.canvas.width / window.devicePixelRatio;
        const padding = 16;
        const boxWidth = 280;
        const boxHeight = 120;
        
        // Draw info box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        
        const x = canvasWidth - boxWidth - padding;
        const y = padding;
        
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeRect(x, y, boxWidth, boxHeight);
        
        // Draw content
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Title
        const title = this.truncateText(node.title, boxWidth - 32);
        ctx.fillText(title, x + 16, y + 16);
        
        // Content preview
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        const content = this.truncateText(node.content, boxWidth - 32);
        this.wrapText(ctx, content, x + 16, y + 40, boxWidth - 32, 14);
        
        // Tags
        if (node.tags.length > 0) {
            ctx.fillStyle = '#6366f1';
            ctx.font = '10px Inter, sans-serif';
            const tagsText = node.tags.slice(0, 3).join(', ');
            const truncatedTags = this.truncateText(tagsText, boxWidth - 32);
            ctx.fillText(`Tags: ${truncatedTags}`, x + 16, y + 90);
        }
    }

    renderEmptyState() {
        const ctx = this.ctx;
        const canvasWidth = this.canvas.width / window.devicePixelRatio;
        const canvasHeight = this.canvas.height / window.devicePixelRatio;
        
        ctx.fillStyle = '#64748b';
        ctx.font = '18px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(
            'No notes to visualize',
            canvasWidth / 2,
            canvasHeight / 2 - 20
        );
        
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(
            'Create some notes and link them to see the graph',
            canvasWidth / 2,
            canvasHeight / 2 + 10
        );
    }

    // Event handlers
    onMouseDown(e) {
        const pos = this.getMousePos(e);
        const clickedNode = this.getNodeAt(pos.x, pos.y);
        
        if (clickedNode) {
            this.isDragging = true;
            this.dragNode = clickedNode;
            this.canvas.style.cursor = 'grabbing';
        } else {
            // Start panning
            this.isPanning = true;
            this.lastPanPos = pos;
            this.canvas.style.cursor = 'move';
        }
    }

    onMouseMove(e) {
        const pos = this.getMousePos(e);
        
        if (this.isDragging && this.dragNode) {
            // Drag node
            this.dragNode.x = (pos.x - this.camera.x) / this.camera.zoom;
            this.dragNode.y = (pos.y - this.camera.y) / this.camera.zoom;
            this.dragNode.vx = 0;
            this.dragNode.vy = 0;
        } else if (this.isPanning && this.lastPanPos) {
            // Pan camera
            this.camera.x += pos.x - this.lastPanPos.x;
            this.camera.y += pos.y - this.lastPanPos.y;
            this.lastPanPos = pos;
        } else {
            // Update hovered node
            const hoveredNode = this.getNodeAt(pos.x, pos.y);
            if (hoveredNode !== this.hoveredNode) {
                this.hoveredNode = hoveredNode;
                this.canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
            }
        }
    }

    onMouseUp(e) {
        this.isDragging = false;
        this.isPanning = false;
        this.dragNode = null;
        this.lastPanPos = null;
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
    }

    onClick(e) {
        const pos = this.getMousePos(e);
        const clickedNode = this.getNodeAt(pos.x, pos.y);
        
        if (clickedNode) {
            this.selectedNode = this.selectedNode === clickedNode ? null : clickedNode;
        } else {
            this.selectedNode = null;
        }
    }

    onDoubleClick(e) {
        const pos = this.getMousePos(e);
        const clickedNode = this.getNodeAt(pos.x, pos.y);
        
        if (clickedNode && window.app) {
            // Open note detail
            window.app.openNoteDetail(clickedNode.id);
        }
    }

    onWheel(e) {
        e.preventDefault();
        
        const pos = this.getMousePos(e);
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, this.camera.zoom * scaleFactor));
        
        // Zoom towards mouse position
        this.camera.x = pos.x - (pos.x - this.camera.x) * (newZoom / this.camera.zoom);
        this.camera.y = pos.y - (pos.y - this.camera.y) * (newZoom / this.camera.zoom);
        this.camera.zoom = newZoom;
    }

    // Touch event handlers for mobile support
    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    onTouchEnd(e) {
        e.preventDefault();
        this.onMouseUp(e);
    }

    // Utility methods
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

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

    truncateText(text, maxWidth) {
        const ctx = this.ctx;
        if (ctx.measureText(text).width <= maxWidth) {
            return text;
        }
        
        let truncated = text;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        return truncated + '...';
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        
        ctx.fillText(line, x, currentY);
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
