try {
    if (!Nabu) throw "Nabu Manager not loaded";
} catch (e) {
    throw "Nabu Manager not loaded";
}

if (typeof Nabu.VisualEditor === 'undefined') {
    Nabu.VisualEditor = function() {};
}

Nabu.VisualEditor.Grid = function(graph)
{
    var Self = this;

    this.graph = graph;

    try {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.style.zIndex = -1;
        graph.container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        // Modify event filtering to accept canvas as container
        var mxGraphViewIsContainerEvent = mxGraphView.prototype.isContainerEvent;
        mxGraphView.prototype.isContainerEvent = function(evt)
        {
            return mxGraphViewIsContainerEvent.apply(this, arguments) ||
                mxEvent.getSource(evt) == Self.canvas;
        };

        this.s = 0;
        this.gs = 0;
        this.tr = new mxPoint();
        this.w = 0;
        this.h = 0;
    } catch (e) {
        mxLog.show();
        mxLog.debug('Using background image');

        graph.container.style.backgroundImage = 'url(\'editors/images/grid.gif\')';
    }

    var mxGraphViewValidateBackground = mxGraphView.prototype.validateBackground;
    mxGraphView.prototype.validateBackground = function()
    {
        mxGraphViewValidateBackground.apply(this, arguments);
        Self.repaintGrid();
    };

};

Nabu.VisualEditor.Grid.prototype = {
    repaintGrid: function()
    {
        if (this.ctx != null)
        {
            var bounds = this.graph.getGraphBounds();
            var width = Math.max(bounds.x + bounds.width, this.graph.container.clientWidth);
            var height = Math.max(bounds.y + bounds.height, this.graph.container.clientHeight);
            var sizeChanged = width != this.w || height != this.h;

            if (this.graph.view.scale != this.s ||
                this.graph.view.translate.x != this.tr.x ||
                this.graph.view.translate.y != this.tr.y ||
                this.gs != this.graph.gridSize ||
                sizeChanged
            ) {
                this.tr = this.graph.view.translate.clone();
                this.s = this.graph.view.scale;
                this.gs = this.graph.gridSize;
                this.w = width;
                this.h = height;

                // Clears the background if required
                if (!sizeChanged)
                {
                    this.ctx.clearRect(0, 0, this.w, this.h);
                }
                else
                {
                    this.canvas.setAttribute('width', this.w);
                    this.canvas.setAttribute('height', this.h);
                }

                var tx = this.tr.x * this.s;
                var ty = this.tr.y * this.s;

                // Sets the distance of the grid lines in pixels
                var minStepping = this.graph.gridSize;
                var stepping = minStepping * this.s;

                if (stepping < minStepping)
                {
                    var count = Math.round(Math.ceil(minStepping / stepping) / 2) * 2;
                    stepping = count * stepping;
                }

                var xs = Math.floor((0 - tx) / stepping) * stepping + tx;
                var xe = Math.ceil(this.w / stepping) * stepping;
                var ys = Math.floor((0 - ty) / stepping) * stepping + ty;
                var ye = Math.ceil(this.h / stepping) * stepping;

                xe += Math.ceil(stepping);
                ye += Math.ceil(stepping);

                var ixs = Math.round(xs);
                var ixe = Math.round(xe);
                var iys = Math.round(ys);
                var iye = Math.round(ye);

                // Draws the actual grid

                for (var x = xs, c = 0; x <= xe; x += stepping, c = (c + 1) % 10)
                {
                    x = Math.round((x - tx) / stepping) * stepping + tx;
                    var ix = Math.round(x);

                    if (c === 0) {
                        this.ctx.strokeStyle = '#93a1a140';
                    } else {
                        this.ctx.strokeStyle = '#eee8d5';
                    }
                    this.ctx.beginPath();
                    this.ctx.moveTo(ix + 0.5, iys + 0.5);
                    this.ctx.lineTo(ix + 0.5, iye + 0.5);
                    this.ctx.closePath();
                    this.ctx.stroke();
                }

                for (var y = ys, c = 0; y <= ye; y += stepping, c = (c + 1) % 10)
                {
                    y = Math.round((y - ty) / stepping) * stepping + ty;
                    var iy = Math.round(y);

                    if (c === 0) {
                        this.ctx.strokeStyle = '#93a1a140';
                    } else {
                        this.ctx.strokeStyle = '#eee8d5';
                    }
                    this.ctx.beginPath();
                    this.ctx.moveTo(ixs + 0.5, iy + 0.5);
                    this.ctx.lineTo(ixe + 0.5, iy + 0.5);
                    this.ctx.closePath();
                    this.ctx.stroke();
                }

            }
        }
    }
};

nabu.registerLibrary('VE.Grid');
