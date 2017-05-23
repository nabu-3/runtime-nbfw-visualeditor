try {
    if (!Nabu) throw "Nabu Manager not loaded";
} catch (e) {
    throw "Nabu Manager not loaded";
}

if (typeof Nabu.VisualEditor === 'undefined') {
    Nabu.VisualEditor = function() {};
}

if (typeof Nabu.VisualEditor.Modals === 'undefined') {
    Nabu.VisualEditor.Modals = function() {};
}

Nabu.VisualEditor.Modals.SiteTarget = function()
{
}

Nabu.VisualEditor.Modals.SiteTarget.prototype =
{
    newSiteTarget: function(editor, container, graph, type, mxPoint)
    {
        var model = graph.getModel();
        var parent = graph.getDefaultParent();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e) {
                var selector = container.find('[data-toggle="nabu-lang-selector"]');
                if (selector.length === 1) {
                    var data = selector.data();
                    if (data.defaultLang) {
                        var input = container.find('form input[name="title[' + data.defaultLang + ']"]');
                        if (input.length === 1) {
                            var vertex = graph.insertVertex(
                                parent, null, input.val(), mxPoint.x, mxPoint.y, 120, 160, 'shape=' + type + ';whiteSpace=wrap;'
                            );
                            vertex.type = type;
                            vertex.objectId = e.params.response.json.data.id * 1;
                            vertex.id = 'st-' + e.params.response.json.data.id;
                            editor.saveCellsGeometry([vertex]);
                        }
                    }
                }
                e.source.close();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/nuevo-destino?type=' + type);
    },

    newPage: function(editor, container, model, mxPoint)
    {
        this.newSiteTarget(editor, container, model, 'page', mxPoint);
    },

    newDocument: function(editor, container, model, mxPoint)
    {
        this.newSiteTarget(editor, container, model, 'document', mxPoint);
    },

    newPageMulti: function(editor, container, model, mxPoint)
    {
        this.newSiteTarget(editor, container, model, 'page-multi', mxPoint);
    },

    newDocumentMulti: function(editor, container, model, mxPoint)
    {
        this.newSiteTarget(editor, container, model, 'document-multi', mxPoint);
    },

    mainContent: function(editor, container, model, cell)
    {
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
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/' + cell.objectId + '/contenido-principal');
    }
};
nabu.registerLibrary('VE.Modals', ['Modal']);
