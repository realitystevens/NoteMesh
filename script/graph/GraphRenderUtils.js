// NoteMesh Graph Rendering Utilities
// Helper functions for graph drawing and text manipulation

class GraphRenderUtils {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
    }

    /**
     * Render edges between nodes
     * @param {Array} edges - Array of graph edges
     * @param {Array} nodes - Array of graph nodes
     * @param {Object} selectedNode - Currently selected node
     * @param {Object} hoveredNode - Currently hovered node
     */
    renderEdges(edges, nodes, selectedNode, hoveredNode) {
        const ctx = this.ctx;
        
        edges.forEach(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return;
            
            const isHighlighted = 
                sourceNode === selectedNode || 
                targetNode === selectedNode ||
                sourceNode === hoveredNode || 
                targetNode === hoveredNode;
            
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

    /**
     * Render graph nodes
     * @param {Array} nodes - Array of graph nodes
     * @param {Object} selectedNode - Currently selected node
     * @param {Object} hoveredNode - Currently hovered node
     */
    renderNodes(nodes, selectedNode, hoveredNode) {
        const ctx = this.ctx;
        
        nodes.forEach(node => {
            const isSelected = node === selectedNode;
            const isHovered = node === hoveredNode;
            
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

    /**
     * Render UI elements (statistics, node info)
     * @param {Array} nodes - Array of graph nodes
     * @param {Array} edges - Array of graph edges
     * @param {Object} camera - Camera object with zoom
     * @param {Object} selectedNode - Currently selected node
     * @param {Object} canvas - Canvas element for dimensions
     */
    renderUI(nodes, edges, camera, selectedNode, canvas) {
        const ctx = this.ctx;
        const canvasWidth = canvas.width / window.devicePixelRatio;
        const canvasHeight = canvas.height / window.devicePixelRatio;
        
        // Render graph statistics
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const stats = [
            `Notes: ${nodes.length}`,
            `Connections: ${edges.length}`,
            `Zoom: ${Math.round(camera.zoom * 100)}%`
        ];
        
        stats.forEach((stat, index) => {
            ctx.fillText(stat, 16, 16 + index * 20);
        });
        
        // Render selected node info
        if (selectedNode) {
            this.renderNodeInfo(selectedNode, canvasWidth);
        }
    }

    /**
     * Render detailed info panel for selected node
     * @param {Object} node - Selected node
     * @param {number} canvasWidth - Canvas width
     */
    renderNodeInfo(node, canvasWidth) {
        const ctx = this.ctx;
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
        if (node.tags && node.tags.length > 0) {
            ctx.fillStyle = '#6366f1';
            ctx.font = '10px Inter, sans-serif';
            const tagsText = node.tags.slice(0, 3).join(', ');
            const truncatedTags = this.truncateText(tagsText, boxWidth - 32);
            ctx.fillText(`Tags: ${truncatedTags}`, x + 16, y + 90);
        }
    }

    /**
     * Render empty state when no notes exist
     * @param {Object} canvas - Canvas element for dimensions
     */
    renderEmptyState(canvas) {
        const ctx = this.ctx;
        const canvasWidth = canvas.width / window.devicePixelRatio;
        const canvasHeight = canvas.height / window.devicePixelRatio;
        
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

    /**
     * Truncate text to fit within specified width
     * @param {string} text - Text to truncate
     * @param {number} maxWidth - Maximum width in pixels
     * @returns {string} Truncated text
     */
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

    /**
     * Wrap text within specified width
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to wrap
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} maxWidth - Maximum width
     * @param {number} lineHeight - Line height
     */
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
}

// Export for global access
window.GraphRenderUtils = GraphRenderUtils;
