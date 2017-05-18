$.fn.nabuVESiteEditor = function(options)
{
    if (typeof options === 'string') {
        this.each(function() {
            console.log('nabuVESiteEditor ' + options);
            if (options === 'show' && this.nabuVESiteEditor) {
                console.log('VE.SiteEditor show');
                //$(this).empty();
                var editor = this.nabuVESiteEditor;
                if (editor.init()) {
                    editor.enableGrid();
                    editor.enableGuides();
                    editor.enableVertexLivePreview();
                    editor.enableEdgeLayout();
                    editor.setDefaultVertexFillColor('#ffffff');
                    editor.setDefaultEdgeRounded(false);
                    editor.setDefaultEdgeTypeAsElbowConnector('vertical');

                    var data = $(this).data();
                    if (data['source']) {
                        editor.load(data['source']);
                    } else {
                        editor.fillWithSample();
                    }
                    //editor.fillWithSample();
                }

            }
        });
        return false;
    } else {
        return this.each(function() {
            var opts = $.extend({}, $.fn.nabuVESiteEditor.defaults, options);
            var data = $(this).data();
            opts = $.extend({}, opts, data);
            this.nabuVESiteEditor = new Nabu.VisualEditor.SiteEditor(this, '/js/visual-editor/config/site-target.xml', opts);
            this.nabuVESiteEditor.addEventListener(new Nabu.Event({

            }));
        });
    }
}

$.fn.nabuVESiteEditor.defaults = {

};

function nbBootstrapVESiteEditors(container)
{
    var editors = $(container).find('[data-toggle="ve-site"]');
    if (editors.length > 0) {
        nabu.loadLibrary('VE.SiteEditor', function() {
            editors.nabuVESiteEditor();
        });
    }
}

function nbBoostrapVEToggleAll(container)
{
    nbBootstrapVESiteEditors(container);
}

$(document).ready(function() {
    nbBoostrapVEToggleAll(document);
});
