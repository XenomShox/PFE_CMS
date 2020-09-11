(()=>{$("#Settings form").FormAjax(()=>{Continue();});})();
$("#skip").click(function (){
    $.post("/install/Email",{
        skip:true
    })
        .then(data=>{window.location.replace("/");})
        .catch(reason => {$.notify({message: reason.responseText},{type: 'danger',placement:{from:"bottom"}})})
})