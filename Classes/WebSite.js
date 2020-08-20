const mongoose =require("mongoose"),
    path = require("path"),
    fs=require("fs"),
    readFile= require('util').promisify(fs.readFile),
    writeFile= require('util').promisify(fs.writeFile),
    app=require("../app"),
    PostManager=require("./PostManager"),
    Validator=new (require("jsonschema").Validator)();
/*
const statistics=mongoose.Schema({
    Total:{type:Number,default:0},
    LastMonth:[{type:Number,default:0}]
});*/
class WebSite {
    /*----------------Attributes------------*/
  /*  static Statistics={
            Visitors:statistics,
            Users: {
                Subscribers: statistics,
                Active:statistics
            },
            Errors:statistics
        };*/
    #WebSiteDetails={
        Data:{},
        Schema:{
            "definitions": {
                "SocialMedia": {
                    "type": "object",
                    "properties": {
                        "Name": { "type": "string" },
                        "Url":           { "type": "string" }
                    },
                    "required": ["Name", "Url"]
                }
            },
            "type": "object",
            "properties": {
                "Name": { "type": "string" },
                "Logo": { "type": "string" },
                "Icon": { "type": "string" },
                "Description": { "type": "string" },
                "Licence": { "type": "string" },
                "SocialMedia": {
                    "type":"object",
                    "properties":{
                        "Facebook":{"$ref": "#/definitions/SocialMedia"},
                        "Instagram":{"$ref": "#/definitions/SocialMedia"},
                        "Twitter":{"$ref": "#/definitions/SocialMedia"},
                        "LinkedIn":{"$ref": "#/definitions/SocialMedia"},
                    }
                }
            },
            "required": ["Name", "Logo","Icon","Description","Licence","SocialMedia"]
        },
        File:"../WebSiteSystem.json"
    };
    #Settings;
    #WebSiteCategories;
    /*----------------constructor------------*/
    constructor() {
        app.set("WebSite",this);
        this.LoadWebSiteSettings().then(file=>{
            if(file) this.StartUp(file);
            else this.Installation();
        });
    }
    /*------------------Methods-------------*/
    LoadWebSiteSettings(){
        return this.LoadJsonFile("../VinlandSystem.json");
    }
    LoadJsonFile(filename){
        return readFile(path.join(__dirname,filename),"utf-8")
            .then((file)=> {
                if(typeof file==="string") return JSON.parse(file);
                else return null;
            })
            .catch(() => { return undefined;});
    }
    WriteJsonFile(filename,json){ return writeFile(path.join(__dirname,filename),json,"utf-8")}
    StartUp(Settings){
        this.#Settings=Settings;
        console.log("Lunching The WebSite");

        mongoose.connect(this.#Settings.DataBase.URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            auth:{user:this.#Settings.DataBase.UserName,password:this.#Settings.DataBase.Password},
            dbName: this.#Settings.DataBase.Name,
        })
            .then((eve)=>{
                eve.connection.on("disconnected",()=>{process.exit(100);});
                console.log("Db connected");
                require("./PostManager")
                if(this.#Settings.ApiManager.Enabled){
                    // lunch the apiManager
                    require("./ApiManager").StartApiManager();
                    app.use("/Api", require("../routes/Api"));
                }
            })//Api System
            .then(()=>{
                let $this=this
                app.use("/files", require("../routes/Files"));
                app.use(function (req,res,next) {
                    res.locals.WebSite = $this.#WebSiteDetails.Data;
                    res.locals.Categories = $this.#WebSiteCategories;
                    res.locals.WebSite.Title=res.locals.WebSite.Name;
                    next();
                })
                app.use("/Admin", require("../routes/Admin"));
                switch (this.#Settings.Type) {
                    case "Blog":
                        return this.SetUpBlog();
                }
            })//Web Site Type
            .then(()=>{console.log("WebSite Lunched correctly")})
            .catch((reason => {
                console.log("WebSite didn't lunch correctly ",reason)
                process.exit(200);
            }));
        this.LoadJsonFile(this.#WebSiteDetails.File).then((details)=>{
            if(Validator.validate(details,this.#WebSiteDetails.Schema).valid) this.#WebSiteDetails.Data=details;
            else process.exit(100);
        });
    }
    Installation(){
        console.log("Installing the WebSite");
    }
    LoadCategories(categories){
        this.#WebSiteCategories=[]
        categories.forEach((category)=>{
            this.#WebSiteCategories.push({
                "_id":category["_id"],
                "Name": category.Name,
                "Slug": category.Slug,
                "Description": category.Description
            });
        })
        console.log("Categories Loaded");
    }
    SaveDetails(details,callback){
        if(Validator.validate(details,this.#WebSiteDetails.Schema).valid) {
            this.WriteJsonFile(this.#WebSiteDetails.File,JSON.stringify(details)).then(()=>{
                this.#WebSiteDetails.Data=details;
                callback(200,"WebSite Details Successfully changed");
            }).catch(reason => {
                callback(500,reason.message);
            })
        }else callback(400,"These Details aren't Valid");
    }
    SetUpBlog() {
        return this.LoadJsonFile("../views/Blog(vinlandCMS)/Schema.json").then((data)=>{
            app.set("Schema", {path:"Blog(vinlandCMS)/",...data.Structure});
            let additional={};
            data.Data.forEach(elm=>{
                PostManager.GetPosts(elm,(status,res)=>{
                    if(status===200) additional[elm.name]=res;
                    else additional[elm.name]=[];
                })
            })
            app.use(function (req,res,next){
                res.locals.Additional=additional
                next();
            });
            app.use("/user", require("../routes/user"));
            app.use("/message", require("../routes/message"));
            app.use(require("../routes/BlogRouting"));
        })
    }
}
module.exports = new WebSite();