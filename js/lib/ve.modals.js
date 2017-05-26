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
        editor.lockWheel();
        var model = graph.getModel();
        var parent = graph.getDefaultParent();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e)
            {
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
                editor.unlockWheel();
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
        editor.lockWheel();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e)
            {
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
            },
            onHideCompleted: function(e)
            {
                editor.unlockWheel();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/destino/' + cell.objectId + '/contenido-principal');
    },

    url: function(editor, container, model, cell)
    {
        editor.lockWheel();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e)
            {
                e.source.close();
            },
            onHideCompleted: function(e)
            {
                editor.unlockWheel();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/destino/' + cell.objectId + '/url');
    },

    seo: function(editor, container, model, cell)
    {
        editor.lockWheel();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e)
            {
                e.source.close();
            },
            onHideCompleted: function(e)
            {
                editor.unlockWheel();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/destino/' + cell.objectId + '/seo');
    },

    section: function(editor, container, model, cell, id)
    {
        editor.lockWheel();
        id = (typeof id === 'undefined' ? '' : id);
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e)
            {
                var selector = container.find('[data-toggle="nabu-lang-selector"]');
                if (selector.length === 1) {
                    var data = selector.data();
                    if (data.defaultLang) {
                        var input = container.find('form input[name="title[' + data.defaultLang + ']"]');
                        if (input.length === 1) {
                            if (id === '') {
                                if (!cell.section_ids) {
                                    cell.section_ids = [e.params.response.json.data.id];
                                    cell.section_names = [input.val()];
                                } else {
                                    cell.section_ids.push(e.params.response.json.data.id);
                                    cell.section_names.push(input.val());
                                }
                            } else {
                                var p = cell.section_ids.indexOf(id);
                                if (p > -1) {
                                    cell.section_names[p] = input.val();
                                }
                            }
                        }
                    }
                }
                e.source.close();
            },
            onHideCompleted: function(e)
            {
                editor.unlockWheel();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/destino/' + cell.objectId + '/seccion/' + id);
    },

    removeSections: function(editor, container, model, cell)
    {
        editor.lockWheel();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e)
            {
                var ids = e.params.response.json.data.ids;
                if (ids instanceof Array && ids.length > 0 &&
                    cell.section_ids && cell.section_ids instanceof Array && cell.section_ids.length > 0
                ) {
                    console.log("Hola");
                    console.log(ids);
                    var section_ids = new Array();
                    var section_names = new Array();
                    for (var i = 0; i < cell.section_ids.length; i++) {
                        var sid = cell.section_ids[i];
                        if (ids.indexOf(sid * 1) < 0) {
                            section_ids.push(sid);
                            section_names.push(cell.section_names[i]);
                        }
                    }
                    cell.section_ids = section_ids;
                    cell.section_names = section_names;
                    console.log(section_ids);
                    console.log(section_names);
                }
                e.source.close();
            },
            onHideCompleted: function(e)
            {
                editor.unlockWheel();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/destino/' + cell.objectId + '/eliminar-secciones');
    },

    sdkIdentity: function(editor, container, model, cell)
    {
        editor.lockWheel();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e) {
                e.source.close();
            },
            onHideCompleted: function(e)
            {
                editor.unlockWheel();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/destino/' + cell.objectId + '/identificacion');
    },

    sdkHTML: function(editor, container, model, cell)
    {
        editor.lockWheel();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e)
            {
                e.source.close();
            },
            onHideCompleted: function(e)
            {
                editor.unlockWheel();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/destino/' + cell.objectId + '/html');
    },

    sdkPHP: function(editor, container, model, cell)
    {
        editor.lockWheel();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e)
            {
                e.source.close();
            },
            onHideCompleted: function(e)
            {
                editor.unlockWheel();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/destino/' + cell.objectId + '/php');
    },

    sdkSmarty: function(editor, container, model, cell)
    {
        editor.lockWheel();
        var modal = new Nabu.UI.Modal(container[0], {});
        modal.addEventListener(new Nabu.Event({
            onAfterSubmit: function(e)
            {
                e.source.close();
            },
            onHideCompleted: function(e)
            {
                editor.unlockWheel();
            }
        }));
        modal.openRemote('/es/productos/sitios/ajax/' + editor.id + '/destino/' + cell.objectId + '/smarty');
    }
};
nabu.registerLibrary('VE.Modals', ['Modal']);
