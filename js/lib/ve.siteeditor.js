try {
    if (!Nabu) throw "Nabu Manager not loaded";
} catch (e) {
    throw "Nabu Manager not loaded";
}

if (typeof Nabu.VisualEditor === 'undefined') {
    Nabu.VisualEditor = function() {};
}

Nabu.VisualEditor.SiteEditor = function(container, config)
{
    Nabu.VisualEditor.Editor.call(this, container, config);

    this.id = null;
};

nabu.registerLibrary('VE.SiteEditor', ['VE.Editor', 'VE.Modals', 'Modal'], function()
{
    nabu.extend(Nabu.VisualEditor.SiteEditor, Nabu.VisualEditor.Editor);

    Nabu.VisualEditor.SiteEditor.prototype.init = function()
    {
        var retval = Nabu.VisualEditor.Editor.prototype.init.apply(this);
        var Self = this;

        this.addEventListener(new Nabu.Event({
            onCellsResized: function (e) {
                if (e.params.properties.cells.length > 0) {
                    Self.saveCellsGeometry(e.params.properties.cells);
                }
            },
            onCellsMoved: function(e) {
                if (e.params.properties.cells.length > 0) {
                    Self.saveCellsGeometry(e.params.properties.cells);
                }
            },
            onCellsConnected: function(e) {
                var id = e.params.properties.edge.objectId ? e.params.properties.edge.objectId : null;
                var source_id = (e.params.properties.edge.source !== null && e.params.properties.edge.source.objectId)
                              ? e.params.properties.edge.source.objectId
                              : null
                ;
                var source_type = (e.params.properties.edge.source !== null && e.params.properties.edge.source.type)
                                ? e.params.properties.edge.source.type
                                : null
                ;
                var target_id = (e.params.properties.edge.target !== null && e.params.properties.edge.target.objectId)
                              ? e.params.properties.edge.target.objectId
                              : null
                ;
                var target_type = (e.params.properties.edge.target !== null && e.params.properties.edge.target.type)
                                ? e.params.properties.edge.target.type
                                : null
                ;
                if ((source_type === 'page' || source_type === 'page-multi' || source_type === 'document' || source_type === 'document-multi') &&
                    (target_type === 'page' || target_type === 'page-multi' || target_type === 'document' || target_type === 'document-multi')
                ) {
                    id = Self.saveCTAConnection(id, source_id, target_id);
                    if (id !== null) {
                        e.params.properties.edge.id = 'cta-' + id;
                        e.params.properties.edge.type = 'cta';
                        e.params.properties.edge.objectId = id * 1;
                        Self.saveCellsGeometry([e.params.properties.edge]);
                    } else {
                        throw "Invalid ID returned";
                    }
                }
            },
            onPopupMenu: function(e) {
                var menu = e.source;
                var cell = e.params.cell;
                var evt = e.params.evt;

                if (cell === null) {
                    Self.fillBackgroundPopupMenu(menu, evt);
                } else if (cell.type) {
                    switch (cell.type) {
                        case 'page':
                            Self.fillPagePopupMenu(menu, cell, evt);
                            menu.addSeparator();
                            Self.fillCommonVertexPopupMenu(menu, cell, evt);
                            break;
                        case 'page-multi':
                            Self.fillPageMultiPopupMenu(menu, cell, evt);
                            menu.addSeparator();
                            Self.fillCommonVertexPopupMenu(menu, cell, evt);
                            break;
                        case 'document':
                            Self.fillDocumentPopupMenu(menu, cell, evt);
                            menu.addSeparator();
                            Self.fillCommonVertexPopupMenu(menu, cell, evt);
                            break;
                        case 'document-multi':
                            Self.fillDocumentMultiPopupMenu(menu, cell, evt);
                            menu.addSeparator();
                            Self.fillCommonVertexPopupMenu(menu, cell, evt);
                            break;
                    }
                    if (cell.objectId) {
                        menu.addSeparator();
                        menu.addItem('ID: #' + cell.objectId, null, null, null, null, false, false);
                    }
                }
            }
        }));

        return retval;
    }

    Nabu.VisualEditor.SiteEditor.prototype.fillBackgroundPopupMenu = function(menu, evt)
    {
        var container = $('#ve_remote_modal_container');
        if (container.length !== 1) {
            throw "Remote Modals container not found";
        }

        var Self = this;
        var graph = this.editor.graph;
        var model = graph.getModel();
        var parent = graph.getDefaultParent();
        var mxPoint = graph.getPointForEvent(evt);
        var target_modals = new Nabu.VisualEditor.Modals.SiteTarget();
        var map_modals = new Nabu.VisualEditor.Modals.SiteMap();

        var submenu = menu.addItem('Nuevo', null, null);
        menu.addItem('Página', null, function()
        {
            target_modals.newPage(Self, container, graph, mxPoint);
        }, submenu);
        menu.addItem('Página Múltiple', null, function()
        {
            target_modals.newPageMulti(Self, container, graph, mxPoint);
        }, submenu);
        menu.addSeparator(submenu);
        menu.addItem('Documento', null, function()
        {
            target_modals.newDocument(Self, container, graph, mxPoint);
        }, submenu);
        menu.addItem('Documento Múltiple', null, function()
        {
            target_modals.newDocumentMulti(Self, container, graph, mxPoint);
        }, submenu);
        menu.addSeparator(submenu);
        menu.addItem('Grupo de páginas', null, function()
        {
            map_modals.newMap(Self, container, graph, mxPoint);
        }, submenu);
        /*
        menu.addItem('Selector condicional', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nuevo selector condicional', mxPoint.x, mxPoint.y, 120, 40, 'shape=conditional-selector;whiteSpace=wrap;');
        }, submenu);
        menu.addItem('Decisión', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nueva decisión', mxPoint.x, mxPoint.y, 40, 40, 'shape=decision;whiteSpace=wrap;');
        }, submenu);
        menu.addItem('Elección múltiple', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nueva elección múltiple', mxPoint.x, mxPoint.y, 40, 40, 'shape=multiple-choice;whiteSpace=wrap;');
        }, submenu);
        menu.addSeparator(submenu);
        menu.addItem('Área común', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nuevo área común', mxPoint.x, mxPoint.y, 400, 400, 'shape=common-area;whiteSpace=wrap;');
        }, submenu);
        menu.addItem('Área común múltiple', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nuevo área común múltiple', mxPoint.x, mxPoint.y, 400, 400, 'shape=common-area-multi;whiteSpace=wrap;');
        }, submenu);
        menu.addItem('Área condicional', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nuevo área condicional', mxPoint.x, mxPoint.y, 400, 400, 'shape=conditional-area;whiteSpace=wrap;');
        }, submenu);
        menu.addItem('Área condicional múltiple', null, function()
        {
            var mxPoin = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nuevo área condicional múltiple', mxPoint.x, mxPoint.y, 400, 400, 'shape=conditional-area-multi;whiteSpace=wrap;');
        }, submenu);
        */
    }

    Nabu.VisualEditor.SiteEditor.prototype.fillCommonVertexPopupMenu = function(menu, cell, evt)
    {
        var graph = this.editor.graph;
        var model = graph.getModel();

        var submenu = menu.addItem('Orden', null, null);
        menu.addItem('Enviar al fondo', null, function()
        {
            var parent = cell.getParent();
            if (parent !== null) {
                model.beginUpdate();
                cell.removeFromParent();
                parent.insert(cell, 0);
                model.endUpdate();
                graph.graphModelChanged([parent, cell]);
            }
        }, submenu);
        menu.addItem('Traer al frente', null, function()
        {
            var parent = cell.getParent();
            if (parent !== null) {
                model.beginUpdate();
                cell.removeFromParent();
                parent.insert(cell);
                model.endUpdate();
                graph.graphModelChanged([parent, cell]);
            }
        }, submenu);
    }

    Nabu.VisualEditor.SiteEditor.prototype.fillSiteTargetContentPopupSubmenu = function(menu, cell)
    {
        var container = $('#ve_remote_modal_container');
        if (container.length !== 1) {
            throw "Remote Modals container not found";
        }

        var Self = this;
        var graph = this.editor.graph;
        var model = graph.getModel();
        var target_modals = new Nabu.VisualEditor.Modals.SiteTarget();
        var submenu = menu.addItem('Contenido', null, null);
        menu.addItem('Principal', null, function()
        {
            target_modals.mainContent(Self, container, model, cell);
        }, submenu);
        var secciones = menu.addItem('Secciones', null, null, submenu);
        menu.addItem('Nueva sección', null, function()
        {
            target_modals.section(Self, container, model, cell);
        }, secciones);
        if (cell.section_ids && cell.section_ids !== null && cell.section_ids.length > 0) {
            menu.addSeparator(secciones);
            for (var i = 0; i < cell.section_ids.length; i++) {
                var id = cell.section_ids[i];
                var name = cell.section_names[i];
                var item = menu.addItem(name, null, function(evt)
                {
                    var id = $(evt.target).closest('tr').data('id');
                    target_modals.section(Self, container, model, cell, id);
                }, secciones);
                $(item).data('id', id);
            }
            menu.addSeparator(secciones);
            menu.addItem('Eliminar secciones', null, function(evt)
            {
                target_modals.removeSections(Self, container, model, cell);
            }, secciones);
        }
        menu.addSeparator(submenu);
        if (cell.type === 'page' || cell.type === 'page-multi') {
            menu.addItem('SEO', null, function() {
                target_modals.seo(Self, container, model, cell);
            }, submenu);
        }
        menu.addItem('URL', null, function()
        {
            target_modals.url(Self, container, model, cell);
        });
        var sdk = menu.addItem('SDK', null, null);
        menu.addItem('Identificación', null, function()
        {
            target_modals.sdkIdentity(Self, container, model, cell);
        }, sdk);
        menu.addSeparator(sdk);
        menu.addItem('HTML', null, function()
        {
            target_modals.sdkHTML(Self, container, model, cell);
        }, sdk);
        menu.addItem('PHP / Framework', null, function()
        {
            target_modals.sdkPHP(Self, container, model, cell);
        }, sdk);
        menu.addItem('Smarty', null, function()
        {
            target_modals.sdkSmarty(Self, container, model, cell);
        }, sdk);
    }

    Nabu.VisualEditor.SiteEditor.prototype.fillPagePopupMenu = function(menu, cell, evt)
    {
        this.fillSiteTargetContentPopupSubmenu(menu, cell);
    }

    Nabu.VisualEditor.SiteEditor.prototype.fillPageMultiPopupMenu = function(menu, cell, evt)
    {
        this.fillSiteTargetContentPopupSubmenu(menu, cell);
    }

    Nabu.VisualEditor.SiteEditor.prototype.fillDocumentPopupMenu = function(menu, cell, evt)
    {
        this.fillSiteTargetContentPopupSubmenu(menu, cell);
    }

    Nabu.VisualEditor.SiteEditor.prototype.fillDocumentMultiPopupMenu = function(menu, cell, evt)
    {
        this.fillSiteTargetContentPopupSubmenu(menu, cell);
    }

    Nabu.VisualEditor.SiteEditor.prototype.setId = function(id)
    {
        this.id = id;
    }

    Nabu.VisualEditor.SiteEditor.prototype.encodeGeometry = function(cell)
    {
        data = {
            "id": cell.id,
            "x": cell.geometry.x,
            "y": cell.geometry.y,
            "width": cell.geometry.width,
            "height": cell.geometry.height,
            "points": {
                "source": null,
                "target": null,
                "intermediate": null
            }
        };
        var geo = cell.geometry;
        if (geo.sourcePoint || geo.targetPoint || geo.points) {
            var points = data.points;
            if (geo.sourcePoint) {
                points.source = {
                    "x": geo.sourcePoint.x,
                    "y": geo.sourcePoint.y
                };
            }
            if (geo.targetPoint) {
                points.target = {
                    "x": geo.targetPoint.x,
                    "y": geo.targetPoint.y
                };
            }
            if (geo.points) {
                points.intermediate = new Array();
                for (var i in geo.points) {
                    var point = geo.points[i];
                    points.intermediate.push({
                        "x": point.x,
                        "y": point.y
                    });
                }
            }
            data.points = points;
        }

        return data;
    }

    Nabu.VisualEditor.SiteEditor.prototype.saveCellsGeometry = function(geom_cells)
    {
        if (this.id !== null) {
            var cells = [];
            for (var i in geom_cells) {
                var vertex = geom_cells[i];
                cells.push(this.encodeGeometry(vertex));
                if (vertex.edges !== null && vertex.edges.length > 0) {
                    for (var j in vertex.edges) {
                        var edge = vertex.edges[j];
                        cells.push(this.encodeGeometry(edge));
                    }
                }
            }
            var ajax = new Nabu.Ajax.Connector(
                '/api/site/' + this.id + '/visual-editor/cell/?action=mass-geometry',
                'POST',
                {
                    "headerAccept": "application/json",
                    "contentType": "application/json",
                    "synchronous": true
                }
            );
            ajax.addEventListener(new Nabu.Event({
                onLoad: function(evt) {
                    //console.log(evt);
                    return true;
                }
            }));
            ajax.setPostJSON(cells);
            ajax.execute();
        } else {
            throw "Site Editor requires a valid Id to save entities.";
        }
    }

    Nabu.VisualEditor.SiteEditor.prototype.saveCTAConnection = function(id, source, target)
    {
        if (this.id !== null) {
            var ajax = new Nabu.Ajax.Connector(
                '/api/site/' + this.id + '/visual-editor/cell/?action=set-cta',
                'POST',
                {
                    "headerAccept": "application/json",
                    "contentType": "application/json",
                    "synchronous": true
                }
            );
            ajax.addEventListener(new Nabu.Event({
                onLoad: function(evt) {
                    var cta = evt.params.json.data;
                    id =cta.id;
                    return true;
                }
            }));
            ajax.setPostJSON({
                "id": id,
                "source_id": source,
                "target_id": target
            });
            ajax.execute();
        } else {
            throw "Site Editor requires a valid Id to save entities.";
        }

        return id;
    }
});
