(()=> {
    class Templates{
        url="/Admin/templates/route?f=true";
        selector;
        constructor(selector) {
            if(!selector) throw new Error("Templates Div selector not sent/found in the class ");
            this.selector=selector;
            this.refresh();
        }
        refresh(){
            this.selector.empty().addClass("is-loading").css("height","100px");
            $.ajax(this.url,{method:"GET",dataType:"json"})
                .then(data=>{
                    if(data.length>0)data.forEach((templ,i)=>{
                        let temp=$(`<div class="col-12 col-md-6 col-lg-4">
                                <div class="card">
                                    <img class="card-img-top" src="/files/images/${templ.name}/preview.jpg" alt="Card image cap">
                                    <div class="card-body d-flex flex-column">
                                        <h4 class="card-title">${templ.name}</h4>
                                        <h6 class="card-subtitle">${templ.type}</h6>
                                        <p class="card-text">${templ.description}</p>
                                        <div class="row">
                                            <a class="mx-1 edit btn btn-border btn-warning col">Edit</a>
                                            <a class="mx-1 apply btn btn-border btn-success col ${i===0?'disabled':''}">Apply</a>
                                        </div>
                                    </div>
                                </div>
                            </div>`);
                        this.selector.append(temp);
                        temp.find(".edit").click(()=>{
                            console.log("/Admin/templates/"+templ._id);
                            clickHash("/Admin/templates/"+templ._id);
                        })
                        temp.find(".apply").click(()=>{
                            $.ajax("/Admin/templates/route",{method:"put",data:{id:templ._id}})
                                .then(data=>{ $.notify({message: data,},{type: 'success',placement:{from:"bottom"}}) })
                                .catch(reason => { $.notify({message: reason.responseText},{type: 'danger',placement:{from:"bottom"}}); })
                                .always(()=>{templates.refresh()})
                        })
                    })
                    else this.selector.append(`<h1 class="mx-auto">No Template is found</h1>`);
                    this.selector.removeClass("is-loading").css("height","");
                })
                .catch(reason => {
                    console.error(reason)
                    this.selector.append(`<h1 class="mx-auto">Something is wrong with the server.</h1>`);
                    this.selector.removeClass("is-loading").css("height","");
                });
        }
    }
    let template = $("#Template"),
        templates=new Templates($("#Templates")),
        verify=$("#Verify");
    template.FileSelector({
        url: "/files/Templates",
        selected:(path)=>{
            if(/^(\\?files)/g.test(path)) verify.removeClass("disabled").click(()=>{
                return $.ajax("/Admin/Templates/route",{data:{path}, method:"POST",timeout:0})
                    .then(data=>{
                        template.val("");
                        $.notify({message: data,},{type: 'success',placement:{from:"bottom"}});
                        templates.refresh();
                    })
                    .catch(reason => {
                        template.val("");
                        if(reason.responseText)$.notify({message: reason.responseText},{type: 'danger',placement:{from:"bottom"}});
                        else console.error(reason);
                    })
            });
            else verify.addClass("disabled").unbind("click");
        }
    });
})()
