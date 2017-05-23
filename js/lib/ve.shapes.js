try {
    if (!Nabu) throw "Nabu Manager not loaded";
} catch (e) {
    throw "Nabu Manager not loaded";
}

if (typeof Nabu.VisualEditor === 'undefined') {
    Nabu.VisualEditor = function() {};
}

if (typeof Nabu.VisualEditor.Shapes === 'undefined') {
    Nabu.VisualEditor.Shapes = function() {};
}

Nabu.VisualEditor.Shapes.SiteTarget = function()
{
    mxCylinder.call(this);
}
mxUtils.extend(Nabu.VisualEditor.Shapes.SiteTarget, mxCylinder);
Nabu.VisualEditor.Shapes.SiteTarget.prototype.modalMainContent = function(editor, container, model, cell)
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
Nabu.VisualEditor.Shapes.SiteTarget.prototype.modalNewSiteTarget = function(editor, container, graph, type, mxPoint)
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
}

Nabu.VisualEditor.Shapes.Page = function()
{
    Nabu.VisualEditor.Shapes.SiteTarget.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.Page, Nabu.VisualEditor.Shapes.SiteTarget);
Nabu.VisualEditor.Shapes.Page.prototype.modalNewPage = function(editor, container, model, mxPoint)
{
    Nabu.VisualEditor.Shapes.SiteTarget.prototype.modalNewSiteTarget.call(this, editor, container, model, 'page', mxPoint);
};
Nabu.VisualEditor.Shapes.Page.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
    if (isForeground) {
    } else {
        path.moveTo(0, 0);
        path.lineTo(w, 0);
        path.lineTo(w, h);
        path.lineTo(0, h);
        path.close();
    }
};
mxCellRenderer.prototype.defaultShapes['page'] = Nabu.VisualEditor.Shapes.Page;

Nabu.VisualEditor.Shapes.Document = function()
{
    Nabu.VisualEditor.Shapes.SiteTarget.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.Document, Nabu.VisualEditor.Shapes.SiteTarget);
Nabu.VisualEditor.Shapes.Document.prototype.modalNewDocument = function(editor, container, model, mxPoint)
{
    Nabu.VisualEditor.Shapes.SiteTarget.prototype.modalNewSiteTarget.call(this, editor, container, model, 'document', mxPoint);
};
Nabu.VisualEditor.Shapes.Document.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
    var fold = (w > 0 ? Math.round(Math.min(w * 0.10, h * 0.10)) : 0);

    if (isForeground) {
        if (fold > 0) {
            path.moveTo(w - fold, 0);
            path.lineTo(w - fold, fold);
            path.lineTo(w, fold);
        }
    } else {
        path.moveTo(0, 0);
        path.lineTo(w - fold, 0);
        path.lineTo(w, fold);
        path.lineTo(w, h);
        path.lineTo(0, h);
        path.lineTo(0, 0);
        path.close();
    }
};
mxCellRenderer.prototype.defaultShapes['document'] = Nabu.VisualEditor.Shapes.Document;

Nabu.VisualEditor.Shapes.PageMulti = function()
{
    Nabu.VisualEditor.Shapes.SiteTarget.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.PageMulti, Nabu.VisualEditor.Shapes.SiteTarget);
Nabu.VisualEditor.Shapes.PageMulti.prototype.modalNewPageMulti = function(editor, container, model, mxPoint)
{
    Nabu.VisualEditor.Shapes.SiteTarget.prototype.modalNewSiteTarget.call(this, editor, container, model, 'page-multi', mxPoint);
};
Nabu.VisualEditor.Shapes.PageMulti.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
    var fold = (w > 0 ? Math.round(Math.min(w * 0.10, h * 0.10)) : 0);
    var rep = Math.round(fold * 0.5);
    var rep2 = rep * 2;

    if (isForeground) {
        if (rep > 0) {
            path.moveTo(0, h - rep2);
            path.lineTo(w - rep2, h - rep2);
            path.lineTo(w - rep2, 0);
            path.moveTo(rep, h - rep);
            path.lineTo(w - rep, h - rep);
            path.lineTo(w - rep, rep);
        }
    } else {
        path.moveTo(0, 0);
        path.lineTo(w - rep2, 0);
        path.lineTo(w - rep2, rep);
        path.lineTo(w - rep, rep);
        path.lineTo(w - rep, rep2);
        path.lineTo(w, rep2);
        path.lineTo(w, h);
        path.lineTo(rep2, h);
        path.lineTo(rep2, h - rep);
        path.lineTo(rep, h - rep);
        path.lineTo(rep, h - rep2);
        path.lineTo(0, h - rep2);
        path.close();
    }
};
mxCellRenderer.prototype.defaultShapes['page-multi'] = Nabu.VisualEditor.Shapes.PageMulti;

