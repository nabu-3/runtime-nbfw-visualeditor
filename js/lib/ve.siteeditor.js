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

nabu.registerLibrary('VE.SiteEditor', ['VE.Editor'], function()
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
                console.log(e);
                var menu = e.source;
                var cell = e.params.cell;
                var evt = e.params.evt;

                if (cell === null) {
                    Self.fillBackgroundPopupMenu(menu);
                }
            }
        }));

        return retval;
    }

    Nabu.VisualEditor.SiteEditor.prototype.fillBackgroundPopupMenu = function(menu)
    {
        var submenu = menu.addItem('Nuevo', null, null);
        menu.addItem('Página', null, function()
        {
            var mxPoint = graph.getPointForEvent(evt);
            var ve_modal = $('#ve_new_page');
            ve_modal.find('form')[0].reset();
            ve_modal.modal('show');
            ve_modal.on('hide.bs.modal', function() {
            });
            ve_modal.find('.btn-success').on('click', function() {
                $(this).unbind('click');
                var title = ve_modal.find('[name^="title["]').val();
                graph.insertVertex(parent, null, title, mxPoint.x, mxPoint.y, 120, 160, 'shape=page;whiteSpace=wrap;');
                ve_modal.modal('hide');
            });

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
