$("#Settings form").FormAjax();
(()=>{
    let enabled=$("#Enabled"),
        ApiPost=$("#ApiPost"),
        reference=$("#reference");
    enabled.change(function (){
        if(enabled.is(":checked")) {
            ApiPost.prop("disabled",false);
            DisableApiPost();
        }
        else {
            ApiPost.prop("disabled", true);
            DisableReference(true);
        }
    })
    ApiPost.change(DisableApiPost)
    function DisableApiPost(){
        if(ApiPost.is(":checked")) DisableReference(false);
        else DisableReference(true);
    }
    function DisableReference(bool){
        reference.prop("disabled",bool)
    }
    $.ajax("/Api",{
        dataType:"json",
        method:"GET"
    }).then(data=>{
        let value=reference.attr("data-value")
        data.forEach(dat=>{
            reference.append(`<option value="${dat.Name}" ${dat.Name===value?"selected":""}>${dat.Name}</option>`);
        })
    }).catch(reason => {console.log(reason)})
})()
