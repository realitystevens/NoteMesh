// NoteMesh Graph Event Handler
// Handles mouse and touch interactions for graph visualization

class GraphEventHandler {
    constructor(canvas, camera, getNodeAtCallback) {
        this.canvas = canvas;
        this.camera = camera;
        this.getNodeAt = getNodeAtCallback;
        this.isDragging = false;
        this.isPanning = false;
        this.dragNode = null;
        this.lastPanPos = null;
        this.hoveredNode = null;
        this.selectedNode = null;
        
        this.bindEvents();
    }

    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        this.canvas.addEventListener('click', this.onClick.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
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
}

// Export for global access
window.GraphEventHandler = GraphEventHandler;
