(()=>{
    class DataDocument{
        static Container;
        Inner;
        Body;
        SaveButton;
        constructor(Name,Schema) {
            this.Body={Query:$(`<div class="card-body px-5"></div>`),};
            let $this=this;
            this.SaveButton=$(`<button class="ml-auto mr-2 btn btn-success btn-border">Save Data</button>`);
            this.QuiteButton=$(`<button class="ml-auto mr-2 btn btn-border btn-danger btn-icon"><i class="fa fa-window-close"></i></button>`);
            this.Inner=$(`<div class="document col-9 col-md-7 mx-auto"></div>`)
                    .append($(`<div class="card"></div>`)
                        .append($(`<div class="card-header row"><h3 class="ml-2 card-title">${Name}</h3></div>`)
                        .append(this.QuiteButton))
                    .append(this.Body.Query)
                    .append($(`<div class="card-footer row"></div>`)
                        .append(this.SaveButton)));
            DataDocument.Container.append(this.Inner);
            this.Inner.hide();
            this.CreateBody(Schema);
            this.QuiteButton.click(function () {
                $this.Inner.fadeOut(2000,()=>{
                    DataDocument.Container.hide("Hidden");
                });
            });
        }
        saveElement(data,type=undefined){
            if(typeof data==="object" && data!==null){
                let Data={};
                if(type!==undefined) Data=[];
                data.forEach(el=>{
                    Data[el.Key]=this.saveElement(el.Value,el.type);
                });
                return Data;
            }
            else return data;
        }
        Save(){
            return this.saveElement(this.Body.data);
        }
        DateInput(val){
            let date=new Date(val),
                month=("0" + (date.getMonth() + 1)).slice(-2),
                day= ("0" + date.getDate()).slice(-2);
                return `${date.getFullYear()}-${month}-${day}`;
        }
        FillInputs(inputs,data){
            if(inputs.InputQuery!==undefined){
                inputs.InputQuery.val(data[inputs.Key]===undefined?null:inputs.InputQuery.attr('type')!=="date"?data[inputs.Key]:this.DateInput(data[inputs.Key])).trigger("change");
            }
            else if(inputs.type!==undefined){
                inputs.Value=[];
                inputs.SubQuery.children().not(":first-child").remove();
                if(data[inputs.Key])
                data[inputs.Key].forEach((el,i)=>{
                    let x=this.CreateInput(inputs.SubQuery,inputs.Value.length,inputs.type),
                        DeleteButoon=$(`<button class="btn btn-icon btn-round btn-border btn-danger mr-2 ml-auto"><i class="fa fa-trash"></i></button>`),$this=this;
                    x.InputQuery.val(el).trigger("change");
                    x.InputQuery.parent().addClass("row");
                    x.InputQuery.addClass("col-10").after(DeleteButoon);
                    inputs.Value.push(x);
                    DeleteButoon.click(function () {
                        inputs.Value.splice(inputs.Value.indexOf(x),1);
                        data[inputs.Key].splice(i,1);
                        $this.FillInputs(inputs,data);
                    });
                });
            }
            else inputs.Value.forEach(l=>{
                this.FillInputs(l,data[inputs.Key]===undefined?{}:data[inputs.Key]);
            });
        }
        FillBody(data){
            this.Body["_id"]=data["_id"];
            this.Body.data.forEach(el=>{
                this.FillInputs(el,data);
            });
        }
        CreateBody(Schema){
            this.Body.data=[];
            for(let key in Schema){
                if(Schema.hasOwnProperty(key)){
                    this.Body.data.push(this.CreateInput(this.Body.Query,key,Schema[key]))
                }
            }
        }
        CreateInput(Query, key, schemaElement){
            let Input={
                Key:key,
                Value:null,
                SubQuery:$(`<div class="form-group form-group-default"></div>`)
            },label=$(`<label class="mb-2 d-flex col-12" for="${key}">${key}</label>`);
            Input.SubQuery.append(label);
            if(schemaElement.type!==undefined){
                Input.InputQuery=$(this.Input(schemaElement.type,key));
                Input.InputQuery.change(function () {
                    Input.Value=Input.InputQuery.val();
                });
            }
            else if(schemaElement instanceof Array){
                Input.Value=[];
                Input.type={type:schemaElement[0].type};
                let button=$(`<div class="btn btn-success btn-border ml-auto"><i class="fa fa-plus"></i>add ${Input.Key}</div>`),$this=this;
                label.append(button);
                button.click(function () {
                    let index=Input.Value.findIndex(Object.is.bind(null, undefined));
                    index=index<0?Input.Value.length:index;
                    let x=$this.CreateInput(Input.SubQuery,index,schemaElement[0]),
                        DeleteButoon=$(`<button class="btn btn-icon btn-round btn-border btn-danger mr-2 ml-auto"><i class="fa fa-trash"></i></button>`);
                    x.InputQuery.parent().addClass("row");
                    x.InputQuery.addClass("col-10").after(DeleteButoon);
                    DeleteButoon.click(function () {
                        Input.Value[Input.Value.indexOf(x)].InputQuery.parent().remove();
                        delete Input.Value[Input.Value.indexOf(x)];
                    });
                    Input.Value[index]=x;
                    index=Input.Value.findIndex(Object.is.bind(null, undefined));
                    index=index<0?Input.Value.length:index;
                })
            }
            else{
                Input.Value=[];
                for(let Key in schemaElement){
                    if(schemaElement.hasOwnProperty(Key)){
                        Input.Value.push(this.CreateInput(Input.SubQuery,Key,schemaElement[Key]));
                    }
                }
            }
            Query.append(Input.SubQuery.append(Input.InputQuery));
            return Input;
        }
        show(data,dataUrl){
            this.FillBody(data);
            DataDocument.Container.show();
            this.Inner.show();
            let $this=this;
            return  new Promise(function (resolve,reject) {
                $this.SaveButton.click(()=>{resolve($this.Save())});
                $this.QuiteButton.click(()=>{reject()});
            })
            .then((data)=>{
                data["_id"]=$this.Body["_id"];
                return Swal.queue([{
                    title: `Saving new Data`,
                    text: 'Are you sure about this operation ?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Save',
                    confirmButtonColor: '#31ce36',
                    showLoaderOnConfirm: true,
                    showClass: {popup: 'animated fadeInDown faster'},
                    hideClass: {popup: 'animated fadeOutUp faster'},
                    preConfirm: () => {
                        return $.ajax(dataUrl,{dataType: 'json',timeout: 3000,type: data["_id"]!==undefined?'PUT':'POST',data: data})
                        .then(response=>{
                            Swal.insertQueueStep({icon: 'success',title: "Saved",hideClass: {popup: 'animated fadeOutUp faster'}});
                            if(data["_id"]===undefined) data['_id']=response['_id'];
                            return data;
                        })
                        .catch(reason =>{
                            Swal.insertQueueStep({
                                icon: 'error',title: "Error: " + reason.status,hideClass: {popup: 'animated fadeOutUp faster'},
                                text: reason.responseJSON!==undefined?reason.responseJSON.Error:"Time out we got no response"
                            });
                        })
                    }
                }])
            })
            .finally(()=>{
                this.Inner.addClass("Hidden");
                DataDocument.Container.addClass("Hidden");
            });
        }
        Input(type,key) {
            switch (type) {
                case "ObjectId":return `<input class="form-control" placeholder="ObjectId" type="text" name="${key}">`;
                case "String": return `<input class="form-control" placeholder="Text" type="text" name="${key}">`;
                case "Number": return `<input class="form-control" placeholder="Number" type="number" name="${key}">`;
                case "Date": return `<input class="form-control" placeholder="Date" type="date" name="${key}">`;
                case "Boolean": return `<select class="form-control" name="${key}"><option value=true>true</option><option value=false>false</option></select>`;
            }
        }
    }
    class DataTable {
        #Container;
        #Table;
        #dataTable;
        #DataUrl;
        #Schema;
        #Name;
        #DataDocument;
        #Buttons;
        get dataTable(){
            return this.#dataTable;
        }
        constructor(dataUrl,Name,Schema,Container) {
            this.#Container=Container;
            this.#Schema=Schema;
            this.#DataUrl=dataUrl+Name;
            this.#Name=Name;
            this.CreateSkeleton();
            this.CreateTable(this.columnsFromSchema());
            this.#DataDocument=new DataDocument(this.#Name,this.#Schema);
        }
        CreateSkeleton(){
            let AddButton=$(`<button class="btn btn-round btn-border btn-secondary btn-icon ml-auto mr-2 my-auto"><i class="fa fa-plus"></i></button>`),$this=this,
                EditButton=$('<button disabled class="btn btn-round btn-border btn-success btn-icon  mr-2 my-auto"><i class="fa fa-edit"></i></button>'),
                RemoveButton=$('<button disabled class="btn btn-round btn-border btn-danger btn-icon mr-4 my-auto"><i class="fa fa-trash"></i></button>');
            this.#Table=$(`<table class="table table-hover"></table>`);
            this.#Container.append(
                $(`<div class="card-header row">
                    <h1 class="card-title">${this.#Name}</h1>
                </div>`).append(AddButton).append(EditButton).append(RemoveButton)
            ).append($('<div class="card-body table-responsive"></div>').append(this.#Table));
            AddButton.click(function () {
                $this.AddRow();
            });
            EditButton.click(function () {
                $this.Edit($this.#dataTable,$this.#dataTable.rows(".selected").indexes());
            });
            RemoveButton.click(function () {
                $this.Remove($this.#dataTable,$this.#dataTable.rows(".selected").indexes());
            });
            this.#Buttons={
                AddButton:AddButton,
                EditButton:EditButton,
                RemoveButton:RemoveButton
            }
        }
        CreateTable(columns){
            let $this=this;
            this.#dataTable=this.#Table.DataTable({
                ajax:{url: this.#DataUrl,dataSrc: 'result'},
                lengthMenu:[5,10,15,20,50],columns:columns,scrollX: true,bAutoWidth:false,pageLength:5
            });
            this.#Table.on("click","tr",function () {
                $(this).toggleClass("selected");
                if($this.#Table.has(".selected").length>0){
                    $this.#Buttons.EditButton.removeAttr("disabled");
                    $this.#Buttons.RemoveButton.removeAttr("disabled");
                }
                else {
                    $this.#Buttons.EditButton.attr("disabled",true);
                    $this.#Buttons.RemoveButton.attr("disabled",true);
                }
            })
            $('.sidebar .scroll-wrapper').hover(()=>{setTimeout(()=>{this.#dataTable.draw();},250);})
            $('.nav-toggle').click(()=>{
                setTimeout(()=>{this.#dataTable.draw();},250);
            });
        }
        nestedObjectColumns(SubSchema,columns,name){
            for (let key in SubSchema){
                if(SubSchema.hasOwnProperty(key)){
                    if(typeof SubSchema[key]==="object" && SubSchema[key] instanceof Array) columns.push({
                        data:name+"[, ]",
                        title:name,
                        defaultContent:""
                    });
                    else if(typeof SubSchema[key]==="object" && SubSchema[key].type===undefined) this.nestedObjectColumns(SubSchema[key],columns,name+"."+key);
                    else columns.push({
                        data:name+"."+key,
                        title:name+". "+key,
                        defaultContent:""
                    });
                }
            }
        }
        columnsFromSchema(){
            let columns=[{data:'_id',title:'_id'}],Schema=this.#Schema;
            for(let key in Schema){
                if(Schema.hasOwnProperty(key)){
                    if(typeof Schema[key]==="object" && Schema[key] instanceof Array) columns.push({
                        data:key+"[, ]",
                        title:key,
                        defaultContent:""
                    })
                    else if(typeof Schema[key]==="object" && Schema[key].type===undefined) this.nestedObjectColumns(Schema[key],columns,""+key);
                    else columns.push({
                        data:key,
                        title:key,
                        defaultContent:""
                    });
                }
            }
            return columns;
        }
        AddRow(){
            this.#DataDocument.FillBody({});
            this.#DataDocument.show({},this.#DataUrl).then((data)=>{
                data=data.value[0];
                if(true!==data)this.#dataTable.row.add(data).draw();
            }).catch(()=>{});
        }
        async Edit(table,indexes){
            for(let i=0;i<indexes.length;i++){
                let row= table.row(indexes[i]);
                await this.#DataDocument.show(row.data(),this.#DataUrl).then(data=>{
                    data=data.value[0];
                    if(true!==data) row.data(data);
                }).catch(()=>{});
            }
        }
        Remove(dataTable, indexes) {
            let removelist=[],list='';
            for(let i=0;i<indexes.length;i++){
                let row=dataTable.row(indexes[i]),id=dataTable.row(indexes[i]).data()["_id"];
                list+=id+", ";
                removelist.push({row,id});
            }
            Swal.queue([{
                title: 'Deleting Data',
                text: `deleting data: ${list}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: 'Delete',
                confirmButtonColor: 'rgba(162,4,32,0.95)',
                showClass: {popup: 'animated fadeInDown faster'},
                hideClass: {popup: 'animated fadeOutUp faster'},
                showLoaderOnConfirm: true,
                preConfirm: async ()=>{
                    let b=true;
                    for(let i=0;i< removelist.length;i++){
                        await $.ajax(this.#DataUrl,{dataType: 'json',timeout: 3000,type: 'DELETE',data:{"_id":removelist[i].id}})
                        .catch(reason => {
                            b=false;
                            $(removelist[i].row.node()).removeClass('selected');
                            removelist.splice(i,1);
                            i--;
                            Swal.insertQueueStep({
                                title: `Error data id:${removelist[i].id}`,
                                text: reason.responseJSON!==undefined?reason.responseJSON.Error:"Time Out we got No response",
                                hideClass: {popup: 'animated fadeOutUp faster'},
                                icon: "error"
                            });
                        })
                    }
                    dataTable.rows('.selected').remove().draw();
                    Swal.insertQueueStep({
                        title: 'Success',
                        text: (b?'All':removelist.length>0?'An error Happened but Some of the':'Error Happened None of the') +' Selected Data has been deleted',
                        hideClass: {popup: 'animated fadeOutUp faster'},
                        icon: "success"
                    });
                }
            }]);
        }
    }
    class DataBaseManager{
        #Container;
        #ApiUrl;
        #DataTables;
        document;
        get DataTables(){
            return this.#DataTables;
        }
        constructor(Container,ApiUrl) {
            this.#Container=Container;
            this.#ApiUrl=ApiUrl;
            this.FetchData().then(data=>{
                $('.content').prepend(DataDocument.Container=$("<div class='Hidden Container'></div>"));
                this.CreateDataTables(data);
                this.#Container.removeClass("is-loading is-loading-secondary is-loading-lg");
            })
            .catch((reason) => {
                console.log(reason);
                Swal.fire({
                    title:'Something is Wrong with the DataBase',
                    text:reason.responseJSON!==undefined?reason.responseJSON.Error:"Time out we got no response",
                    icon:"error",
                    showConfirmButton:true
                });
            });
        }
        async FetchData() {
            return $.ajax(this.#ApiUrl, {dataType: 'json',timeout: 3000});
        }
        CreateDataTables(data) {
            this.#DataTables=[];
            data.forEach((el,i)=>{
                let Container=$('<div class="DataTable card col-11 mx-auto mb-5"></div>');
                this.#DataTables[i]={ DataTable:new DataTable(this.#ApiUrl,el.Name,el.Schema,Container),...el}
                this.#Container.append(Container);
            });
        }
    }
    $.fn.DataBase=function(ApiUrl){return new DataBaseManager(this,ApiUrl);}
})();
$("#DataBases").DataBase("/Api/");
