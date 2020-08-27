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
        let Color=query.attr("data-color");
        elm.attr("data-background-color",Color);
        query.parent().find(".selected").removeClass("selected");
        query.addClass("selected").closest(".switch-block").find("input").val(Color);
        SaveChanges("Color");
    }
    function SaveChanges(type){
        var values = {},
            settings=$('#Settings');
        $.each(settings.serializeArray(), function(i, field) {
            values[field.name] = field.value;
        });
        $.ajax(settings.attr("action"),{method:"PUT",data:values})
            .then(data=>{
                $.notify({message: `${type} is saved`,},{type: 'success',placement:{from:"bottom"}});
            })
            .catch(reason => {$.notify({message: reason.responseText},{type: 'danger',placement:{from:"bottom"}});})
    }
    (function SelectedLayout(){
        var classList=$(".wrapper")[0].classList;
        classList.remove("wrapper");
        $('[value="'+classList.value+'"]').prop("checked", true);
        classList.add("wrapper");
    })();
    $('[name="Admin[layout]"]').click(function (){
        let val=$(this).val();
        $(".wrapper").attr("class",`wrapper ${val}`);
        if(val==="overlay-sidebar") logoHeader.find(".nav-toggle button").attr("class","btn btn-toggle sidenav-overlay-toggler");
        else logoHeader.find(".nav-toggle button").attr("class","btn btn-toggle toggle-sidebar");
        SaveChanges("Layout");
    })
    function SelectedColor(color,selected) {
        let Color=color.attr("data-background-color");
        $(`${selected}[data-color="${Color}"]`).addClass("selected").closest(".switch-block").find("input").val(Color);
    }
    SelectedColor(body,".changeBackgroundColor");
    SelectedColor(logoHeader,".changeLogoHeaderColor");
    SelectedColor(navBar,".changeTopBarColor");
    SelectedColor(slideBar,".changeSideBarColor");

})();