Nabu.VisualEditor.Shapes.DocumentMulti = function()
{
    Nabu.VisualEditor.Shapes.SiteTarget.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.DocumentMulti, Nabu.VisualEditor.Shapes.SiteTarget);
Nabu.VisualEditor.Shapes.DocumentMulti.prototype.modalNewDocumentMulti = function(editor, container, model, mxPoint)
{
    Nabu.VisualEditor.Shapes.SiteTarget.prototype.modalNewSiteTarget.call(this, editor, container, model, 'document-multi', mxPoint);
};
Nabu.VisualEditor.Shapes.DocumentMulti.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
    var fold = (w > 0 ? Math.round(Math.min(w * 0.10, h * 0.10)) : 0);
    var rep = Math.round(fold * 0.5);
    var rep2 = rep * 2;

    if (isForeground) {
        if (fold > 0) {
            path.moveTo(w - fold - rep2, 0);
            path.lineTo(w - fold - rep2, fold);
            path.lineTo(w - rep2, fold);
            path.lineTo(w - rep2, h - rep2);
            path.lineTo(0, h - rep2);
            path.moveTo(rep2, h - rep);
            path.lineTo(w - rep, h - rep);
            path.lineTo(w - rep, fold + rep);
            path.lineTo(w - rep2, fold + rep);
            path.moveTo(w - rep, fold + rep2);
            path.lineTo(w, fold + rep2);
        }
    } else {
        path.moveTo(0, 0);
        path.lineTo(w - fold - rep2, 0);
        path.lineTo(w, fold + rep2, 0);
        path.lineTo(w, h);
        path.lineTo(rep2, h);
        path.lineTo(rep2, h - rep);
        path.lineTo(rep, h - rep);
        path.lineTo(rep, h - rep2);
        path.lineTo(0, h - rep2);
        path.close();
    }
};
mxCellRenderer.prototype.defaultShapes['document-multi'] = Nabu.VisualEditor.Shapes.DocumentMulti;

Nabu.VisualEditor.Shapes.ConditionalSelector = function()
{
    mxCylinder.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.ConditionalSelector, mxCylinder);
Nabu.VisualEditor.Shapes.ConditionalSelector.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
    var fold = (w > 0 ? Math.round(w / 4) : 0);

    if (isForeground) {

    } else {
        path.moveTo(fold, 0);
        path.lineTo(w - fold, 0);
        path.lineTo(w, h);
        path.lineTo(0, h);
        path.close();
    }
};
mxCellRenderer.prototype.defaultShapes['conditional-selector'] = Nabu.VisualEditor.Shapes.ConditionalSelector;

Nabu.VisualEditor.Shapes.Cluster = function()
{
    mxEllipse.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.Cluster, mxEllipse);
mxCellRenderer.prototype.defaultShapes['cluster'] = Nabu.VisualEditor.Shapes.Cluster;

Nabu.VisualEditor.Shapes.Decision = function()
{
    mxRhombus.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.Decision, mxRhombus);
mxCellRenderer.prototype.defaultShapes['decision'] = Nabu.VisualEditor.Shapes.Decision;

Nabu.VisualEditor.Shapes.MultipleChoice = function()
{
    mxTriangle.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.MultipleChoice, mxTriangle);
Nabu.VisualEditor.Shapes.MultipleChoice.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
    if (isForeground) {

    } else {
        path.moveTo(w / 2, 0);
        path.lineTo(w, h);
        path.lineTo(0, h);
        path.close();
    }
};
Nabu.VisualEditor.Shapes.MultipleChoice.prototype.apply = function(state)
{
    this.isDashed = true;
    mxTriangle.prototype.apply.apply(this, arguments);
    this.state = state;
};
mxCellRenderer.prototype.defaultShapes['multiple-choice'] = Nabu.VisualEditor.Shapes.MultipleChoice;

Nabu.VisualEditor.Shapes.CommonArea = function()
{
    mxCylinder.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.CommonArea, mxCylinder);
