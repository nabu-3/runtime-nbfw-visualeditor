try {
    if (!Nabu) throw "Nabu Manager not loaded";
} catch (e) {
    throw "Nabu Manager not loaded";
}

if (typeof Nabu.VisualEditor === 'undefined') {
    Nabu.VisualEditor = function() {};
}

Nabu.VisualEditor.Editor = function(container, config)
{
    this.container = container;
    this.config = config;
    this.editor = null;
    this.grid = null;
    this.events = new Nabu.EventPool();
};

Nabu.VisualEditor.Editor.prototype =
{
    init: function()
    {
        var Self = this;
        var retval = false;

        if (!mxClient.isBrowserSupported()) {
            mxUtils.error('Browser is not supported!', 200, false);
        } else {
            mxEvent.disableContextMenu(document.body);
            var config = mxUtils.load(this.config).getDocumentElement();
            this.editor = new mxEditor(config);
            this.editor.setGraphContainer(this.container);
            var graph = this.editor.graph;
            var model = graph.getModel();
            graph.setPanning(true);
            graph.panningHandler.useLeftButtonForPanning = false;
            graph.setHtmlLabels(true);
            graph.setConnectable(true);
            graph.popupMenuHandler.autoExpand = true;
            new mxRubberband(graph);

            graph.addListener(mxEvent.CELLS_ADDED, function(sender, evt) {
                console.log('CELLS_ADDED');
                console.log(evt);
            });
            graph.addListener(mxEvent.CELLS_RESIZED, function(sender, evt) {
                Self.events.fireEvent('onCellsResized', sender, evt);
            });
            graph.addListener(mxEvent.CELLS_MOVED, function(sender, evt) {
                console.log('CELLS_MOVED');
                console.log(evt);
                Self.events.fireEvent('onCellsMoved', sender, evt);
            });
            graph.addListener(mxEvent.CELLS_REMOVED, function(sender, evt) {
                console.log('CELLS_REMOVED');
                console.log(evt);
            });

            graph.addListener(mxEvent.SPLIT_EDGE, function(sender, evt) {
                console.log('SPLIT_EDGE');
                console.log(evt);
            });
            graph.addListener(mxEvent.FLIP_EDGE, function(sender, evt) {
                console.log('FLIP_EDGE');
                console.log(evt);
            });

            graph.addListener(mxEvent.CELL_CONNECTED, function(sender, evt) {
                Self.events.fireEvent('onCellsConnected', sender, evt);
            });

            graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
                Self.events.fireEvent('onPopupMenu', menu, {
                    "evt": evt,
                    "cell": cell
                });
            }

            retval = true;
        }

        return retval;
    },
    addEventListener: function(event)
    {
        this.events.addEventListener(event);
    },

    removeEventListener: function(event)
    {
        this.events.removeEventListener(event);
    },

    enableGrid: function()
    {
        this.editor.graph.graphHandler.scaleGrid = true;
        this.grid = new Nabu.VisualEditor.Grid(this.editor.graph);
    },

    enableGuides: function()
    {
        mxGraphHandler.prototype.guidesEnabled = true;
    },

    enableVertexLivePreview: function()
    {
        mxVertexHandler.prototype.livePreview = true;
    },

    enableEdgeLayout: function()
    {
        var Self = this;
        var layout = new mxParallelEdgeLayout(this.editor.graph);
        var layoutMgr = new mxLayoutManager(this.editor.graph);

        this.editor.graph.addListener(mxEvent.CELL_CONNECTED, function(sender, evt)
        {
            var model = Self.editor.graph.getModel();
            var edge = evt.getProperty('edge');
            Self.layoutEdge(layout, edge);
        });

        layoutMgr.getLayout = function(cell)
        {
            return cell.getChildCount() > 0 ? layout : null;
        };

    },

    layoutEdge: function(layout, edge)
    {
        var model = this.editor.graph.getModel();
        var src = model.getTerminal(edge, true);
        var trg = model.getTerminal(edge, false);

        layout.isEdgeIgnored = function(edge2)
        {
            var src2 = model.getTerminal(edge2, true);
            var trg2 = model.getTerminal(edge2, false);

            return !(model.isEdge(edge2) && ((src == src2 && trg == trg2) || (src == trg2 && trg == src2)));
        };

        layout.execute(this.editor.graph.getDefaultParent());
    },

    load: function(source)
    {
        var Self = this;

        var ajax = new Nabu.Ajax.Connector(source, 'GET');
        ajax.addEventListener(new Nabu.Event({
            onLoad: function(e) {
                //var graph = Self.editor.graph;
                //var model = graph.getModel();
                Self.editor.readGraphModel(e.params.xml.documentElement);
            }
        }));
        ajax.execute();
    },

    setDefaultVertexFillColor: function(color)
    {
        var style = this.editor.graph.getStylesheet().getDefaultVertexStyle();
        style[mxConstants.STYLE_FILLCOLOR] = color;
    },

    setDefaultEdgeRounded: function(status)
    {
        style = this.editor.graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_ROUNDED] = status;
    },

    setDefaultEdgeTypeAsElbowConnector: function(orientation)
    {
        style = this.editor.graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
        this.editor.graph.alternateEdgeStyle = 'elbow=' + orientation;
    },

    fillWithSample: function()
    {
        var graph = this.editor.graph;
        var model = graph.getModel();

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        var parent = graph.getDefaultParent();

        // Adds cells to the model in a single step
        model.beginUpdate();
        try
        {
          var v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
          var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
          var e1 = graph.insertEdge(parent, null, '', v1, v2);
        }
        finally
        {
          // Updates the display
          model.endUpdate();
        }
    }
};

nabu.registerLibrary('VE.Editor', ['VE.Shapes', 'VE.Grid', 'Ajax', 'Event']);
