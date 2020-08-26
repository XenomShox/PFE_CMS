(() => {
    class Schema {
        #schemaManager;
        #Skeleton;
        #index;
        Name;
        constructor(schemaManager, data, index) {
            this.#index = index;
            this.#schemaManager = schemaManager;
            this.CreateSkeleton(data);
        }
        get Skeleton() {
            return this.#Skeleton.Query;
        }
        CreateSkeleton(data) {
            this.Name = data.Name;
            let Header = this.CreateHeader(data.Name),
                Body = this.CreateBody(data.Schema),
                Footer = this.CreateFooter();
            this.#Skeleton = {
                Query: $(`<div class="Schema card"></div>`)
                    .append(Header.Query)
                    .append(Body.Query)
                    .append(Footer.Query),
                Header: Header,
                Body: Body,
                Footer: Footer,
                Edit: false,
            };
        }
        CreateHeader(Name) {
            let $this = this,
                NameQuery = $(
                    `<input pattern="[A-Za-z_]+" onblur="this.checkValidity();" type="text" name ="Name" value="${Name}" class="card-title">`
                ),
                EditButton = $(
                    '<button class="ml-auto btn btn-icon btn-success btn-border"><i class="fas fa-edit"></i></button>'
                ),
                DeleteButton = $(
                    '<button class="ml-2 btn btn-icon btn-danger btn-border"><i class="fas fa-trash"></i></button>'
                ),
                Header = {
                    Query: $(`<div class="row card-header"></div>`)
                        .append(NameQuery)
                        .append(EditButton)
                        .append(DeleteButton),
                    Name: Name,
                };
            EditButton.click(function () {
                $this.EditOrAdd(EditButton);
            });
            DeleteButton.click(function () {
                $this.#schemaManager.DeleteSchema($this.#index);
            });
            NameQuery.change(() => {
                Header.Name = NameQuery.val();
            });
            return Header;
        }
        CreateBody(Schema) {
            let Body = {
                Query: $(`<div class="card-body">
                        <div class="Schema-Container">
                            <div class="row Schema-Head">
                                <div class="row col-10 mr-auto">
                                    <div class="col">_id</div>:
                                    <div class="col">ObjectId</div>
                                </div>
                            </div>
                        </div>
                    </div>`),
                Elements: [],
            };
            for (let key in Schema) {
                if (Schema.hasOwnProperty(key)) {
                    let Element = this.CreateElement(key, Schema[key], Body);
                    Body.Elements.push(Element);
                    Body.Query.append(Element.Query);
                }
            }
            return Body;
        }
        CreateFooter() {
            let Footer = {
                    Query: $('<div class="card-footer row"></div>'),
                    Save: $(
                        '<button class="ml-auto mr-1 btn btn-success btn-border">Save</button>'
                    ),
                    Cancel: $(
                        '<button class="ml-2 btn btn-danger btn-border">Cancel</button>'
                    ),
                },
                $this = this;
            Footer.Query.append(Footer.Save).append(Footer.Cancel);
            Footer.Save.click(function () {
                $this.Save();
            });
            Footer.Cancel.click(function () {
                $this.Reset();
            });
            return Footer;
        }
        EditOrAdd(button) {
            if (this.#Skeleton.Edit) {
                let Element = this.CreateElement(
                    "key" + (this.#Skeleton.Body.Elements.length + 1),
                    { type: "String" },
                    this.#Skeleton.Body
                );
                this.#Skeleton.Body.Elements.push(Element);
                this.#Skeleton.Body.Query.append(Element.Query);
            } else {
                this.#Skeleton.Edit = true;
                this.#Skeleton.Query.attr("Edit", true);
                button
                    .toggleClass("btn-success btn-primary")
                    .find("i")
                    .toggleClass("fa-edit fa-plus");
            }
        }
        CreateElement(Key, schemaElement, Parent) {
            let AddButton = $(
                    '<button class="my-auto ml-auto btn btn-border btn-icon btn-primary btn-xs btn-round"><i class="fas m-auto fa-plus fa-xs"></i></button>'
                ),
                RemoveButton = $(
                    '<button class="my-auto ml-2 btn btn-border btn-icon btn-danger btn-xs btn-round"><i class="fas m-auto fa-trash fa-xs"></i></button>'
                ),
                KeyInput = $(
                    `<input class="col" type="text" value="${Key}" name="Key">`
                ),
                SchemaHead = $(`<div class="row col-10 mr-auto"></div>`)
                    .append(KeyInput)
                    .append(":"),
                Element = {
                    Query: $(`<div class="Schema-Container"></div>`).append(
                        $('<div class="row Schema-Head"></div>')
                            .append(SchemaHead)
                            .append(AddButton)
                            .append(RemoveButton)
                    ),
                    Parent: Parent,
                    Key: Key,
                    Type: "Group",
                    AddButton: AddButton,
                    RemoveButton: RemoveButton,
                    Elements: [],
                    CollapserQuery: $('<div class="collapser"></div>'),
                    Options: [],
                },
                $this = this,
                array = schemaElement instanceof Array,
                notGroup = schemaElement.hasOwnProperty("type") || array;
            if (notGroup) {
                if (array) {
                    schemaElement = schemaElement[0];
                    schemaElement.type = "[" + schemaElement.type + "]";
                }
                Element.Type = schemaElement.type;
                Element.Options = this.#schemaManager.GetOptions(
                    schemaElement.type
                );
                for (let key in schemaElement) {
                    if (schemaElement.hasOwnProperty(key)) {
                        if (key !== "type") {
                            let newElement = this.CreateOption(
                                key,
                                schemaElement[key],
                                Element
                            );
                            Element.Options.splice(
                                Element.Options.indexOf(key),
                                1
                            );
                            Element.Elements.push(newElement);
                            Element.CollapserQuery.append(newElement.Query);
                        }
                    }
                }
                Element.CollapserQuery.find("[name=option]").each((i, el) => {
                    $(el).append($this.Option(Element.Options));
                });
            } else {
                for (let key in schemaElement) {
                    if (schemaElement.hasOwnProperty(key)) {
                        let newElement = this.CreateElement(
                            key,
                            schemaElement[key],
                            Element
                        );
                        Element.Elements.push(newElement);
                        Element.CollapserQuery.append(newElement.Query);
                    }
                }
            }
            Element.Query.append(Element.CollapserQuery);
            let Select = $(this.CreateTypeSelect(Element.Type));
            SchemaHead.append(Select);
            Select.change(function () {
                let val = Select.val();
                Element.Type = val;
                if (val === "Group") {
                    Element.Options = [];
                    notGroup = false;
                } else {
                    Element.Options = $this.#schemaManager.GetOptions(val);
                    notGroup = true;
                }
                Element.CollapserQuery.empty();
                Element.Elements = [];
                AddButton.removeClass("Hidden");
            });
            KeyInput.change(function () {
                Element.Key = KeyInput.val();
            });

            AddButton.click(function (event) {
                if (Element.CollapserQuery.hasClass("show"))
                    event.stopPropagation();
                let newElement;
                if (notGroup) {
                    let option = Element.Options.shift();
                    if (option === undefined) return;
                    newElement = $this.CreateOption(option, null, Element);
                    if (Element.Options.length === 0)
                        AddButton.addClass("Hidden");
                    Element.CollapserQuery.find("[name=option]").each(
                        (i, el) => {
                            let val = $(el).val();
                            $(el)
                                .empty()
                                .append(
                                    `<option value="${val}" selected>${val}</option>` +
                                        $this.Option(Element.Options)
                                );
                        }
                    );
                    newElement.Query.find("[name=option]").each((i, el) => {
                        $(el).append($this.Option(Element.Options));
                    });
                } else newElement = $this.CreateElement("key", { type: "String" }, Element);

                Element.Elements.push(newElement);
                Element.CollapserQuery.append(newElement.Query);
            });
            RemoveButton.click(function () {
                Parent.Elements.splice(Parent.Elements.indexOf(Element), 1);
                Element.Query.remove();
            });
            return Element;
        }
        CreateTypeSelect(Type) {
            let Select = '<select class="col" name="Type">';
            this.#schemaManager.Mtypes.forEach((el) => {
                Select += `<option value="${el}" ${
                    el === Type ? "selected" : ""
                }>${el}</option>
                    <option value="[${el}]" ${
                    "[" + el + "]" === Type ? "selected" : ""
                }>[${el}]</option>`;
            });
            return (
                Select +
                `<option value="Group" ${
                    Type === "Group" ? "selected" : ""
                }>Group</option></select>`
            );
        }
        CreateOption(Key, Value, Parent) {
            let Options = $(
                    `<select class="col" name="option"><option value="${Key}" selected>${Key}</option></select>`
                ),
                RemoveButton = $(
                    '<button class="my-auto ml-2 btn btn-border btn-icon btn-danger btn-xs btn-round"><i class="fas m-auto fa-trash fa-xs"></i></button>'
                ),
                Values = $(this.Values(Key, Value, Parent)),
                Element = {
                    Query: $(`<div class="Schema-Container"></div>`).append(
                        $('<div class="row Schema-Head"></div>')
                            .append(
                                $(`<div class="row col-10 mr-auto"></div>`)
                                    .append(Options)
                                    .append(":")
                                    .append(Values)
                            )
                            .append(RemoveButton)
                    ),
                    Parent: Parent,
                    Key: Key,
                    Type: Value,
                },
                $this = this;
            Options.change(function () {
                let val = Options.val(),
                    nValues = $($this.Values(val, null, Parent));
                Parent.Options.splice(Parent.Options.indexOf(val), 1);
                Parent.Options.push(Element.Key);
                Element.Key = val;
                Values.replaceWith(nValues);
                Values = nValues;
                Values.change(function () {
                    Element.Type = Values.val();
                });
            });
            RemoveButton.click(function () {
                Element.Query.remove();
                Parent.Options.push(Element.Key);
                Parent.AddButton.removeClass("Hidden");
                Parent.Elements.splice(Parent.Elements.indexOf(Element), 1);
                Parent.CollapserQuery.find("[name=option]").each((i, el) => {
                    let val = $(el).val();
                    $(el)
                        .empty()
                        .append(
                            `<option value="${val}" selected>${val}</option>` +
                                $this.Option(Parent.Options)
                        );
                });
            });
            Values.change(function () {
                Element.Type = Values.val();
            });
            Values.change();
            return Element;
        }
        Option(options, key) {
            let Options = "";
            options.forEach((el) => {
                Options += `<option value="${el}" ${
                    key === el ? "selected" : ""
                }>${el}</option>`;
            });
            return Options;
        }
        Values(Key, Value, Parent) {
            let Type = this.#schemaManager.GetOptionType(Parent.Type, Key);
            switch (Type) {
                case "Boolean":
                    return `<select class="col" name="Value"><option value=true ${
                        Value === true ? "selected" : ""
                    }>true</option><option value=false ${
                        Value === false ? "selected" : ""
                    }>false</option></select>`;
                case "Number":
                    return `<input class="col" type="number" value="${
                        Value === null ? 0 : Value
                    }" name="Value">`;
                case "Array":
                case "String":
                    return `<input class="col" type="text" value="${
                        Value === null ? "" : Value
                    }" name="Value">`;
                case "Date":
                    return `<input class="col" type="date" value="${
                        Value === null ? "2020-01-01" : Value
                    }" name="Value">`;
                case "Select":
                    let options = '<select class="col" name="Value">';
                    this.#schemaManager.SchemaNames.forEach((el) => {
                        if (this.Name !== el)
                            options += `<option value=${el} selected>${el}</option>`;
                    });
                    return options + "</select>";
            }
            return ``;
        }
        SchemaTreeSave(Elements) {
            let schema = {};
            Elements.forEach((el) => {
                if (el.Type === "Group")
                    schema[el.Key] = this.SchemaTreeSave(el.Elements);
                else {
                    schema[el.Key] = {};
                    el.Elements.forEach((l) => {
                        schema[el.Key][l.Key] = l.Type;
                    });
                    if (el.Type[0] === "[")
                        schema[el.Key] = [
                            {
                                ...schema[el.Key],
                                type: el.Type.substr(1, el.Type.length - 2),
                            },
                        ];
                    else schema[el.Key].type = el.Type;
                }
            });
            console.log(schema);
            return schema;
        }
        Save() {
            this.#schemaManager.SaveDataI(this.#index, {
                Name: this.#Skeleton.Header.Name,
                Schema: this.SchemaTreeSave(this.#Skeleton.Body.Elements),
            });
        }
        Reset() {
            this.CreateSkeleton(this.#schemaManager.GetDataI(this.#index));
            this.#schemaManager.Schemas[this.#index].Container.empty().append(
                this.#Skeleton.Query
            );
        }
    }
    class SchemaManager {
        #DataUrl;
        #Container;
        #Data;
        SchemaNames = [];
        Schemas = [];
        Default = {
            required: "Boolean",
            unique: "Boolean",
            index: "Boolean",
            dropDups: "Boolean",
        };
        Types = [
            {
                lowercase: "Boolean",
                uppercase: "Boolean",
                minlength: "Number",
                maxlength: "Number",
                enum: "Array",
                trim: "Boolean",
            },
            { min: "Number", max: "Number", enum: "String" },
            { min: "Date", max: "Date" },
            { ref: "Select" },
        ];
        Mtypes = ["String", "Number", "Date", "ObjectId", "Boolean"];
        constructor(Container, DataUrl, AddButton) {
            this.#Container = Container;
            this.#DataUrl = DataUrl;
            this.FetchData().then(() => {
                this.#Container.empty();
                this.#Data.forEach((el, i) => {
                    this.CreateSchema(i);
                });
                let $this = this;
                AddButton.removeAttr("disabled")
                    .click(function () {
                        Swal.queue([
                            {
                                title: "Creating a New Schema",
                                text: "Enter the name for the new Schema",
                                input: "text",
                                inputValue: "NewSchema",
                                showCancelButton: true,
                                confirmButtonColor: "#31ce36",
                                inputValidator: (value) => {
                                    if (
                                        !/^[1-9A-Za-z_]+$/.test(value) ||
                                        value.length > 64
                                    )
                                        return 'Schema Name must Contain less than 64 characters and contains only (Numbers, letters and "_")';
                                    else if ($this.SchemaNames.includes(value))
                                        return "Schema Name must not Exist Before";
                                },
                                preConfirm: (result) => {
                                    $this.#Data.push({
                                        Name: result,
                                        Schema: {},
                                    });
                                    $this.CreateSchema(
                                        $this.Schemas.length,
                                        false
                                    );
                                    return Swal.insertQueueStep({
                                        icon: "info",
                                        title: "Reminder",
                                        text:
                                            "Schema won't be saved to DataBase until you add body to it.",
                                        timer: 4000,
                                        timerProgressBar: true,
                                        onOpen: (toast) => {
                                            toast.addEventListener(
                                                "mouseenter",
                                                Swal.stopTimer
                                            );
                                            toast.addEventListener(
                                                "mouseleave",
                                                Swal.resumeTimer
                                            );
                                        },
                                        hideClass: {
                                            popup: "animated fadeOutUp faster",
                                        },
                                    });
                                },
                                showClass: {
                                    popup: "animated fadeInDown faster",
                                },
                                hideClass: {
                                    popup: "animated fadeOutUp faster",
                                },
                            },
                        ]);
                    })
                    .hover(function () {
                        $(this).toggleClass("btn-border");
                    });
            });
        }
        GetOptions(type) {
            if (type[0] === "[") type = type.substr(1, type.length - 2);
            let elms = this.Types[this.Mtypes.indexOf(type)];
            return [
                ...(elms !== undefined && elms !== null
                    ? Object.keys(elms)
                    : []),
                ...Object.keys(this.Default),
            ];
        }
        GetOptionType(type, option) {
            if (type[0] === "[") type = type.substr(1, type.length - 2);
            if (this.Default[option] !== undefined) return this.Default[option];
            else
                try {
                    return this.Types[this.Mtypes.indexOf(type)][option];
                } catch (e) {
                    return undefined;
                }
        }
        async FetchData() {
            let $this = this;
            await $.ajax(this.#DataUrl, { dataType: "json", timeout: 3000 })
                .then((data) => {
                    return ($this.#Data = data);
                })
                .catch((reason) => {
                    Swal.fire({
                        title: "Something is Wrong with the DataBase",
                        text:
                            reason.responseJSON !== undefined
                                ? reason.responseJSON.Error
                                : "Time out we got no response",
                        icon: "error",
                        showConfirmButton: true,
                    });
                    $this.#Data = [];
                });
        }
        GetDataI(index) {
            return JSON.parse(JSON.stringify(this.#Data[index]));
        }
        SaveDataI(index, data) {
            let $this = this;
            return Swal.queue([
                {
                    title: `Saving ${data.Name}`,
                    text: "Are you sure about this operation ?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Save",
                    confirmButtonColor: "#31ce36",
                    showLoaderOnConfirm: true,
                    showClass: { popup: "animated fadeInDown faster" },
                    hideClass: { popup: "animated fadeOutUp faster" },
                    preConfirm: () => {
                        return $.ajax(this.#DataUrl, {
                            dataType: "json",
                            timeout: 3000,
                            type: !this.Schemas[index].old ? "POST" : "PUT",
                            data: {
                                ...(!this.Schemas[index].old
                                    ? { Name: data.Name }
                                    : {
                                          Name: this.#Data[index].Name,
                                          NewName: data.Name,
                                      }),
                                Schema: data.Schema,
                            },
                        })
                            .done((res, status, jqXHR) => {
                                if (jqXHR.status === 201) {
                                    $this.#Data[index] = data;
                                    $this.Schemas[index].old = true;
                                    $this.Schemas[index].Schema.Reset();
                                }
                                Swal.insertQueueStep({
                                    icon: "success",
                                    title: "Saved",
                                    hideClass: {
                                        popup: "animated fadeOutUp faster",
                                    },
                                });
                            })
                            .catch((reason) => {
                                Swal.insertQueueStep({
                                    icon: "error",
                                    title: "Error: " + reason.status,
                                    hideClass: {
                                        popup: "animated fadeOutUp faster",
                                    },
                                    text:
                                        reason.responseJSON !== undefined
                                            ? reason.responseJSON.Error
                                            : "Time out we got no response",
                                });
                            });
                    },
                },
            ]);
        }
        CreateSchema(i, f = true) {
            let data = this.GetDataI(i);
            this.SchemaNames.push(data.Name);
            this.Schemas[i] = { Schema: new Schema(this, data, i), old: f };
            this.Schemas[i].Container = $(
                '<div class="col-12 col-lg-6"></div>'
            ).append(this.Schemas[i].Schema.Skeleton);
            if (f) this.#Container.append(this.Schemas[i].Container);
            else this.#Container.prepend(this.Schemas[i].Container);
        }
        DeleteSchema(i) {
            let $this = this,
                Name = this.#Data[i].Name,
                deleted = () => {
                    $this.Schemas[i].Container.remove();
                    delete $this.Schemas[i].Schema;
                    delete $this.Schemas[i];
                    const index = $this.SchemaNames.indexOf(Name);
                    if (index > -1) {
                        $this.SchemaNames.splice(index, 1);
                    }
                    Swal.insertQueueStep({
                        title: `${Name} Schema has been Deleted`,
                        icon: "success",
                        hideClass: { popup: "animated fadeOutUp faster" },
                    });
                };
            Swal.queue([
                {
                    title: `Deleting ${Name}`,
                    text: `by Deleting this Schema "${Name}" you are welling to drop all the data collection of it`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Delete",
                    confirmButtonColor: "rgba(162,4,32,0.95)",
                    showClass: { popup: "animated fadeInDown faster" },
                    hideClass: { popup: "animated fadeOutUp faster" },
                    preConfirm: () => {
                        if (!this.Schemas[i].old) deleted();
                        else
                            return Swal.insertQueueStep({
                                title: `Deleting ${Name}`,
                                text: "Enter your password to confirm Deleting",
                                input: "password",
                                showCancelButton: true,
                                hideClass: {
                                    popup: "animated fadeOutUp faster",
                                },
                                confirmButtonText: "Delete",
                                confirmButtonColor: "rgba(162,4,32,0.95)",
                                showLoaderOnConfirm: true,
                                preConfirm: (password) => {
                                    return $.ajax(this.#DataUrl, {
                                        dataType: "json",
                                        timeout: 3000,
                                        type: "DELETE",
                                        data: {
                                            Name: this.#Data[i].Name,
                                            password: password,
                                        },
                                        success: function () {
                                            deleted();
                                        },
                                    }).catch((reason) => {
                                        Swal.insertQueueStep({
                                            title: `Error ${reason.status}`,
                                            text:
                                                reason.responseJSON !==
                                                undefined
                                                    ? reason.responseJSON.Error
                                                    : "Time Out we got No response",
                                            hideClass: {
                                                popup:
                                                    "animated fadeOutUp faster",
                                            },
                                            icon: "error",
                                        });
                                    });
                                },
                            });
                    },
                },
            ]);
        }
    }
    $.fn.Schema = function (DataUrl, option) {
        return new SchemaManager(this, DataUrl, option);
    };
})();
var $Schemas = $("#Schemas");
$Schemas.Schema("/Api/", $("#AddButton"));
if(!window.matchMedia("(max-width: 767px)").matches)$Schemas.sortable();