Nabu.VisualEditor.Shapes.CommonArea.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
    if (isForeground) {

    } else {
        path.roundrect(0, 0, w, h, this.style[mxConstants.STYLE_ARCSIZE], this.style[mxConstants.STYLE_ARCSIZE]);
    }
};
Nabu.VisualEditor.Shapes.CommonArea.prototype.apply = function(state)
{
    mxCylinder.prototype.apply.apply(this, arguments);
    this.isDashed = false;
    this.isRounded = true;
    this.state = state;
    this.style[mxConstants.STYLE_ARCSIZE] = 10;
};
mxCellRenderer.prototype.defaultShapes['common-area'] = Nabu.VisualEditor.Shapes.CommonArea;

Nabu.VisualEditor.Shapes.CommonAreaMulti = function()
{
    Nabu.VisualEditor.Shapes.CommonArea.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.CommonAreaMulti, Nabu.VisualEditor.Shapes.CommonArea);
Nabu.VisualEditor.Shapes.CommonAreaMulti.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
    var fold = (w > 0 ? Math.round(Math.min(w * 0.10, h * 0.10)) : 0);
    var rep = Math.round(fold * 0.5);
    var rep2 = rep * 2;
    var arc = this.style[mxConstants.STYLE_ARCSIZE];
    var arc2 = arc * 2;
    var arc3 = arc * 3;

    if (isForeground) {
        path.moveTo(w - arc2, arc);
        path.lineTo(w - arc2, h - arc3);
        path.arcTo(arc, arc, 0, 0, 1, w - arc3, h - arc2);
        path.lineTo(arc, h - arc2);
        path.moveTo(w - arc, arc2);
        path.lineTo(w - arc, h - arc2);
        path.arcTo(arc, arc, 0, 0, 1, w - arc2, h - arc);
        path.lineTo(arc2, h - arc);
    } else {
        path.moveTo(0, arc);
        path.arcTo(arc, arc, 0, 0, 1, arc, 0);
        path.lineTo(w - arc3, 0);
        path.arcTo(arc, arc, 0, 0, 1, w - arc2, arc);
        path.arcTo(arc, arc, 0, 0, 1, w - arc, arc2);
        path.arcTo(arc, arc, 0, 0, 1, w, arc3);
        path.lineTo(w, h - arc);
        path.arcTo(arc, arc, 0, 0, 1, w - arc, h);
        path.lineTo(arc3, h);
        path.arcTo(arc, arc, 0, 0, 1, arc2, h - arc);
        path.arcTo(arc, arc, 0, 0, 1, arc, h - arc2);
        path.arcTo(arc, arc, 0, 0, 1, 0, h - arc3);
        path.close();
    }
};
mxCellRenderer.prototype.defaultShapes['common-area-multi'] = Nabu.VisualEditor.Shapes.CommonAreaMulti;

Nabu.VisualEditor.Shapes.ConditionalArea = function()
{
    Nabu.VisualEditor.Shapes.CommonArea.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.ConditionalArea, Nabu.VisualEditor.Shapes.CommonArea);
Nabu.VisualEditor.Shapes.ConditionalArea.prototype.apply = function(state)
{
    Nabu.VisualEditor.Shapes.CommonArea.prototype.apply.apply(this, arguments);
    this.isDashed = true;
    this.isRounded = true;
    this.state = state;
    this.style[mxConstants.STYLE_ARCSIZE] = 10;
};
mxCellRenderer.prototype.defaultShapes['conditional-area'] = Nabu.VisualEditor.Shapes.ConditionalArea;

Nabu.VisualEditor.Shapes.ConditionalAreaMulti = function()
{
    Nabu.VisualEditor.Shapes.CommonAreaMulti.call(this);
};
mxUtils.extend(Nabu.VisualEditor.Shapes.ConditionalAreaMulti, Nabu.VisualEditor.Shapes.CommonAreaMulti);
Nabu.VisualEditor.Shapes.ConditionalAreaMulti.prototype.apply = function(state)
{
    Nabu.VisualEditor.Shapes.CommonAreaMulti.prototype.apply.apply(this, arguments);
    this.isDashed = true;
    this.isRounded = true;
    this.state = state;
    this.style[mxConstants.STYLE_ARCSIZE] = 10;
};
mxCellRenderer.prototype.defaultShapes['conditional-area-multi'] = Nabu.VisualEditor.Shapes.ConditionalAreaMulti;

nabu.registerLibrary('VE.Shapes');
