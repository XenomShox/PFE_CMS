(()=>{
    class DataTable {
        #Container;
        #Table;
        constructor(dataUrl,Name,columns,Container) {
            this.#Container=Container;
            this.FetchData(dataUrl+Name).then(data=>{
                //this.#Data=data;
                console.log(columns,data);
                this.CreateSkeleton(data,Name,columns);
            });
        }
        CreateSkeleton(data,Name,columns){
            this.#Table=$(`<table class="table table-hover"></table>`);
            this.#Container.append(`
            <div class="card-header row">
                <h1 class="card-title">${Name}</h1>
                <button class="ml-auto mr-3 btn-round btn btn-secondary"><i class="fa fa-plus mr-2"></i> Add Document</button>
            </div>
            `).append($('<div class="card-body table-responsive"></div>').append(this.#Table));
            this.#Table.DataTable({
                data:data,
                columns:columns,
                pageLength:5,
                bAutoWidth:false
            });
        }
        async FetchData(dataUrl){
            return $.ajax(dataUrl, {dataType: 'json',timeout: 500});
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
        columnsFromSchema(Schema){
            let columns=[{data:'_id',title:'_id'}];
            for(let key in Schema){
                if(Schema.hasOwnProperty(key)){
                    columns.push({
                        data:key,
                        title:key,
                        defaultContent:""
                    });
                }
            }
            return columns;
        }
        CreateDataTables(data) {
            this.#DataTables=[];
            data.forEach((el,i)=>{
                let Container=$('<div class="DataTable card col-11 mx-auto mb-5"></div>');
                this.#DataTables[i]={ DataTable:new DataTable(this.#ApiUrl,el.Name,this.columnsFromSchema(el.Schema),Container),...el}
                this.#Container.append(Container);
            });
        }
    }
    $.fn.DataBase=function(ApiUrl){return new DataBaseManager(this,ApiUrl);}
})();
var $DataBase = $("#DataBases"),db=$DataBase.DataBase("/Api/");
$DataBase.sortable();