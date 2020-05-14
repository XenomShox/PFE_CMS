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
        constructor(Container,url,rootName) {
            this.#Url=url;
            this.#RootName=rootName;
            this.#Container=Container;
            this.#isList=false;
            this.#ContentView=this.#Container.find(".content-view");
            this.#Sort="Name";
            this.#SortD=1;
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
        async FetchData(path="",treeView){
            return $.ajax(this.#Url+path,{dataType: 'json',timeout: 2000,type: 'GET',data:{"treeView":treeView}})
                .catch(reason => {
                    $("#Error").on("show.bs.modal",(e)=>{console.log(e)}).modal({
                        keyboard: false
                    });
                    console.error(reason);

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
                NewFolder : $('#NewFolder').click(function () {
                    console.log($this.#CurrentPath);
                }),
                Upload : $('#Upload'),
                Refresh : $('#Refresh').click(()=>{ $this.OpenFolder($this.#CurrentPath);}),
                "Sort-by" : $('#Sort-by').next().find(".dropdown-item").click(function(){
                    $('#Sort-by span').html($this.#Sort=$(this).html());
                    $this.OpenFolder($this.#CurrentPath);
                }),
                "Sort-by-D" : $('#Sort-by i').click(function(){
                    $this.#SortD*=-1;
                    $(this).toggleClass("fa-sort-amount-up fa-sort-amount-down");
                    $this.OpenFolder($this.#CurrentPath);
                    return false;
                }),
                Cut : $('#Cut'),
                Copy : $('#Copy'),
                Remove : $('#Remove'),
                Download : $('#Download'),
                Rename : $('#Rename'),
                SelectList : $('#SelectList'),
                layout : $('#layout'),
                Info : $('#Info')
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
                        else if (data instanceof Array) this.#ContentView.append($(`<h3 class="m-auto">This folder is Empty</h3>`));
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
        OpenFolder(Path="Name") {
            return this.FetchData("",true).then(tree=>{
                this.#CurrentPath=Path;
                this.#Container.find("#TreeView").empty().append(this.CreateTreeView("",this.#RootName,tree));
                this.CreateView(Path);
            })
        }
        OpenFile(Path) {
            console.log(Path);
        }
    }
    $.fn.FilesManager=function(ApiUrl,rootName){return new FilesManager(this,ApiUrl,rootName);}
})();
$("#FilesManager").FilesManager("/Files","Files");