console.clear();
(()=>{
    class FilesManager{
        #Container;
        #ContentView;
        #Url;
        #RootName;
        #CurrentPath;
        #Buttons;
        #isList;
        #Sort;
        #SortD;
        #Response;
        #SelectedList;
        #ajax;
        constructor(Container,url,rootName) {
            this.#Url=url;
            this.#RootName=rootName;
            this.#Container=Container;
            this.#isList=false;
            this.#ContentView=this.#Container.find(".content-view");
            this.#Sort="Name";
            this.#SortD=1;
            this.#SelectedList=[];
            this.#ajax=[];
            this.#Response={query:$("#Response"),title:$('#Response .modal-title'),icon:$('#Response .fa-exclamation-circle'),text:$('#Response .modal-body p')};
            this.OpenFolder("").then(()=>{
                this.ConfigureButtons();
            });
        }
        CreateTreeView(path,root,tree){
            let treeList=Object.keys(tree).sort(),Path=path+"",
                part=this.#CurrentPath.match(Path)!==null,
                appendList= [
                    $(`<li class="item ${Path===this.#CurrentPath?"active":""}"><i class="fas fa-folder"></i>${root}</li>`),
                    $(`<ul class="collapse ${part?"show":""}"></ul>`)
                ],$this=this,
                arrow=$(`<i class="fas fa-chevron-${part?"down":"right"} fa-xs ${treeList.length>0?"":"d-none"}" ></i>`);
            treeList.forEach(el=>{appendList[1].append(this.CreateTreeView(Path+"/"+el,el,tree[el]))});
            appendList[0].click(function(){
                    if($this.#CurrentPath!==Path) $this.OpenFolder(Path);
                })
                .prepend(arrow.click(function(){
                appendList[1].collapse("toggle");
                if(arrow.hasClass("fa-chevron-right")) arrow.removeClass("fa-chevron-right").addClass("fa-chevron-down");
                else  arrow.removeClass("fa-chevron-down").addClass("fa-chevron-right");
                return false;
            }));
            return appendList;
        }
        Respond(title,text,Error){
            this.#Response.title.html(title);
            this.#Response.text.html(text);
            if(Error) this.#Response.icon.addClass("fa-exclamation-circle text-danger").removeClass("fa-check-circle text-success");
            else this.#Response.icon.addClass("fa-check-circle text-success").removeClass("fa-exclamation-circle text-danger");
            this.#Response.query.modal('show');
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
        ConfigureButtons() {
            let $this=this;
            this.#Buttons={
                NewFolder : $('#NewFolder.nav-link').click(function () {
                    let NewFolder=$('#NewFolder.modal');
                    NewFolder.on("show.bs.modal",function(){
                        let formGroup=NewFolder.find(".modal-body .form-group").removeClass("has-error"),
                            input=formGroup.find("input").val("New Folder");
                        formGroup.find("input").nextAll().remove();
                        NewFolder.find(".modal-body p").html('Path : ' +$this.#CurrentPath);
                        NewFolder.find(".modal-body button").unbind().click(function (e) {
                            let FolderName=input.val();
                            if(FolderName.match(/^[^%]+$/)){
                                NewFolder.modal('hide');
                                $.ajax($this.#Url+$this.#CurrentPath,{timeout: 2000,type: 'POST',data:{NewFolder:FolderName}})
                                .then((data)=>{
                                    $this.Respond("New Folder",data);
                                    $this.OpenFolder();
                                })
                                .catch(reason => {
                                    $this.Respond("Error in the server",reason.responseText,true);
                                });
                            }
                            else{
                                formGroup.addClass("has-error");
                                if(formGroup.has("small").length===0)formGroup.append($("<small class=\"form-text text-muted\">Please don't use % in the folder Name.</small>"));
                            }
                        })
                    }).modal('show');
                }),
                UploadInput: $(`#Upload input`).change(function (e) {
                        let val=$(this).prop('files');
                        if(val){
                            for (let i=0; i<val.length ;i++){
                                let file=val[i],index=-1;
                                $('.UploadList .card-body').append($(`<div class="Upload-file">
                                    <h4>${file.name}</h4>
                                </div>`).prepend($(`<div class="check"><i class="fa fa-upload mx-3 my-auto"></i><h4 class="mx-3 my-auto percentage">0%</h4><h4 class="mx-3 my-auto minute">0m</h4></div>`).click(function () {
                                    let el=$(this).unbind().addClass("isProgressing"),
                                    data=new FormData();
                                    data.append("file",file);
                                    function fetchthis() {
                                        let start=new Date();
                                        index=$this.#ajax.push($.ajax({
                                            type:"POST",
                                            url:$this.#Url+$this.#CurrentPath,
                                            data:data,
                                            cache: false,
                                            contentType: false,
                                            processData: false,
                                            xhr:function () {
                                                var xhr=new XMLHttpRequest(),last=new Date(),lastLoaded=0;
                                                xhr.upload.addEventListener("progress",function (evt) {
                                                    if(evt.lengthComputable) {
                                                        let per=((evt.loaded / evt.total)*100).toFixed(1)+"%",
                                                        speed=((evt.total-evt.loaded)/((evt.loaded-lastLoaded)/(new Date()-last))/1000);
                                                        speed=speed>60?(speed/60).toFixed(0)+"Min":speed.toFixed(0)+"S";
                                                        last=new Date();
                                                        lastLoaded=evt.loaded;
                                                        el.css("width",per).find(".percentage").html(per).next().html(speed);
                                                    }
                                                },false);
                                                return xhr;
                                            }
                                        }))-1;
                                        $this.#ajax[index].then(data=>{
                                            $this.OpenFolder();
                                            el.removeClass("isProgressing").addClass("done").css("width","100%").delay(2000).css("width","")
                                                .find("i").removeClass("fa-upload").addClass("fa-check");
                                            el.find(".minute").html(((new Date()-start)/1000).toFixed(0)+"s");
                                        })
                                            .catch(reason => {
                                                el.removeClass("isProgressing").addClass("error").unbind().click(()=> {fetchthis();})
                                                    .css("width","").find("i").removeClass("fa fa-upload").addClass("fas fa-exclamation")
                                            });
                                    }
                                    fetchthis();
                                })).append($(`<button class="btn btn-icon btn-border ml-auto my-auto"><i class="fa fa-times"></i></button>`).click(function () {
                                    if(index!==-1)$this.#ajax[index].abort();
                                    $(this).parent().remove();
                                })));
                            }
                        }
                        else{
                            console.log("no file has been selected");
                        }
                    }).click(function (e) {
                        e.stopPropagation();
                    }),
                Upload : $('#Upload').click( ()=>{ $(`#Upload input`).trigger("click");}),
                Refresh : $('#Refresh').click(()=>{ $this.OpenFolder();}),
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
                Cut : $('#Cut'),
                Copy : $('#Copy'),
                Remove : $('#Remove'),
                Download : $('#Download'),
                Rename : $('#Rename'),
                SelectList : $('#SelectList'),
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
                Info : $('#Info').click(()=>{
                   if($this.#SelectedList.length>0);//selected files info
                   else ;//Folder info
                })
            }
        }
        CreateView(Path) {
            this.#CurrentPath=Path;
            this.#ContentView.empty().addClass("is-loading");
            this.CreateNavBar();
            let $this=this;
            if(this.#isList);
            else{
                this.FetchData(Path,false)
                    .then(data=>{
                        if(data instanceof Array && data.length>0)
                            data.sort(function (a,b) {
                                if((a.type.type==="folder" && b.type.type==="folder")||(a.type.type!=="folder" && b.type.type!=="folder")){
                                    if($this.#Sort==="Name") {
                                        if (a.name > b.name) return 1*$this.#SortD;
                                        else return -1*$this.#SortD;
                                    }
                                    else if($this.#Sort==="Size"){
                                        if(a.size > b.size) return 1*$this.#SortD;
                                        else if(a.size < b.size) return -1*$this.#SortD;
                                        else{
                                            if (a.name > b.name) return 1*$this.#SortD;
                                            else return -1*$this.#SortD;
                                        }
                                    }
                                    else if($this.#Sort==="Modified"){
                                        if(new Date(a.mtime) >= new Date(b.mtime)) return -1*$this.#SortD;
                                        else return 1*$this.#SortD;
                                    }
                                }
                                else if(a.type.type==="folder") return -1;
                                else return 1;
                            })
                            .forEach(el=>{
                                this.#ContentView.append($(`
                                    <ul class="file-item">
                                        <input type="checkbox">
                                        <li class="icon"><i class="${el.type.icon}"></i></li>
                                        <li class="Name">${el.name}</li>
                                    </ul>
                                `).dblclick(function () {
                                    if(el.type.type==="folder") $this.OpenFolder(Path+"/"+el.name);
                                    else $this.OpenFile(Path+"/"+el.name);
                                }))
                            });
                        else if (data instanceof Array) this.#ContentView.append($(`<h3 class="m-auto">This folder is Empty.</h3>`));
                        else this.#ContentView.append($(`<h3 class="m-auto">This folder doesn't Exist<./h3>`));
                    })
                    .then(()=> this.#ContentView.removeClass("is-loading"))
            }
        }
        CreateNavBar() {
            let view=$('#view .breadcrumbs').empty(),path="";
            this.#CurrentPath.split("/").forEach((el,i,arr)=>{
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
        OpenFolder(Path=this.#CurrentPath) {
            return this.FetchData("",true).then(tree=>{
                this.#CurrentPath=Path;
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