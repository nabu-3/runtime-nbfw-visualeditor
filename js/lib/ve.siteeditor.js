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
};

Nabu.VisualEditor.SiteEditor.prototype.init = function()
{
    Nabu.VisualEditor.Editor.prototype.init.apply(this);
}

nabu.registerLibrary('VE.SiteEditor', ['VE.Editor'], function()
{
    nabu.extend(Nabu.VisualEditor.SiteEditor, Nabu.VisualEditor.Editor);
});
