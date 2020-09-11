(()=> {
    let treeView=$("#TreeView"),
        templateData=JSON.parse($('[template-data]').attr("template-data"));
    class EditTemplate{
        editor;
        Code;
        Saved;
        modal;
        Opened;
        constructor() {
            treeView.addClass("is-loading")
            let promises=[];
            this.Saved=true;
            promises.push( this.getData("css") )
            promises.push( this.getData("javascript") )
            promises.push( this.getData("../views/templates") )
            Promise.all(promises).then(data=>{
                treeView.append(this.createFolder("css",data[0],`/css/${templateData.name}`,"css"))
                treeView.append(this.createFolder("javascript",data[1],`/javascript/${templateData.name}`,"javascript"))
                treeView.append(this.createFolder("views",data[2],`../views/templates/${templateData.name}`,"htmlembedded"))
                treeView.removeClass("is-loading");
            })
            this.Modal=$("#Modal");
            this.Code=$("#Code");
            $.getMultiScripts(["/Admin/files/javascripts/Assets/plugin/codemirror/javascript.js",
                "/Admin/files/javascripts/Assets/plugin/codemirror/htmlmixed.js",
                "/Admin/files/javascripts/Assets/plugin/codemirror/Ejs.js",
                "/Admin/files/javascripts/Assets/plugin/codemirror/multiplex.js",
                "/Admin/files/javascripts/Assets/plugin/codemirror/css.js",
                "/Admin/files/javascripts/Assets/plugin/codemirror/xml.js"])
                .done(()=>{console.log("scripts Loaded")})
                .fail(err=>{ console.error(err);})
            this.Opened=null;
            $("#Save").click(()=>{
                this.Save();
            });
        }
        SetEditor(type){
            if(this.editor) this.Code.find(".code").empty();
            this.editor= CodeMirror(this.Code.find(".code")[0],{
                value:"start",
                mode:type,
                theme:"material",
                lineNumbers: true
            })
            this.editor.on("change", ()=>{ this.Saved=false })
        }
        createFolder(name,data,url,type){
            let selector=$(`<li><span class="fa fa-folder"></span> ${name}</li>`),
                ul=$(`<ul class=" pl-2"></ul>`);
            selector.append(ul);
            Object.keys(data).forEach(key=>{
                if(data[key]) {
                    ul.prepend(this.createFolder(key,data[key],url+"/"+key,type));
                }
                else {
                    ul.append($(`<li class="file"><span class="fa fa-file"></span> ${key}</li>`)
                        .click(()=>{
                            this.openFile(url,key,type);
                        }))
                }
            })
            return selector;
        }
        async openFile(path,name,type){
            try{
                if(!this.Saved) await new Promise((resolve,reject) =>{
                    this.Modal.on("show.bs.modal", ()=>{
                        this.Modal.find(".btn-primary").click(()=>{
                            this.Modal.modal("hide");
                            resolve();
                        })
                        this.Modal.find(".btn-secondary").click(()=>{ reject(new Error("Not gonna open"))})
                    })
                    this.Modal.modal('show');
                })
                this.Saved=true;
                this.Code.addClass("is-loading");
                this.Code.find(".file").text(name);
                this.SetEditor(type);
                this.Opened=`${path}/${name}`
                $.ajax(`${window.location.pathname}?load=${this.Opened}`)
                    .then(file=>{
                        this.editor.setValue(file)
                        this.Code.removeClass("is-loading");
                    })
            }
            catch (e) { console.error(e) }
        }
        getData(ref){
            return $.ajax(`${window.location.pathname}?tree=${ref}`,{method:"GET", dataType:"json"})
                .catch(reason => {
                    console.error(reason);
                    return {};
                })
        }
        Save(){
            try{
                if(this.Opened) $.ajax(`${window.location.pathname}?update=${this.Opened}`,{method: "put",data:{data:this.editor.getValue()}})
                    .then(data=>{ $.notify({message: data,},{type: 'success',placement:{from:"bottom"}}) })
                else $.notify({message:"There is no file Opened"},{type: 'danger',placement:{from:"bottom"}});
            }catch (e) {
                $.notify({message: e.responseText},{type: 'danger',placement:{from:"bottom"}});
            }
        }
    }
    new EditTemplate();
})()
