let content=$(".content");
function getMultiScripts(arr) {
    var _arr = $.map(arr, function(scr) {
        return $.getScript( scr );
    });
    _arr.push($.Deferred(function( deferred ){
        $( deferred.resolve );
    }));
    return $.when.apply($, _arr);
}
function Get(){
    content.remove();
    return $.get("/install/?f=true")
}
function Continue(){
    Get().done((data, textStatus, jqXHR)=>{
        if(jqXHR.status===202)window.location.replace("/");
        content=$(data);
        $(".wrapper").prepend(content);
        let attr=content.attr("plugin-scripts"),loading=content.attr("loading-script");
        if(attr) getMultiScripts(attr.split(","))
            .done(function() {
                if(loading) $.getScript( loading );
            });
        else if(loading) $.getScript( loading );
    })
        .catch(reason => {
            window.location.replace("/");
        })
}