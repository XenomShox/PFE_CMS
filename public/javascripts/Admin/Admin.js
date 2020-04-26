let $data=$(".content");
function ChangeUrl(title, url) {
    if (typeof (history.pushState) != "undefined") {
        var obj = { Title: title, Url: url };
        history.pushState(obj, obj.Title, obj.Url);
    } else {
        alert("Browser does not support HTML5.");
    }
}
$.getMultiScripts = function(arr) {
    var _arr = $.map(arr, function(scr) {
        return $.getScript( scr );
    });

    _arr.push($.Deferred(function( deferred ){
        $( deferred.resolve );
    }));

    return $.when.apply($, _arr);
};
function clickHash(url){
    $data.remove();
    $.get(url+"?f=true",(data)=>{
        $data=$(data);
        ChangeUrl(url.split("/")[2],url);
        $(".main-panel").prepend($data);
        let attr=$data.attr("plugin-scripts"),loading=$data.attr("loading-script");
        if(attr) $.getMultiScripts(attr.split(",")).done(function() {
            // all scripts loaded
            if(loading) $.getScript( loading );
        });
        else if(loading) $.getScript( loading );

    });
}
$('a[loading-Link]').each((index,elem)=>{
    $(elem).click(function(){
        let $this=$(this);
        clickHash($this.attr("loading-Link"));
        $(".active").removeClass("active");
        $this.parent().addClass("active");
    });
});