console.clear();
(()=>{
    var cntrlIsPressed = false;
    $(document).keydown(function(event){
        if(event.which=="17")
            cntrlIsPressed = true;
    });

    $(document).keyup(function(){
        cntrlIsPressed = false;
    });

    class FilesManager{
        #Container;
        #ContentView;
        #Url;
        #RootName;
        #Folder;
        #Buttons;
        #isList;
        #Sort;
        #SortD;
        #Modals;
        #SelectedList;
        #CopyMode;
        #ajax;
        #UploadList;
        constructor(Container,url,rootName) {
            this.#Url=url;
            this.#RootName=rootName;
            this.#Container=Container;
            this.#isList=false;
            this.#ContentView=this.#Container.find(".content-view");
            this.#Sort="Name";
            this.#SortD=1;
            this.#SelectedList=[];
            this.#ajax={ajax:[],abort:[]};
            this.#UploadList={query:$(".UploadList "),body:$(".UploadList .card-body"),toggle:$(".UploadList .card-header h2 i"),quit:$(".UploadList .card-header button"),span:$(".UploadList .card-header span")}
            this.#Modals={
                Response:{query:$("#Response"),title:$('#Response .modal-title'),icon:$('#Response .fa-exclamation-circle'),text:$('#Response .modal-body p')},
                Confirmation:{query:$("#Confirmation"),title:$('#Confirmation .modal-title'),text:$('#Confirmation .modal-body p'),confirm:$('#Confirmation .modal-body a'),cancel:$("#Confirmation .close")},
                NewFolder:{query:$('#NewFolder.modal'),FormGroup:$("#NewFolder.modal .modal-body .form-group"),input:$("#NewFolder.modal input"),label:$("#NewFolder.modal lable"),p:$("#NewFolder.modal .modal-body p"),button:$("#NewFolder.modal .modal-body button"),cancel: $("#NewFolder.modal .close"),title:$("#NewFolder.modal .modal-title")}
            };
            this.#Folder={CurrentPath:""};
            this.#CopyMode={Mode:"",List:[]};
            this.OpenFolder().then(()=>{
                this.ConfigureButtons();
            });
        }
        CreateTreeView(path,root,tree){
            let treeList=Object.keys(tree).sort(),Path=path+"",
                part=this.#Folder.CurrentPath.match(Path)!==null,
                appendList= [
                    $(`<li class="item ${Path===this.#Folder.CurrentPath?"active":""}"><i class="fas fa-folder"></i>${root}</li>`),
                    $(`<ul class="collapse ${part?"show":""}"></ul>`)
                ],$this=this,
                arrow=$(`<i class="fas fa-chevron-${part?"down":"right"} fa-xs ${treeList.length>0?"":"d-none"}" ></i>`);
            treeList.forEach(el=>{appendList[1].append(this.CreateTreeView(Path+"/"+el,el,tree[el]))});
            appendList[0].click(function(){
                    if($this.#Folder.CurrentPath!==Path) $this.OpenFolder(Path);
                })
                .prepend(arrow.click(function(){
                appendList[1].collapse("toggle");
                if(arrow.hasClass("fa-chevron-right")) arrow.removeClass("fa-chevron-right").addClass("fa-chevron-down");
                else  arrow.removeClass("fa-chevron-down").addClass("fa-chevron-right");
                return false;
            }));
            return appendList;
        }
        InputModal(title,text,label,value,Create=true){
            return new Promise((resolve, reject) => {
                this.#Modals.NewFolder.FormGroup.removeClass("has-error");
                this.#Modals.NewFolder.input.val(value);
                this.#Modals.NewFolder.input.nextAll().remove();
                this.#Modals.NewFolder.p.html(text);
                this.#Modals.NewFolder.title.html(title);
                this.#Modals.NewFolder.label.html(label);
                this.#Modals.NewFolder.cancel.unbind().click(()=>{reject();})
                let $this=this;
                this.#Modals.NewFolder.button.unbind().click(function (e) {
                    let FolderName=$this.#Modals.NewFolder.input.val();
                    if(FolderName.match(/^[^%]+$/)){
                        $this.#Modals.NewFolder.query.modal('hide');
                        resolve(FolderName);
                    }
                    else{
                        $this.#Modals.NewFolder.FormGroup.addClass("has-error");
                        if($this.#Modals.NewFolder.FormGroup.has("small").length===0)$this.#Modals.NewFolder.FormGroup.append($("<small class=\"form-text text-muted\">Please don't use % in the folder Name.</small>"));
                    }
                }).html(Create?"Create":"Modify");
                this.#Modals.NewFolder.query.modal('show');
            })
        }
        Respond(title,text,Error){
            this.#Modals.Response.title.html(title);
            this.#Modals.Response.text.html(text);
            if(Error) this.#Modals.Response.icon.addClass("fa-exclamation-circle text-danger").removeClass("fa-check-circle text-success");
            else this.#Modals.Response.icon.addClass("fa-check-circle text-success").removeClass("fa-exclamation-circle text-danger");
            this.#Modals.Response.query.modal('show');
        }
        async FetchData(path="",treeView){
            return $.ajax(this.#Url+path,{dataType: 'json',timeout: 2000,type: 'GET',data:{"treeView":treeView}})
                .catch(reason => {
                    this.Respond("Error in the server",reason.responseText,true);
                    return null;
                });
        }
        CreateList(Container,path){
            Container.empty();
            let table=$(`<table class="table table-hover"></table>`),
            dataTable=table.dataTable({
                data:data
            })
            Container.append()
        }
        UploadNumber(){
            let children =this.#UploadList.body.children().length;
            if(children===0) this.#UploadList.span.html("done");
            else this.#UploadList.span.html(children+" file"+(children===1?"":"s"));
        }
        ConfigureButtons() {
            let $this=this,body=false,
            UploadInput= $(`#Upload input`).unbind().click(function (e) {e.stopPropagation();})
                .change(function () {
                    let val=$(this).prop('files');
                    if(val){
                        $this.#UploadList.query.slideDown(500,()=>{
                            $this.#UploadList.body.slideDown(500);
                            $this.#UploadList.toggle.addClass("fa-chevron-down").removeClass("fa-chevron-up");
                        });
                        for (let i=0; i<val.length ;i++){
                            let file=val[i],index=-1,CurrentPath=$this.#Folder.CurrentPath;
                            $this.#UploadList.body.append($(`<div class="Upload-file">
                                        <h4>${file.name}</h4>
                                    </div>`)
                                .prepend($(`<div class="check"><i class="fa fa-upload mx-3 my-auto"></i><h4 class="mx-3 my-auto percentage">0%</h4><h4 class="mx-3 my-auto minute">0m</h4></div>`)
                                    .click(function () {
                                    let el=$(this).unbind().addClass("isProgressing"),
                                        data=new FormData();
                                    data.append("file",file);
                                    function fetchthis() {
                                        let start=new Date();
                                        index=$this.#ajax.ajax.push($.ajax({
                                            type:"POST",
                                            url:$this.#Url+CurrentPath,
                                            data:data,
                                            cache: false,
                                            contentType: false,
                                            processData: false,
                                            xhr:function () {
                                                var xhr=new XMLHttpRequest(),last=new Date(),lastLoaded=0;
                                                xhr.upload.addEventListener("progress",function (evt) {
                                                    if(evt.lengthComputable) {
                                                        let per=((evt.loaded / evt.total)*100).toFixed(1)+"%",
                                                            time=((evt.total-evt.loaded)/((evt.loaded-lastLoaded)/(new Date()-last))/1000);
                                                        time=time>60?(time/60).toFixed(0)+"Min":time.toFixed(0)+"S";
                                                        last=new Date();
                                                        lastLoaded=evt.loaded;
                                                        el.css("width",per).find(".percentage").html(per).next().html(time);
                                                    }
                                                },false);
                                                return xhr;
                                            }
                                        }))-1;
                                        $this.#ajax.ajax[index]
                                            .then(data=>{
                                                $this.OpenFolder();
                                                el.removeClass("isProgressing").addClass("done").css("width","100%").delay(2000).css("width","")
                                                    .find("i").removeClass("fa-upload").addClass("fa-check");
                                                el.find(".minute").html(((new Date()-start)/1000).toFixed(0)+"s");
                                            })
                                            .catch(reason => {
                                                el.removeClass("isProgressing").addClass("error").unbind().click(()=> {fetchthis();})
                                                    .css("width","").find("i").removeClass("fa fa-upload").addClass("fas fa-exclamation")
                                            })
                                            .always(()=>{
                                                $this.#ajax.abort.push(index);
                                                if($this.#ajax.abort.length===$this.#ajax.ajax.length) {
                                                    $this.#ajax={ajax:[],abort:[]};
                                                }
                                                index=-1;
                                                $this.UploadNumber();
                                            });
                                    }
                                    fetchthis();
                            }))
                                .append($(`<button class="btn btn-icon btn-border ml-auto my-auto"><i class="fa fa-times"></i></button>`).click(function () {
                                if(index!==-1)$this.#ajax.ajax[index].abort();
                                $(this).parent().remove();
                                $this.UploadNumber();
                            })
                                )
                            );
                        }
                    }
                    else{
                        console.log("no file has been selected");
                    }
                    UploadInput.val("");
                    $this.UploadNumber();
                });
            this.#UploadList.quit.click(function () {
                $this.#ajax.ajax.forEach(el=>{
                    el.abort();
                });
                $this.#UploadList.body.empty();
                $this.#UploadList.query.slideUp();
            });
            this.#UploadList.toggle.click(function () {
                $this.#UploadList.body.slideToggle(function () {
                    if($this.#UploadList.body.css("display")==="none") $this.#UploadList.toggle.addClass("fa-chevron-up").removeClass("fa-chevron-down");
                    else  $this.#UploadList.toggle.addClass("fa-chevron-down").removeClass("fa-chevron-up");
                })
            });
            this.#Buttons={
                NewFolder : $('.NewFolder.nav-link').click(function () {$this.NewFolder();}),
                Upload : $('#Upload').each((i,e)=>{
                    $(e).click( ()=>{ UploadInput.trigger("click");});
                }),
                Refresh : $('.Refresh').click(()=>{ $this.OpenFolder();}),
                "Sort-by" : $('#Sort-by').next().find(".dropdown-item").click(function(){
                    $('#Sort-by span').html($this.#Sort=$(this).html());
                    $this.OpenFolder();
                }),
                "Sort-by-D" : $('#Sort-by i').click(function(){
                    $this.#SortD*=-1;
                    $(this).toggleClass("fa-sort-amount-up fa-sort-amount-down");
                    $this.OpenFolder();
                    return false;
                }),
                Cut : $('.Cut').click(()=>{
                    this.#Container.addClass("Copy");
                    this.#CopyMode={Mode:"Cut",List:this.#SelectedList};
                    this.OpenFolder();
                }),
                Paste: $('.Paste').click(()=>{
                    if(this.#CopyMode.Mode) this.Paste();
                    else this.#Container.removeClass("Copy");
                }),
                PasteClose: $('.PasteClose').click(()=>{
                    this.PasteClose();
                }),
                Copy : $('.Copy').click( ()=>{
                    this.#Container.addClass("Copy");
                    this.#CopyMode={Mode:"Copy",List:this.#SelectedList};
                    this.OpenFolder();
                }),
                Remove : $('.Remove').click(()=>{$this.Remove();}),
                Rename : $('.Rename').click(()=>{$this.Rename();}),
                SelectList : $('#SelectList').click(function () {
                    $this.#SelectedList=[];
                    $this.#ContentView.find(".selected").removeClass("selected").find("input").each((i,e)=>{e.checked=false;});
                    $this.UpdateSelected();
                }),
                layout : $('#layout').next().find(".dropdown-item").click(function(){
                    let layout=$(this).clone().children().remove().end().text();
                    if(layout==="List"){
                        $this.#ContentView.removeClass("Large").addClass("List");
                        $('#layout').find("i").removeClass("fa-th-large fa-th").addClass('fa-th-list').parent().next().find('.active').removeClass('active');
                        $this.#isList=true;
                        $this.OpenFolder();
                    }else{
                        if(layout==="Medium icons") {
                            $this.#ContentView.removeClass("Large List");
                            $('#layout').find("i").removeClass("fa-th-list fa-th-large").addClass('fa-th').parent().next().find('.active').removeClass('active');
                        }
                        else {
                            $this.#ContentView.removeClass("List").addClass("Large");
                            $('#layout').find("i").removeClass("fa-th-list fa-th").addClass('fa-th-large').parent().next().find('.active').removeClass('active');
                        }
                        if($this.#isList===true){$this.#isList=false;$this.OpenFolder();}
                    }

                    $(this).addClass("active");

                }),
                Info : $('.Info').click(()=>{$this.Info();}),
                Download : $('.Download').click(function(){
                    this.href=document.location.origin+"/Files"+$this.#SelectedList[0].Url;
                    return true;
                })
            }
            $(document).click(()=>{$('.Context-Menu').removeClass("show").hide();});
            this.#ContentView.contextmenu(function (e) {
                $this.#ContentView.find(".selected").removeClass("selected").find("input").each((i,e)=>{e.checked=false;})
                $this.#SelectedList=[];
                $this.UpdateSelected();
                $('.Context-Menu').css({
                    display:"block",
                    top: ((e.pageY-10)+$(".Context-Menu").height())>window.innerHeight?window.innerHeight-$(".Context-Menu").height()-60:(e.pageY-10),
                    left: e.pageX -90
                }).addClass("show");
                return false;
            })
        }
        NewFolder(){
            this.InputModal("Creating New Folder",'Path : Files' +this.#Folder.CurrentPath,'New Folder Name :',"New Folder")
                .then(FolderName=>{
                    return $.ajax(this.#Url+this.#Folder.CurrentPath,{timeout: 2000,type: 'POST',data:{NewFolder:FolderName}})
                        .then((data)=>{this.Respond("Creating New Folder Succeeded",data);});
                })
                .catch(reason => {if(reason)this.Respond("Creating New Folder Failed",reason.responseText,true);})
                .finally(()=>{ this.OpenFolder();});
        }
        PasteClose(){this.#CopyMode={};this.#Container.removeClass("Copy");this.OpenFolder();}
        Paste(){
            console.log(this.#CopyMode);
            let Files="";
            this.#CopyMode.List.forEach((el,i,arr)=>{Files+=(el.Name+(i+1===arr.length?"":", "));});
            this.Confirm("Pasting Files","Pasting these Files : "+Files+"<br> In this Path : "+this.#Folder.CurrentPath)
                .then(()=>{
                    return $.ajax(this.#Url+this.#Folder.CurrentPath,{type:"PUT",data:{Mode:this.#CopyMode.Mode,Files:this.#CopyMode.List}})
                        .then((data)=>{this.Respond((this.#CopyMode.Mode==="Copy"?"Copying":"Cutting")+" Files Succeeded",data);})
                })
                .catch(reason => {if(reason)this.Respond((this.#CopyMode.Mode==="Copy"?"Copying":"Cutting")+" Files Failed",reason,true);})
                .finally(()=>{this.PasteClose()})
        }
        async Rename(){
            let file=this.#SelectedList[0];
            this.InputModal("Renaming Files",'File : ' +file.Name,'Rename File :',file.Name,false)
                .then(NewName=>{
                    return $.ajax(this.#Url+this.#Folder.CurrentPath,{timeout: 2000,type: 'PUT',data:{Name:file.Name,NewName:NewName}})
                        .then((data)=>{return this.Respond("Renaming file Succeeded",data);});
                })
                .catch(reason => {if(reason)this.Respond("Renaming file Failed",reason.responseText,true);})
                .finally(()=>{this.OpenFolder();});
        }
        Confirm(title,text){
            let $this=this;
            return new Promise((resolve, reject) => {
                $this.#Modals.Confirmation.title.html(title);
                $this.#Modals.Confirmation.text.html(text);
                $this.#Modals.Confirmation.query.modal({backdrop:'static'});
                $this.#Modals.Confirmation.confirm.click(function () {
                    $this.#Modals.Confirmation.query.modal('hide');
                    resolve();
                });
                $this.#Modals.Confirmation.cancel.click(function () {
                    reject();
                })
            });
        }
        Remove(){
            let Names="";
            this.#SelectedList.forEach((el,i,arr)=>{Names+=(el.Name+(i+1===arr.length?"":", "));});
            this.Confirm("Removing ","Files: "+Names)
                .then(()=>{
                    return $.ajax(this.#Url+this.#Folder.CurrentPath,{type:"DELETE",data:{Paths:this.#SelectedList}})
                        .then(()=>{
                            this.Respond("Removing Files Succeeded","Files Removed");
                        });
                })
                .catch(reason=>{
                    if(reason) this.Respond("Removing Files Failed","Error while removing these files: "+Names,true);
                })
                .finally(()=>{this.OpenFolder();});
        }
        CreateInfo(table,data){
            table.append(`<tr><td>Name</td><td>:</td><td>${data["Name"]}</td></tr>`)
                .append($(`<tr><td>Path</td><td>:</td></tr>`).append($(`<td><input type="txt" disabled value="${document.location.origin+this.#Url+data["Url"]}"></td>`).click(function (){
                        let  copyText = this.querySelector("input");
                        copyText.select();
                        console.log(document.execCommand("copy"));

                })))
                .append(`
                    <tr><td>Type</td><td>:</td><td>${data["Type"].type}</td></tr>
                    <tr><td>Size</td><td>:</td><td>
                        ${data["Size"]<(1044480)?
                        ((data["Size"]/1024).toFixed(2)+"KB")
                        :((data["Size"]/1044480).toFixed(2)+"MB")}
                    </td></tr>
                    ${data["Created"]?`<tr><td>Created</td><td>:</td><td>${new Date(data["Created"])}</td></tr>`:''}
                    ${data["Modified"]?`<tr><td>Modified</td><td>:</td><td>${new Date(data["Modified"])}</td></tr>`:''}
                `);
        }
        Info(){
            let InfoModal=$("#InfoModal"),$this=this;
            InfoModal.on("show.bs.modal",function () {
                let data;
                if($this.#SelectedList.length>0){
                    if($this.#SelectedList.length===1) data=$this.#SelectedList[0];
                    else{
                        data={
                            Url:$this.#Folder.CurrentPath,
                            Name: "",
                            Type: {type:"Files"},
                            Size: 0,
                            Modified:undefined,
                            Created:undefined
                        };
                        $this.#SelectedList.forEach((el,i,arr)=>{
                            data.Name+=el.Name+(arr.length-1===i?"":", ");
                            data.Size+=el.Size;
                        });
                    }
                }
                else data=$this.#Folder.data.folder;
                $this.CreateInfo(InfoModal.find("table").empty(),data);
            })
                .modal();
        }
        UpdateSelected() {
            if (this.#SelectedList.length === 0) this.#Container.removeClass("selected");
            else {
                if(this.#SelectedList.length === 1){
                    this.#Container.removeClass("multi");
                    if(this.#SelectedList[0].Type.type==="folder")this.#Container.addClass("Folder");
                    else this.#Container.removeClass("Folder");
                }
                else this.#Container.addClass("multi");
                this.#Container.addClass("selected");
                this.#Buttons.SelectList.find("span").html(this.#SelectedList.length+" ");
            }
        }
        CreateView(Path) {
            this.#Folder.CurrentPath=Path;
            this.#ContentView.empty().addClass("is-loading");
            this.CreateNavBar();
            let $this=this;
            if(this.#isList) this.CreateList();
            else{
                this.FetchData(Path,false)
                    .then(data=>{
                        this.#Folder.data=data;
                        if(data && data.files instanceof Array && data.files.length>0){
                            this.UpdateSelected()
                            data.files.sort(function (a,b) {
                                if((a.Type.type==="folder" && b.Type.type==="folder")||(a.Type.type!=="folder" && b.Type.type!=="folder")){
                                    if($this.#Sort==="Name") {
                                        if (a.Name > b.Name) return 1*$this.#SortD;
                                        else return -1*$this.#SortD;
                                    }
                                    else if($this.#Sort==="Size"){
                                        if(a.Size > b.Size) return 1*$this.#SortD;
                                        else if(a.Size < b.Size) return -1*$this.#SortD;
                                        else{
                                            if (a.Name > b.Name) return 1*$this.#SortD;
                                            else return -1*$this.#SortD;
                                        }
                                    }
                                    else if($this.#Sort==="Modified"){
                                        if(new Date(a.Modified) >= new Date(b.Modified)) return -1*$this.#SortD;
                                        else return 1*$this.#SortD;
                                    }
                                }
                                else if(a.Type.type==="folder") return -1;
                                else return 1;
                            })
                                .forEach(el=>{
                                    let fileItem=$(`<ul class="file-item"><li class="icon"><i class="${el.Type.icon}"></i></li><li class="Name">${el.Name}</li></ul>`)
                                        .prepend($('<input type="checkbox">')
                                            .on("click dblclick",function (e) {e.stopPropagation();})
                                            .change(function () {
                                                if(this.checked) {
                                                    fileItem.addClass("selected");
                                                    $this.#SelectedList.push(el);
                                                }
                                                else{
                                                    fileItem.removeClass("selected");
                                                    $this.#SelectedList.splice($this.#SelectedList.indexOf(el),1);
                                                }
                                                $this.UpdateSelected();
                                            })
                                        );
                                    this.#ContentView.append(fileItem
                                        .dblclick(function () {
                                            if(el.Type.type==="folder") $this.OpenFolder(Path+"/"+el.Name);
                                            else $this.OpenFile(Path+"/"+el.Name);
                                        })
                                        .click(function () {
                                            if(!cntrlIsPressed){
                                                $this.#ContentView.find(".selected").removeClass("selected").find("input").each((i,e)=>{e.checked=false;})
                                                fileItem.addClass("selected").find("input").get(0).checked=true
                                                $this.#SelectedList=[el];
                                            }
                                            else {
                                                let check=fileItem.addClass("selected").find("input").get(0);
                                                if(!check.checked) {
                                                    fileItem.addClass("selected");
                                                    $this.#SelectedList.push(el);
                                                    check.checked=true
                                                }
                                                else{
                                                    fileItem.removeClass("selected");
                                                    $this.#SelectedList.splice($this.#SelectedList.indexOf(el),1);
                                                    check.checked=false;
                                                }
                                            }
                                            $this.UpdateSelected();
                                        })
                                        .contextmenu(function (e) {
                                            if($this.#SelectedList.indexOf(el)===-1){
                                                $this.#ContentView.find(".selected").removeClass("selected").find("input").each((i,e)=>{e.checked=false;})
                                                fileItem.addClass("selected").find("input").get(0).checked=true
                                                $this.#SelectedList=[el];
                                            }
                                            $this.UpdateSelected();
                                            $('.Context-Menu').css({
                                                display:"block",
                                                top: ((e.pageY-10)+$(".Context-Menu").height())>window.innerHeight?window.innerHeight-$(".Context-Menu").height()-60:(e.pageY-10),
                                                left: e.pageX -90
                                            }).addClass("show");
                                            return false;
                                        })
                                    );
                                });
                        }
                        else if (data && data.files instanceof Array) this.#ContentView.append($(`<h3 class="m-auto">This folder is Empty.</h3>`));
                        else this.#ContentView.append($(`<h3 class="m-auto">This folder doesn't Exist<./h3>`));
                    })
                    .then(()=> this.#ContentView.removeClass("is-loading"))
            }
        }
        CreateNavBar() {
            let view=$('#view .breadcrumbs').empty(),path="";
            this.#Folder.CurrentPath.split("/").forEach((el,i,arr)=>{
                if(i!==0)path+="/"+el;
                let iPath=path;
                let click=$(`<li class="nav-item btn">${el===""?'<i class="fas fa-home"></i>Files':el}</li>`);
                view.append(click);
                if(i+1!==arr.length)view.append('<li class="separator"><i class="flaticon-right-arrow"></i></li>');
                click.click(()=>{
                    this.OpenFolder(iPath);
                });
            });
        }
        OpenFolder(Path=this.#Folder.CurrentPath) {
            this.#SelectedList=[];
            this.#Container.removeClass("selected");
            return this.FetchData("",true).then(tree=>{
                this.#Folder.CurrentPath=Path;
                this.#Container.find("#TreeView").empty().append(this.CreateTreeView("",this.#RootName,tree));
                this.CreateView(Path);
            });
        }
        OpenFile(Path) {
            console.log(Path);
        }
    }
    $.fn.FilesManager=function(ApiUrl,rootName){return new FilesManager(this,ApiUrl,rootName);}
})();
$("#FilesManager").FilesManager("/Files","Files");