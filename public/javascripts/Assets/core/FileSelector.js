(()=>{
    class FileSelector{
        static Types={
            Compressed:".7z,.arj,.deb,.pkg,.rar,.rpm,.gz,.z,.zip",
            Font:".fnt,.fon,.otf,.ttf",
            Image:"image/*",
            Icon:"image/x-icon",
            Spreadsheet:".ods,.xls,.xlsm,.xlsx",
            Video:"video/*",
            Word:"doc,docx",
            Pdf:".pdf",
            Text:"text/*",
            Flash:".swf",
            Audio:"audio/*",
            PowerPoint:".key,.odp,.ppt,.pps,.pptx"
        }
        #Tab={};
        #input;
        #Url;
        #Type;
        #Checked;
        #CurrentUrl;
        success;
        fail;
        onload;
        selected;
        constructor(selector,options){
            if(!options || !options.url) throw new Error();
            if(options.success)this.success=options.success;
            if(options.fail)this.fail=options.fail;
            if(options.onload)this.onload=options.onload;
            if(options.selected)this.selected=options.selected;
            this.#Url=options.url;
            this.#Type=selector.attr("selector-file");
            this.#input=selector;
            this.CreateTab();
            this.#input.parent().append($(`<div class="d-flex"></div>`).prepend(this.#input.prop("readonly",true))
                .append($(`<a select class="btn btn-secondary btn-border ml-3">Select ${this.#Type}</a>`)
                    .click(()=>{
                        this.#Tab.query.modal("show");
                        this.ShowTab(this.#Url);
                    })
                ))
        }
        CreateTab(){
            let upload;
            $("body").append(this.#Tab.query=$(`<div class="modal FileSelector fade" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header  navbar align-items-center">
                                <div class="nav-view">
                                    <h3 class="m-0">Navigation :</h3>
                                    <ul class="breadcrumbs">
                                        <li class="btn btn-outline-light">Files</li>
                                    </ul>
                                </div>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true" class="">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-light Upload"><span class="fa fa-upload fa-lg mr-1"></span>Upload</button>
                                <button type="button" class="btn btn-outline-primary Select" disabled>Select</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).append(upload=$(`<input type="file" name="file" style="display: none; " accept="${FileSelector.Types[this.#Type]}">`).change(()=>{
                let formdata=new FormData(),
                    file=upload.prop("files")[0]
                formdata.append("file",file);
                $.ajax(this.#CurrentUrl,{
                    method:"POST",
                    data:formdata,
                    cache: false,
                    contentType: false,
                    processData: false,
                    xhr:()=>{
                        let xhr=new XMLHttpRequest(),last=new Date(),lastLoaded=0;
                        xhr.upload.addEventListener("progress",function (evt) {
                            if(evt.lengthComputable) {
                                let per=((evt.loaded / evt.total)*100).toFixed(1)+"%",
                                    time=((evt.total-evt.loaded)/((evt.loaded-lastLoaded)/(new Date()-last))/1000);
                                time=time>60?(time/60).toFixed(0)+"Min":time.toFixed(0)+"S";
                                last=new Date();
                                lastLoaded=evt.loaded;
                                if(this.onload)this.onload(per,time);
                            }
                        },false);
                        return xhr;
                    }
                })
                    .then(data=>{
                    this.ShowTab(this.#CurrentUrl).then(()=> {
                        this.#Tab.body.find(".Name").each((i,elm)=>{
                            if(elm.innerText===data){
                                if(this.success)this.success(data);
                                $(elm).parent(".file-item").trigger("click");
                                return false;
                            }
                        });
                    })
                })
                    .catch(reason => {
                        try {if(this.fail)this.fail(reason);}catch (e) {console.error(e);}
                    })
            })));

            this.#Tab.body=this.#Tab.query.find(".modal-body")
            this.#Tab.Nav=this.#Tab.query.find(".breadcrumbs");
            this.#Tab.Select= this.#Tab.query.find(".modal-footer .Select").click(()=>{
                try {
                    if(this.selected) this.selected(this.#Checked);
                }catch (e) {
                    console.error(e);
                }
                this.#input.val(this.#Checked).trigger("change");
                this.#Tab.query.modal("hide");
            });
            this.#Tab.UploadNav= this.#Tab.query.find(".modal-footer .Upload").click(()=>{
                upload.trigger("click");
            });
        }
        ShowTab(Url){
            this.#CurrentUrl=Url;
            this.LoadNavBar(Url);
            return $.ajax(Url,{dataType:"json",method: "GET"})
                .then(data=>{
                    if(data.files.length>0)this.LoadBody(data.files);
                    else this.BodyError({statusText:"Folded is empty"})
                })
                .catch(reason => {console.error(reason);this.BodyError(reason)})
                .always(()=>{this.#Tab.body.removeClass("is-loading")});
        }
        LoadNavBar(Url){
            Url=Url.replace(/\\/g,"/");
            this.#Tab.Nav.empty();
            this.#Tab.body.empty().addClass("is-loading");
            let url=this.#Url;
            Url.replace(this.#Url,"").split("/").forEach((elm,i)=>{
                if(i>0){url+="/"+elm; this.#Tab.Nav.append(`<li class="separator"><i class="flaticon-right-arrow"></i></li>`);}
                let inUrl=url,nav;
                if(elm==="") nav=$(`<li class="btn btn-outline-light"><span class="fa fa-home"></span></li>`)
                else nav=$(`<li class="btn btn-outline-light">${elm}</span></li>`);
                this.#Tab.Nav.append(nav.click(()=>{
                    this.ShowTab(inUrl);
                }))
            })
        }
        BodyError(err){this.#Tab.body.append(`<h1 class="mx-auto">${err.statusText}</h1>`);}
        LoadBody(files){
            this.#Tab.body.empty();
            files.forEach(file=>{
                let elem;
                if(file.Type.type===this.#Type){
                    let preview;
                    switch (this.#Type) {
                        case "Image": preview=`<img src="${file.Url}">`
                            break
                        default : preview=`<i class="${file.Type.icon}"></i>`
                    }
                    elem = $(`<ul class="file-item"><input type="checkbox"><li class="icon">${preview}<li class="Name">${file.Name}</li></ul>`)
                        .click(() => {
                            if(elem.find("input").prop('checked')){
                                elem.find("input").prop('checked', false);
                                this.#Tab.Select.prop("disabled",true);
                            }else{
                                this.#Tab.body.find("input").prop("checked",false);
                                elem.find("input").prop('checked', true);
                                this.#Checked=file.Url;
                                this.#Tab.Select.prop("disabled",false);
                            }
                        })
                    this.#Tab.body.append(elem);
                }
                else if(file.Type.type==="folder"){
                    elem = $(`<ul class="file-item"><li class="icon"><i class="${file.Type.icon}"></i></li><li class="Name">${file.Name}</li></ul>`)
                        .dblclick(() => { this.ShowTab( file.Url); })
                    this.#Tab.body.append(elem);
                }
            });
        }

    }
    $.fn.FileSelector=function(options){return new FileSelector(this,options);}
})()