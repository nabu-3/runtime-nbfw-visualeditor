/* Static load of mxGraph library */
(function() {
    mxBasePath = "/runtime/assets/mxgraph/3.7.2/src";
    document.write('<script type="text/javascript" src="/runtime/assets/mxgraph/3.7.2/mxClient.min.js"></script>');
    Nabu.LibraryManager.Packages.registerPackage(
        '/runtime/nbfw/visualeditor/js/lib/',
        ['VE.Shapes', 'VE.Grid', 'VE.Editor', 'VE.SiteEditor']
    );
})();
