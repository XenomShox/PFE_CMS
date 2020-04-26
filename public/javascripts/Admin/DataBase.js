(()=>{
    class DataDocument{
        static Container;
        Inner;
        Body;
        constructor(Name,Schema) {
            this.Body={Query:$(`<div class="card-body px-5"></div>`),};
            let QuiteButton=$(`<button class="ml-auto mr-2 btn btn-border btn-danger btn-icon"><i class="fa fa-window-close"></i></button>`),
                SaveButton=$(`<button class="ml-auto mr-2 btn btn-success btn-border">Save Data</button>`),
                $this=this;
            this.Inner=$(`<div class="document col-9 mx-auto"></div>`)
                .append($(`<div class="card"></div>`)
                    .append($(`<div class="card-header row"><h3 class="ml-2 card-title">${Name}</h3></div>`)
                        .append(QuiteButton))
                    .append(this.Body.Query)
                    .append($(`<div class="card-footer row"></div>`)
                        .append(SaveButton)));
            $this.Inner.addClass("Hidden");
            DataDocument.Container.append(this.Inner);
            this.CreateBody(Schema);
            SaveButton.click(function () {
                $this.Save();
            })
            QuiteButton.click(function () {
                DataDocument.Container.addClass("Hidden");
                $this.Inner.addClass("Hidden");
            });
        }
        saveElement(data){
            if(typeof data==="object"){
                let Data={};
                data.forEach(el=>{
                    Data[el.Key]=this.saveElement(el.Value);
                });
                return Data;
            }
            else return data;
        }
        Save(){
            let data={};
            this.Body.data.forEach(el=>{
                data[el.Key]=this.saveElement(el.Value);
            })
            console.log(data);
        }
        FillInputs(inputs,data){
            if(inputs.InputQuery!==undefined)
                inputs.InputQuery.val(data[inputs.Key]);
            else inputs.Value.forEach(l=>{
                this.FillInputs(l,data[inputs.Key]);
            });
        }
        FillBody(data){
            //console.log(this.Body.data);
            this.Body.data.forEach(el=>{
                if(el.InputQuery!==undefined)
                    el.InputQuery.val(data[el.Key]);
                else el.Value.forEach(l=>{
                    this.FillInputs(l,data[el.Key]);
                })
            })
           // ToDo:-Fill Object
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
                Value:null
            },SubQuery=$(`<div class="form-group form-group-default"><label for="${key}">${key}</label></div>`);
            if(schemaElement.type!==undefined){
                Input.InputQuery=$(this.Input(schemaElement.type,key));
                Input.InputQuery.change(function () {
                    Input.Value=Input.InputQuery.val();
                })
            }else{
                Input.Value=[];
                for(let Key in schemaElement){
                    if(schemaElement.hasOwnProperty(Key)){
                        Input.Value.push(this.CreateInput(SubQuery,Key,schemaElement[Key]))
                    }
                }
            }
            Query.append(SubQuery.append(Input.InputQuery));
            return Input;
        }
        show(){
            this.Inner.removeClass("Hidden");
            DataDocument.Container.removeClass("Hidden");
            /*if(data===null){
                this.Inner.find("input,select").each((i,el)=>{
                   $(el).val(null);
                });
            }*/
        }
        Input(type,key) {
            switch (type) {
                case "ObjectId":
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
                $this.Edit($this.#dataTable.rows(".selected"));
            })
            this.#Buttons={
                AddButton:AddButton,
                EditButton:EditButton,
                RemoveButton:RemoveButton
            }
        }
        CreateTable(columns){
            let $this=this;
            this.#dataTable=this.#Table.DataTable({
                ajax:{
                    url: this.#DataUrl,
                    dataSrc: ''
                },
                lengthMenu:[5,10,15,20,50],
                columns:columns,
                scrollX: true,
                pageLength:5
            });
            this.#Table.on("click","tr",function () {
                $(this).toggleClass("selected");
                if($this.#Table.has(".selected").length>0){
                    $this.#Buttons.EditButton.removeAttr("disabled");
                    $this.#Buttons.RemoveButton.removeAttr("disabled");
                }else {
                    $this.#Buttons.EditButton.attr("disabled",true);
                    $this.#Buttons.RemoveButton.attr("disabled",true);
                }
            })
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
                    if(typeof Schema[key]==="object" && Schema[key] instanceof Array) this.nestedArrayColumns(columns);
                    if(typeof Schema[key]==="object" && Schema[key].type===undefined) this.nestedObjectColumns(Schema[key],columns,""+key);
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
            this.#DataDocument.show();
        }
        AddData(data){

        }
        Edit(row){
            let rowData=row.data();
            console.log(rowData);
            for(let i=0 ;i< rowData.length;i++){
                this.#DataDocument.FillBody(rowData[i]);
                this.#DataDocument.show();
            }
        }
    }
    class DataBaseManager{
        #Container;
        #ApiUrl;
        #DataTables;
        document;
        constructor(Container,ApiUrl) {
            this.#Container=Container;
            this.#ApiUrl=ApiUrl;
            this.FetchData().then(data=>{
                $('.content').prepend(DataDocument.Container=$("<div class='Hidden Container'></div>"));
                this.CreateDataTables(data);
                this.#Container.removeClass("is-loading is-loading-secondary is-loading-lg");

            })
            .catch((reason) => {
                Swal.fire({
                    title:'Something is Wrong with the DataBase',
                    text:'Try again later',
                    icon:"error",
                    showConfirmButton:true
                });
                console.log(reason);
            });
        }
        async FetchData() {
            return $.ajax(this.#ApiUrl, {
                dataType: 'json', // type of response data
                timeout: 500,     // timeout milliseconds
            });
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
var $DataBase = $("#DataBases"),db=$DataBase.DataBase("/Api/");
