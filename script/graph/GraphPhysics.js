// NoteMesh Graph Physics Engine
// Handles force simulation and node positioning for graph visualization

class GraphPhysics {
    constructor(config) {
        this.config = config;
    }

    /**
     * Update physics simulation for nodes and edges
     * @param {Array} nodes - Array of graph nodes
     * @param {Array} edges - Array of graph edges
     * @param {Object} canvas - Canvas element for bounds checking
     * @param {Object} dragNode - Currently dragged node (if any)
     */
    updatePhysics(nodes, edges, canvas, dragNode = null) {
        const { repulsion, attraction, damping, minDistance, maxDistance } = this.config.physics;
        
        // Apply forces between nodes
        nodes.forEach(nodeA => {
            nodes.forEach(nodeB => {
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
        edges.forEach(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
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
        nodes.forEach(node => {
            if (node === dragNode) return; // Don't move dragged nodes
            
            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx;
            node.y += node.vy;
            
            // Keep nodes within canvas bounds
            const margin = node.radius + 10;
            const canvasWidth = canvas.width / window.devicePixelRatio;
            const canvasHeight = canvas.height / window.devicePixelRatio;
            
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
}

// Export for global access
window.GraphPhysics = GraphPhysics;
