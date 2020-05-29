(()=>{
    let body=$('body'),
        logoHeader=$('.logo-header[data-background-color]'),
        navBar=$('.navbar[data-background-color]'),
        slideBar=$(".sidebar[data-background-color]");
    $('.changeBackgroundColor').click(function() { SwitchColor(body,$(this)); });
    $('.changeLogoHeaderColor').click(function() { SwitchColor(logoHeader,$(this)); });
    $('.changeTopBarColor').click(function() { SwitchColor(navBar,$(this)); });
    $('.changeSideBarColor').click(function() { SwitchColor(slideBar,$(this)); });
    function SwitchColor(elm,query) {
        elm.attr("data-background-color",query.attr("data-color"));
        query.parent().find(".selected").removeClass("selected");
        query.addClass("selected");
    }
    function SelectedColor(color,selected) {
        $(`${selected}[data-color="${color.attr("data-background-color")}"]`).addClass("selected");
    }
    SelectedColor(body,".changeBackgroundColor");
    SelectedColor(logoHeader,".changeLogoHeaderColor");
    SelectedColor(navBar,".changeTopBarColor");
    SelectedColor(slideBar,".changeSideBarColor");
})();