(()=>{
    class DataTable {
        #Container;
        #Table;
        #dataTable;
        #DataUrl;
        #Schema;
        #Name;
        constructor(dataUrl,Name,Schema,Container) {
            this.#Container=Container;
            this.#Schema=Schema;
            this.#DataUrl=dataUrl+Name;
            this.#Name=Name;
            this.CreateSkeleton();
            this.CreateTable(this.columnsFromSchema());
        }
        CreateSkeleton(){
            let AddButton=$(`<button class="btn btn-round btn-border btn-secondary btn-icon ml-auto mr-2 my-auto"><i class="fa fa-plus"></i></button>`),$this=this,
                EditButton=$('<button class="btn btn-round btn-border btn-success btn-icon  mr-2 my-auto"><i class="fa fa-edit"></i></button>'),
                RemoveButton=$('<button class="btn btn-round btn-border btn-danger btn-icon mr-4 my-auto"><i class="fa fa-trash"></i></button>');
            this.#Table=$(`<table class="table table-hover"></table>`);
            this.#Container.append(
                $(`<div class="card-header row">
                    <h1 class="card-title">${this.#Name}</h1>
                </div>`).append(AddButton).append(EditButton).append(RemoveButton)
            ).append($('<div class="card-body table-responsive"></div>').append(this.#Table));
            AddButton.click(function () {
                $this.DataForm({});
            });
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
                pageLength:5,
                bAutoWidth:false,
            });
            this.#Table.on("click",".btn-success",function () {
                $this.Edit($this.#dataTable.row( $(this).parents('tr') ));
            });
            this.#Table.on("click",".btn-danger",function () {
                console.log(this);
            });
            this.#Table.on("click","tr",function () {
                $(this).toggleClass("selected");
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
                        title:name+"."+key,
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
        Edit(row){
            let rowData=row.data();
            console.log(rowData);
            for(let i in rowData){
                if(i!=="__v")
                console.log(i,rowData[i]);
            }
        };
        FormInputs(Schema,data){
            let inputs=''
            for(let i in Schema){
                if(Schema.hasOwnProperty(i)){
                    if(Schema[i].type!==undefined)inputs+=`<div class="form-group d-flex flex-column"><label class="mb-2 ml-2 mr-auto" for="${i}">${i}</label><input class="form-control mb-4" type="text" name="${i}" placeholder="${i}" value="${data[i]===undefined?"":data[i]}"></div>`
                }
            }
            return inputs;
        }
        DataForm(data){
            Swal.fire({
                title:"Adding a new document to "+this.#Name,
                html:this.FormInputs(this.#Schema,data)
            })
        }
    }
    class DataBaseManager{
        #Container;
        #ApiUrl;
        #DataTables;
        constructor(Container,ApiUrl) {
            this.#Container=Container;
            this.#ApiUrl=ApiUrl;
            this.FetchData().then(data=>{
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
