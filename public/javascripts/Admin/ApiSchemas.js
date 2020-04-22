(()=>{
    class Schema{
        #index;
        #Skeleton;
        #Header;
        #Body;
        #Footer;
        schemaManager;
        NewSchemaEvent(){
            this.#Body.BodyQuery.find('select[name="Type"]').each((i,el)=>{
                let val=$(el).val();
                $(el).empty().append(this.selectTypes(val));
            });
            this.#Body.BodyQuery.find('select[name="TypeO"]').each((i,el)=>{
                let val=$(el).val();
                $(el).empty().append(this.selectTypes(val,0));
            });

        }
        get Skeleton(){
            return this.#Skeleton;
        }
        constructor(schemaManager,data,index){
            this.schemaManager=schemaManager;
            this.#index=index;
            this.CreateSkeleton();
            this.Set(data);
        }
        Set(data){
            this.CreateStructure(data);
            this.#Skeleton.empty().append(this.CreateHeader()).append(this.CreateBody(this.#Body.BodyQuery,this.#Body.Elements)).append(this.CreateFooter());
            this.#Skeleton.find(".btn").hover(function(){
                $(this).toggleClass("btn-border");
            });
        }
        CreateStructure(data){
            this.#Header={
                headerQuery:$(`
                    <div class="row card-header">
                    </div>
                `),
                Name:data.Name,
                NameQuery:$(`<input pattern="[A-Za-z_]+" onblur="this.checkValidity();" type="text" name ="Name" disabled class="card-title">`),

                Edit:false,
                EditButton:$(`<button class="ml-auto btn btn-icon btn-success btn-border">
                    <i class="fas fa-edit"></i>
                </button>`),
                DeleteButton:$(`<button class="ml-2 btn btn-icon btn-danger btn-border">
                    <i class="fas fa-trash"></i>
                </button>`)
            };
            this.#Body={
                BodyQuery:$(`
                    <div class="card-body">
                        <div class="Schema-Container">
                            <div class="row Schema-Head">
                                <div class="row col-10 mr-auto">
                                    <div class="col">_id</div>:
                                    <div class="col">ObjectId</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `)
            };
            this.#Body.Elements=this.DataElement(data.Schema,this.#Body);
            this.#Footer={
                FooterQuery:$(`
                    <div class="card-footer row">
                    </div>
                `),
                Save:$('<button class="ml-auto mr-1 btn btn-success btn-border">Save</button>'),
                Cancel:$('<button class="mr-3 ml-2 btn btn-danger btn-border">Cancel</button>')
            }
        }
        GetType(Type){
            if(typeof Type=="object")
                if(Type instanceof Array)return "["+this.GetType(Type[0])+"]";
                else if(Type.type!== undefined) return "Option"
                else return "Object";
            else return Type;
        }
        DataElement(Schema,parent=null){
            let arr=[];
            for(let key in Schema){
                let type=this.GetType(Schema[key]),b1=type==="Option",b2=(type==="Object"),b3=(type==="[Object]"),b=(b1||b2||b3);
                let x={
                    Key:key,Parent:parent, KeyJ:$(`<input disabled type="text" class="col" name="Key">`),Type:type,
                    TypeJ:$(`<select disabled name="Type" class="col"></select>`),
                    AddButton:$(`<button class="${b?"":"Hidden"} my-auto ml-auto btn btn-border btn-icon btn-primary btn-xs btn-round"><i class="fas m-auto fa-plus fa-xs"></i></button>`),
                    DeleteButton:$(`<button class="my-auto ml-1 btn btn-border btn-icon btn-danger btn-xs btn-round"><i class="fas m-auto fa-trash fa-xs"></i></button>`),
                    BodyQuery:$('<div class="collapse"></div>')
                }
                if(b1){
                    x.OptionsRm=this.schemaManager.GetOptions(Schema[key].type);
                    x.Options=this.schemaManager.GetOptions(Schema[key].type);
                }
                x.Elements=b? b1?this.DataOption(Schema[key],x):b2?this.DataElement(Schema[key],x):this.DataElement(Schema[key][0],x):[]
                arr.push(x);
            }
            return arr;
        }
        DataOption(Options,parent=null){
            let arr=[];
            for(let option in Options){
                let nesO={
                    Parent:parent,
                    Key:option,
                    Type:Options[option],
                    DeleteButton:$(`<button class="my-auto ml-1 btn btn-border btn-icon btn-danger btn-xs btn-round"><i class="fas m-auto fa-trash fa-xs"></i></button>`)
                };
                if(option!=="type"){
                    nesO={...nesO,
                        OptionJ:$(`
                            <select disabled name="Option" class="col">   
                            </select>
                        `),
                        ChoiceJ:this.InputOption(nesO)
                    }
                }else{
                    nesO={...nesO,
                        OptionJ:$('<div name="Option" class="col">type</div>'),
                        ChoiceJ:$(`
                            <select disabled name="TypeO" class="col">
                            </select>
                        `)
                    }
                }
                arr.push(nesO);
            }
            return arr;
        }
        InputOption(Option){
            switch(Option.Parent.Options[Option.Key]){
                case "String":
                    return $(`
                        <input disabled type="text" name="Choice" class="col" value="${Option.Type}">   
                    `);
                case "Number":
                    return $(`
                        <input disabled type="number" name="Choice" class="col" value="${Option.Type}">   
                    `);
                case "Date":
                    return $(`
                        <input disabled type="date" name="Choice" class="col" value="${Option.Type}">   
                    `);
                case "Select":
                    return $(`
                        <select disabled name="TypeO" class="col">
                            ${this.selectTypes(Option.Type,0)}
                        </select>
                    `);

            }
            return $(`
                        <select disabled name="Choice" class="col"> 
                            <option selected value="${Option.Type}">${Option.Type}</option>
                            <option value="${!Option.Type}">${!Option.Type}</option>
                        </select>
                    `);

        }
        CreateSkeleton(){
            this.#Skeleton=$(`
                <div class="Schema card">
                </div>
            `);
        }
        CreateHeader(){
            let head=this.#Header,$this=this;
            head.EditButton.click(function(){$this.EditOrAdd(this)});
            head.DeleteButton.click(function(){$this.Delete(this)});
            head.headerQuery.append(head.NameQuery.attr("value",head.Name)).append(head.EditButton).append(head.DeleteButton);
            head.NameQuery.change(()=>{
                head.Name=head.NameQuery.val();
            });
            return head.headerQuery;
        }
        CreateBody(BodyQuery,Elements){
            Elements.forEach((el)=>{
                BodyQuery.append(this.CreateElement(el));
            });
            return BodyQuery;
        }
        CreateElement(Element){
            let SchemaHead=$('<div class="row Schema-Head"></div>'),
                Container= $('<div class="Schema-Container"></div>')
                    .append(SchemaHead
                        .append($('<div class="row col-10 mr-auto"></div>')
                            .append(Element.KeyJ.val(Element.Key)).append(":")
                            .append(Element.TypeJ.append(this.selectTypes(Element.Type)))
                        )
                        .append(Element.AddButton)
                        .append(Element.DeleteButton)
                    ).append(Element.BodyQuery);
            Element.KeyJ.change(function(){
                Element.Key=$(this).val();
            });
            SchemaHead.click(function(){
                Element.BodyQuery.toggleClass("show");
            });
            if(Element.Type==="Object" || Element.Type==="[Object]"){
                Container.append(Element.BodyQuery.append(this.CreateBody(Element.BodyQuery,Element.Elements)));
                SchemaHead.addClass("show");
            }
            else if(Element.Type==="Option") {
                Container.append(Element.BodyQuery.append(this.CreateCollapser(Element.BodyQuery,Element.Elements)));
                Element.BodyQuery.find('select[name="Option"]').append(this.selectOptions(Element.Options));
                SchemaHead.addClass("show");
            }
            let $this=this;
            Element.TypeJ.change(function(){
                //Element.Key=$(this).val();
                Element.Type=$(this).val();
                Element.Elements.length=0;
                Element.BodyQuery.empty();
                let b;
                if(Element.Type==="Object" || Element.Type==="[Object]" || (b=(Element.Type==="Option"))){
                    Element.AddButton.removeClass("Hidden");
                    if(b){
                        Element.OptionsRm=$this.schemaManager.GetOptions("String");
                        Element.Options=$this.schemaManager.GetOptions("String");
                        Element.Elements.push({
                            Parent:parent,
                            Key:"type",
                            Type:"String",
                            DeleteButton:$(`<button class="my-auto ml-1 btn btn-border btn-icon btn-danger btn-xs btn-round"><i class="fas m-auto fa-trash fa-xs"></i></button>`),
                            OptionJ:$('<div name="Option" class="col">type</div>'),
                            ChoiceJ:$(`
                                <select disabled name="TypeO" class="col">
                                </select>
                            `)
                        });
                        Element.BodyQuery.append($this.CreateCollapser(Element.BodyQuery,Element.Elements));
                    }
                }else {
                    Element.AddButton.addClass("Hidden");
                    SchemaHead.removeClass("show");
                }

            });
            Element.AddButton.click(function(event){
                if(Element.BodyQuery.hasClass("show"))event.stopPropagation();
                if(Element.Type==="Object" || Element.Type==="[Object]") {
                    let element={
                        Parent:Element,
                        Key:"Key",
                        KeyJ:$(`
                            <input disabled type="text" class="col" name="Key">
                        `),
                        Type:"String",
                        TypeJ:$(`
                            <select disabled name="Type" class="col">   
                            </select>
                        `),
                        AddButton:$(`<button class="Hidden my-auto ml-auto btn btn-border btn-icon btn-primary btn-xs btn-round"><i class="fas m-auto fa-plus fa-xs"></i></button>`),
                        DeleteButton:$(`<button class="my-auto ml-1 btn btn-border btn-icon btn-danger btn-xs btn-round"><i class="fas m-auto fa-trash fa-xs"></i></button>`),
                        Elements:[],
                        BodyQuery:$('<div class="collapse"></div>')
                    };
                    Element.Elements.push(element);
                    Element.BodyQuery.append($this.CreateElement(element));
                }else if(Element.Type==="Option"){
                    let element={
                        Parent:Element,
                        Key: Object.keys(Element.Options)[0],
                        OptionJ:$(`
                            <select disabled name="Option" class="col">   
                            </select>
                        `),
                        DeleteButton:$(`<button class="my-auto ml-1 btn btn-border btn-icon btn-danger btn-xs btn-round"><i class="fas m-auto fa-trash fa-xs"></i></button>`)
                    };
                    element.Type=$this.GetOptionValue(element);
                    Element.Elements.push(element);
                    element.ChoiceJ=$this.InputOption(element);
                    Element.BodyQuery.append($this.CreateOption(element));
                    Element.BodyQuery.find('select[name="Option"]').each((i,el)=>{
                        $(el).find("option:not(:selected)").remove();
                    });
                    Element.BodyQuery.find('select[name="Option"]').append($this.selectOptions(Element.Options));
                }else $(this).addClass("Hidden");
                $this.#Skeleton.find("input,select").removeAttr("disabled");
            });
            Element.DeleteButton.click(function(event){
                event.stopPropagation();
                Container.remove();
                delete Element.Parent.Elements[Element.Parent.Elements.indexOf(Element)];
            });
            return Container;
        }
        selectTypes(val,f){
            let op="";
            this.schemaManager.Mtypes.forEach((el)=>{
                op+=`
                    <option value="${el}" ${val===el?"selected":""}>${el}</option>
                    <option value="[${el}]" ${val==='['+el+']'?"selected":""}>[${el}]</option>
                `;
            });
            if(f===undefined){
                this.schemaManager.SchemaNames.forEach((el)=>{
                    op+=`
                        <option value="${el}" ${val===el?"selected":""}>${el}</option>
                        <option value="[${el}]" ${val==='['+el+']'?"selected":""}>[${el}]</option>
                    `;
                });
                op+=`
                    <option value="Option" ${val==="Option"?"selected":""}>Option</option>
                    <option value="Object" ${val==="Object"?"selected":""}>Object</option>
                    <option value="[Object]" ${val==='[Object]'?"selected":""}>[Object]</option>
                `;
            }
            return op;
        }
        selectOptions(Options,val){
            let op="";
            for(let el in Options) op+=`<option value="${el}" ${val===el?"selected":""}>${el}</option>`;
            return op;
        }
        CreateOption(Element){
            let x,$this=this,y=$('<div class="row col-10 mr-auto"></div>');
            x= $('<div class="Schema-Container"></div>');
            if(Element.Key!=="type"){
                x.append($('<div class="row Schema-Head"></div>')
                    .append(y
                        .append(Element.OptionJ.append(`<option value="${Element.Key}" selected>${Element.Key}</option>`)).append(":")
                        .append(Element.ChoiceJ)
                    )
                    .append(Element.DeleteButton)
                );
                Element.OptionJ.change(function(){
                    //change ChoiceJ and its value
                    Element.Parent.Options[Element.Key]=Element.Parent.OptionsRm[Element.Key];
                    Element.Key=$(this).val();
                    delete Element.Parent.Options[Element.Key];
                    Element.Parent.BodyQuery.find('select[name="Option"]').each((i,el)=>{
                        $(el).find("option:not(:selected)").remove();
                    });
                    Element.Parent.BodyQuery.find('select[name="Option"]').append($this.selectOptions(Element.Parent.Options));
                    delete Element.Parent.Options[Element.Key];
                });
                delete Element.Parent.Options[Element.Key];
                if(Object.keys(Element.Parent.Options).length===0){
                    Element.Parent.AddButton.addClass("Hidden");
                }
                Element.ChoiceJ.change(function(){Element.Type=$(this).val()});
            }else {
                x.append($('<div class="row Schema-Head"></div>')
                    .append(y
                        .append(Element.OptionJ).append(":")
                        .append(Element.ChoiceJ.append(this.selectTypes(Element.Type,0)))
                    )
                );
                Element.ChoiceJ.change(function(){
                    Element.Type=$(this).val();
                    Element.Parent.BodyQuery.children().not(":first").remove();
                    Element.Parent.OptionsRm=$this.schemaManager.GetOptions(Element.Type);
                    Element.Parent.Options=$this.schemaManager.GetOptions(Element.Type);
                    Element.Parent.AddButton.removeClass("Hidden");
                });
            }

            Element.DeleteButton.click(function(){
                x.remove();
                Element.Parent.Options[Element.Key]=Element.Parent.OptionsRm[Element.Key];
                delete Element.Parent.Elements[Element.Parent.Elements.indexOf(Element)];
                Element.Parent.AddButton.removeClass("Hidden");
                Element.Parent.BodyQuery.find('select[name="Option"]').each((i,el)=>{
                    $(el).find("option:not(:selected)").remove();
                });
                Element.Parent.BodyQuery.find('select[name="Option"]').append($this.selectOptions(Element.Parent.Options));
            });
            return x;
        }
        GetOptionValue(Option){
            switch(Option.Parent.Options[Option.Key]){
                case "String":
                    return "";
                case "Number":
                    return 0;
                case "Date":
                    return "2000-01-01";
                case "Select":
                    return "String";
            }
            return "true";
        }
        CreateCollapser(BodyQuery,Elements){
            Elements.forEach((el)=>{
                BodyQuery.append(this.CreateOption(el));
            });
            return BodyQuery;
        }
        CreateFooter(){
            return this.#Footer.FooterQuery.append(
                this.#Footer.Save.click(()=>{this.Save();})
            )
                .append(
                    this.#Footer.Cancel.click(()=>{this.Cancel();})
                );
        }
        EditOrAdd(button){
            if(this.#Skeleton.attr("Edit")===undefined){
                //Edit
                $(button).toggleClass("btn-success btn-primary").find("i").toggleClass("fa-edit fa-plus");
                this.#Skeleton.attr("Edit",true);
            }else{
                //Add
                let Element={
                    Parent:null,
                    Key:"Key",
                    KeyJ:$(`
                        <input disabled type="text" class="col" name="Key">
                    `),
                    Type:"String",
                    TypeJ:$(`
                        <select disabled name="Type" class="col">   
                        </select>
                    `),
                    AddButton: $(`<button class="Hidden my-auto ml-auto btn btn-border btn-icon btn-primary btn-xs btn-round"><i class="fas m-auto fa-plus fa-xs"></i></button>`),
                    DeleteButton: $(`<button class="my-auto ml-1 btn btn-border btn-icon btn-danger btn-xs btn-round"><i class="fas m-auto fa-trash fa-xs"></i></button>`),
                    Elements: [],
                    BodyQuery: $('<div class="collapse"></div>')
                };
                this.#Body.Elements.push(Element);
                this.#Body.BodyQuery.append(this.CreateElement(Element));
            }
            this.#Skeleton.find("input,select").removeAttr("disabled");
        }
        Delete() {
            this.schemaManager.DeleteSchema(this.#index, this.#Header.Name);
        }
        SchemaElements(Elements) {
            let x = {};
            Elements.forEach((el) => {
                //x[]=;
                if (el.Type === "Object" || el.Type === "Option") x[el.Key] = this.SchemaElements(el.Elements);
                else if (el.Type === "[Object]") x[el.Key] = [this.SchemaElements(el.Elements)];
                else if (el.Type[0] === "[") x[el.Key] = [el.Type.substring(1, el.Type.length - 1)];
                else x[el.Key] = el.Type;
            })
            return x;
        }
        Save() {
            this.#Skeleton.removeAttr("Edit");
            this.schemaManager.SaveDataI(this.#index, {
                Name: this.#Header.Name,
                Schema: this.SchemaElements(this.#Body.Elements)
            }).finally(() => {
                this.Set(this.schemaManager.GetDataI(this.#index));
            });
        }
        Cancel(){
            this.#Skeleton.removeAttr("Edit");
            this.Set(this.schemaManager.GetDataI(this.#index));
        }
    }
    class SchemaManager{
        #DataUrl;
        #Container;
        #AddButton;
        #Data;
        SchemaNames=[];
        #Schemas=[];
        Types=[
            {lowercase:"Boolean",uppercase:"Boolean",minlength:"Number",maxlength:"Number", enum:"Array",trim: "Boolean"},
            {min:"Number",max:"Number",enum:"String"},
            {min:"Date",max:"Date"},
            {ref:"Select"}
        ];
        Mtypes=["String","Number","Date","ObjectId","Boolean"];
        constructor(Container,DataUrl,AddButton){
            this.#Container=Container;
            this.#DataUrl=DataUrl;
            this.#AddButton=AddButton;
            this.FetchData().then(()=> {
                this.#Container.empty();
                this.#Data.forEach((el, i) => {
                    this.CreateSchema(i);
                });
                let $this = this;
                this.#AddButton.removeAttr("disabled").click(function () {
                    Swal.queue([{
                        title:'Creating a New Schema',
                        text:'Enter the name for the new Schema',
                        input:'text',
                        inputValue: "NewSchema",
                        showCancelButton: true,
                        confirmButtonColor: '#31ce36',
                        inputValidator: (value) => {
                            if (!(/^[1-9A-Za-z_]+$/.test(value)) || value.length > 64) return  'Schema Name must Contain less than 64 characters and contains only (Numbers, letters and "_")';
                            else if($this.SchemaNames.includes(value)) return 'Schema Name must not Exist Before';
                        },
                        preConfirm:result=>{
                            $this.#Data.push({ Name: result, Schema: {} });
                            $this.CreateSchema($this.#Schemas.length, false);
                            return Swal.insertQueueStep({
                                icon:'info',
                                title:'Reminder',
                                text:"Schema won't be saved to DataBase until you add body to it.",
                                timer:4000, timerProgressBar:true,
                                onOpen:(toast) => {
                                    toast.addEventListener('mouseenter', Swal.stopTimer)
                                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                                },
                                hideClass: {
                                    popup: 'animated fadeOutUp faster'
                                }
                            });
                        },
                        showClass: {
                            popup: 'animated fadeInDown faster'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp faster'
                        }
                    }])
                }).hover(function () {
                    $(this).toggleClass("btn-border");
                });
            });
        }
        GetOptions(type){
            return JSON.parse(JSON.stringify({...this.Types[this.Mtypes.indexOf(type)],required:"Boolean",unique:"Boolean",index:"Boolean",dropDups:"Boolean"}));
        }
        async FetchData(){
            let $this=this;
            await $.ajax(this.#DataUrl, {
                dataType: 'json', // type of response data
                timeout: 500,     // timeout milliseconds
                success: function (data) {   // success callback function
                    $this.#Data = data;
                }
            }).catch(reason => {
                Swal.fire({
                    title:'Something is Wrong with the DataBase',
                    text:'Try again later',
                    icon:"error",
                    showConfirmButton:true
                })
                $this.#Data = [];
            });
        }
        get Data(){
            return JSON.parse(JSON.stringify(this.#Data));
        }
        GetDataI(index) {
            return JSON.parse(JSON.stringify(this.#Data[index]));
        }
        async SaveDataI(index, data){
            //save request
            //ip : api.ipify.org?format=json
            let $this = this;
            return Swal.queue([{
                title: `Saving ${data.Name}`,
                text: 'Are you sure about this operation ?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#31ce36',
                showLoaderOnConfirm: true,
                showClass: {
                    popup: 'animated fadeInDown faster'
                },
                hideClass: {
                    popup: 'animated fadeOutUp faster'
                },
                preConfirm: () => {
                    let request;
                    if (!this.#Schemas[index].old) request = $.ajax(this.#DataUrl, {
                        dataType: 'json', // type of response data
                        timeout: 500,     // timeout milliseconds
                        type: 'POST',
                        data: {Name: data.Name, Schema: data.Schema}
                    });
                    else request = $.ajax(this.#DataUrl, {
                        dataType: 'json', // type of response data
                        timeout: 500,     // timeout milliseconds
                        type: 'PUT',
                        data: {Name: this.#Data[index].Name, NewName: data.Name, Schema: data.Schema}
                    });
                    return request.done((res, status, jqXHR) => {
                        if (jqXHR.status === 201) {
                            $this.#Data[index] = data;
                            $this.#Schemas[index].old=true;
                        }
                        Swal.insertQueueStep({
                            icon: 'success',
                            title: "Saved",
                            hideClass: {popup: 'animated fadeOutUp faster'}
                        });
                    }).catch(reason => {
                        Swal.insertQueueStep({
                            icon: 'error',
                            title: "Error: " + reason.status,
                            hideClass: {
                                popup: 'animated fadeOutUp faster'
                            },
                            text: reason.responseJSON.Error
                        });
                    });
                }
            }]);
        }
        CreateSchema(i,f=true){
            let data=this.GetDataI(i);
            this.SchemaNames.push(data.Name);
            this.#Schemas[i]={Schema:new Schema(this,data,i),old:f};
            this.#Schemas[i].Container=$('<div class="col-12 col-lg-6"></div>').append(this.#Schemas[i].Schema.Skeleton);
            if(f)this.#Container.append(this.#Schemas[i].Container);
            else {this.#Container.prepend(this.#Schemas[i].Container);}
            this.#Schemas.forEach(el=>{
                el.Schema.NewSchemaEvent();
            });
        }
        DeleteSchema(i) {
            let $this = this, Name = this.#Data[i].Name,deleted=()=>{
                $this.#Schemas[i].Container.remove();
                delete $this.#Schemas[i].Schema;
                delete $this.#Schemas[i];
                const index = $this.SchemaNames.indexOf(Name);
                if (index > -1) {
                    $this.SchemaNames.splice(index, 1);
                }
                Swal.insertQueueStep({
                    title: `${Name} Schema has been Deleted`,
                    icon: "success",
                    hideClass: { popup: 'animated fadeOutUp faster'}
                });
            };
            Swal.queue([{
                title: `Deleting ${Name}`,
                text: `by Deleting this Schema "${Name}" you are welling to drop all the data collection of it`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: 'Delete',
                confirmButtonColor: 'rgba(162,4,32,0.95)',
                showClass: {
                    popup: 'animated fadeInDown faster'
                },
                hideClass: {
                    popup: 'animated fadeOutUp faster'
                },
                preConfirm:()=>{
                    if(!this.#Schemas[i].old) deleted();
                    else return Swal.insertQueueStep({
                        title:`Deleting ${Name}`,
                        text:"Enter your password to confirm Deleting",
                        input:"password",
                        showCancelButton: true,
                        confirmButtonText: 'Delete',
                        confirmButtonColor: 'rgba(162,4,32,0.95)',
                        showLoaderOnConfirm: true,
                        preConfirm:(password)=>{
                            return $.ajax(this.#DataUrl, {
                                dataType: 'json', // type of response data
                                timeout: 2000,
                                type: 'DELETE',
                                data: {Name: this.#Data[i].Name, password: password},
                                success: function () {
                                    deleted();
                                }
                            }).catch(reason => {
                                Swal.insertQueueStep({
                                    title: `Error ${reason.status}`,
                                    text: reason.responseJSON.Error,
                                    hideClass: {
                                        popup: 'animated fadeOutUp faster'
                                    },
                                    icon: "error"
                                });
                            });
                        }
                    })
                }
            }]);
        }
    }
    $.fn.Schema=function(DataUrl,option){
        return new SchemaManager(this,DataUrl,option);
    }
})();
var $Schemas = $("#Schemas");
$Schemas.Schema("/Api/", $("#AddButton"));
$Schemas.sortable();
