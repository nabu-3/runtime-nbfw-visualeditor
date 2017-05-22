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

nabu.registerLibrary('VE.SiteEditor', ['VE.Editor', 'Modal'], function()
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
                var target_id = (e.params.properties.edge.target !== null && e.params.properties.edge.target.objectId)
                              ? e.params.properties.edge.target.objectId
                              : null
                ;
                id = Self.saveCTAConnection(id, source_id, target_id);
                if (id !== null) {
                    e.params.properties.edge.id = 'cta-' + id;
                    e.params.properties.edge.type = 'cta';
                    e.params.properties.edge.objectId = id * 1;
                    Self.saveCellsGeometry([e.params.properties.edge]);
                } else {
                    throw "Invalid ID returned";
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
                            Self.fillCommonVertexPopupMenu(menu, cell, evt);
                            break;
                    }
                }
            }
        }));

        return retval;
    }

    Nabu.VisualEditor.SiteEditor.prototype.fillBackgroundPopupMenu = function(menu, evt)
    {
        var Self = this;
        var graph = this.editor.graph;
        var model = graph.getModel();
        var parent = graph.getDefaultParent();

        var submenu = menu.addItem('Nuevo', null, null);
        menu.addItem('Página', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            var ve_modal = $('#ve_new_page');
            var form = ve_modal.find('form')[0];
            form.reset();
            $(form).on('response.form.nabu', function(e, params) {
                $(form).unbind('response.form.nabu');
                var title = ve_modal.find('[name^="title["]').val();
                var vertex = graph.insertVertex(
                    parent, null, title, mxPoint.x, mxPoint.y, 120, 160, 'shape=page;whiteSpace=wrap;'
                );
                vertex.type = 'page';
                vertex.objectId = params.response.json.data.id * 1;
                vertex.id = 'st-' + params.response.json.data.id;
                Self.saveCellsGeometry([vertex]);
                ve_modal.modal('hide');
                return true;
            });
            ve_modal.modal('show');
            ve_modal.on('hide.bs.modal', function() {
                $(this).unbind('click');
                $(form).unbind('response.form.nabu');
            });
            ve_modal.find('.btn-success').on('click', function() {
                $(this).unbind('click');
            });
        }, submenu);
        menu.addItem('Página Múltiple', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nueva página múltiple', mxPoint.x, mxPoint.y, 120, 160, 'shape=page-multi;whiteSpace=wrap;');
        }, submenu);
        menu.addSeparator(submenu);
        menu.addItem('Documento', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nuevo documento', mxPoint.x, mxPoint.y, 120, 160, 'shape=document;whiteSpace=wrap;');
        }, submenu);
        menu.addItem('Documento Múltiple', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nuevo documento múltiple', mxPoint.x, mxPoint.y, 120, 160, 'shape=document-multi;whiteSpace=wrap;');
        }, submenu);
        menu.addSeparator(submenu);
        menu.addItem('Grupo de páginas', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            graph.insertVertex(parent, null, 'Nuevo grupo de páginas', mxPoint.x, mxPoint.y, 40, 40, 'shape=cluster;whiteSpace=wrap;');
        }, submenu);
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

    Nabu.VisualEditor.SiteEditor.prototype.fillPagePopupMenu = function(menu, cell, evt)
    {
        var Self = this;
        var graph = this.editor.graph;
        var model = graph.getModel();

        var submenu = menu.addItem('Editar', null, null);
        menu.addItem('Contenido principal', null, function()
        {
            var container = $('#ve_remote_modal_container');
            if (container.length === 1) {
                var modal = new Nabu.UI.Modal(container[0], {});
                modal.addEventListener(new Nabu.Event({
                    onAfterSubmit: function(e) {
                        var selector = container.find('[data-toggle="nabu-lang-selector"]');
                        if (selector.length === 1) {
                            var data = selector.data();
                            if (data.defaultLang) {
                                var input = container.find('form input[name="title[' + data.defaultLang + ']"]');
                                if (input.length === 1) {
                                    model.setValue(cell, input.val());
                                }
                            }
                        }
                        e.source.close();
                    }
                }));
                modal.openRemote('/es/productos/sitios/ajax/' + Self.id + '/' + cell.objectId + '/contenido-principal');
            } else {
                throw "Remote Modals container not found";
            }
        }, submenu);
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
                        console.log(edge);
                        cells.push(this.encodeGeometry(edge));
                    }
                }
            }
            console.log(cells);
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
