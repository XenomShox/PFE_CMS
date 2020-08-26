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

});
  /*  static Statistics={
            Visitors:statistics,
            Users: {
                Subscribers: statistics,
                Active:statistics
            },
            Errors:statistics
        };

 */
class WebSite {
    /*----------------Attributes------------*/
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
                },
                "Type": {"type": "string"}
            },
            "required": ["Name", "Logo","Icon","Description","Licence","SocialMedia","Type"]
        },
        File:"../WebSiteSystem.json"
    };
    #Settings={
        Data:{},
        Schema:{
            "type": "object",
            "properties":{
                "DataBase":{
                    "type":"object",
                    "properties":{
                        "Name": {"type": "string"},
                        "URI":{"type": "string"},
                        "UserName":{"type": "string"},
                        "Password":{"type": "string"}
                    },
                    "required":["Name","URI","UserName","Password"]
                },
                "Security":{
                    "type":"object",
                    "properties":{
                        "SECRET_KEY":{"type": "string"}
                    },
                    "required":["SECRET_KEY"]
                },
                "ApiManager": {
                    "type": "object",
                    "properties": {
                        "Enabled":  {"type": "boolean"},
                        "ApiPostContent": {
                            "type": "object",
                            "properties":{
                                "Enabled": {"type": "boolean"},
                                "reference": {"type": "string, null"}
                            },
                            "required":["Enabled","reference"]
                        },
                    },
                    "required":["Enabled" ,"ApiPostContent"]
                }
            },
            "required":["DataBase" ,"Security","ApiManager"]
        },
        File:"../VinlandSystem.json"
    };
    #WebSiteCategories;
    #EmailSettings={
        Data:null,
        File:"../Email.json",
        Schema:{
            type:"object",
            properties:{
                "host": {type:"string"},
                "port": {type:"number"},
                "secure": {type:"boolean"},
                "auth": {
                    type:"object",
                    properties:{
                        "user": {type:"string"},
                        "pass": {type:"string"}
                    },
                    required:["user","pass"]
                }
            },
            required:["host","port","secure","auth"]
        }
    }
    /*----------------constructor------------*/
    constructor() {
        app.set("WebSite",this);
        this.LoadJsonFile(this.#WebSiteDetails.File).then(file=>{
            if(file && Validator.validate(file,this.#WebSiteDetails.Schema).valid) this.StartUp(file);
            else this.Installation();
        });
    }
    /*------------------Methods-------------*/
    LoadJsonFile(filename){
        return readFile(path.join(__dirname,filename),"utf-8")
            .then((file)=> {
                if(typeof file==="string") return JSON.parse(file);
                else return null;
            })
            .catch(() => { return undefined;});
    }
    WriteJsonFile(filename,json){ return writeFile(path.join(__dirname,filename),json,"utf-8")}
    StartUp(Details){
        console.log("Lunching The WebSite");
        this.#WebSiteDetails.Data=Details;
        this.LoadJsonFile(this.#Settings.File)
            .then((settings)=>{
                if(Validator.validate(settings,this.#Settings.Schema).valid) {
                    this.#Settings.Data=settings;
                    return mongoose.connect(this.#Settings.Data.DataBase.URI, {
                        useNewUrlParser: true,
                        useCreateIndex: true,
                        useUnifiedTopology: true,
                        auth:{user:this.#Settings.Data.DataBase.UserName,password:this.#Settings.Data.DataBase.Password},
                        dbName: this.#Settings.Data.DataBase.Name,
                    })
                        .then((eve)=>{
                            console.log("Db connected");
                            eve.connection.on("disconnected",()=>{process.exit(100);});
                            if(this.#Settings.Data.ApiManager.Enabled){
                                // lunch the apiManager
                                require("./ApiManager").StartApiManager();
                                app.use("/Api", require("../routes/Api"));
                            }
                        })//Api System
                        .then(()=>{
                            app.use("/files", require("../routes/Files"));
                            app.use( (req,res,next) =>{
                                res.locals.WebSite = this.#WebSiteDetails.Data;
                                res.locals.Categories = this.#WebSiteCategories;
                                res.locals.WebSite.Title = res.locals.WebSite.Name;
                                next();
                            })
                            app.use("/Admin", (req,res,next)=>{
                                res.locals.Settings=this.#Settings.Data;
                                res.locals.Email=this.#EmailSettings.Data;
                                next();
                            },require("../routes/Admin"));
                            switch (this.#WebSiteDetails.Data.Type) {
                                case "Blog":
                                    return this.SetUpBlog();
                            }
                        })//Web Site Type
                        .then(()=>{console.log("WebSite Lunched correctly")})

                }
                else throw new Error("Settings aren't valid");
            })
            .catch(reason => {
                console.log("WebSite didn't lunch correctly ",reason)
                process.exit(200);
            });
        this.LoadJsonFile(this.#EmailSettings.File)
            .then(email=>{
                if(Validator.validate(email,this.#EmailSettings.Schema).valid) this.#EmailSettings.Data=email;
                else process.exit(-200);
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
    SaveSettings(settings,callback){
        settings.ApiManager.Enabled=settings.ApiManager.Enabled==="true";
        settings.ApiManager.ApiPostContent.Enabled=settings.ApiManager.ApiPostContent.Enabled==="true";

        if(Validator.validate(settings,this.#Settings.Schema).valid) {
            this.WriteJsonFile(this.#Settings.File,JSON.stringify(settings)).then(()=>{
                this.#Settings.Data=settings;
                callback(200,"Database Settings Successfully changed");
            }).catch(reason => {
                callback(500,reason.message);
            })
        }else callback(400,"These settings aren't Valid");
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
    SaveEmail(email,callback){
        email.secure=email.secure==="true";
        email.port=Number(email.port);
        if(Validator.validate(email,this.#EmailSettings.Schema).valid) {
            this.WriteJsonFile(this.#EmailSettings.File,JSON.stringify(email))
                .then(()=>{
                    this.#EmailSettings.Data=email;
                    callback(200,"WebSite's Email settings Successfully changed");
                })
                .catch(reason => {
                    callback(500,reason.message);
                })
        }
        else callback(400,"These Details aren't Valid");
    }
    SetUpBlog() {
        return this.LoadJsonFile("../views/Blog(vinlandCMS)/Schema.json").then((Data)=>{
            app.set("Schema", {path:"Blog(vinlandCMS)/",...Data.Structure});
            let additional={};
            Data.Data.forEach(elm=>{
                PostManager.GetPosts(elm,(status,res)=>{
                    if(status===200) additional[elm.name]=res;
                    else additional[elm.name]=[];
                })
            })
            app.use(function (req,res,next){
                res.locals.Additional=additional
                next();
            });
            app.use("/user", require("../routes/user"))
            app.use("/role", require("../routes/roles"));
            app.use("/message", require("../routes/message"));
            app.use(require("../routes/BlogRouting"));
        })
    }
}
module.exports = new WebSite();