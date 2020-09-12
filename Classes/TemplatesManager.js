const mongoose=require("mongoose"),
    path = require('path'),
    FileManager=require("./FileManager");
class TemplatesManager{
    Schema;
    model;
    constructor() {
        this.Schema=new mongoose.Schema({
            name: {type:String,unique:true,required:true},
            data:{type:[{
                    "name": {type:String,required:true,minlength:1},
                    "sort": {type:String,required:true,minlength:1},
                    "limit": {type:Number,min:1,max:10},
                }],default:[]},
            description : { type : String , required : true },
            type : { type : String , required : true , enum : [ "Blog" ]  },
            structure:{
                "Index": {type:String,default:"Index" ,minlength:1 },
                "Categories": {type:String,default:"Categories" ,minlength:1 },
                "Post": {type:String,default:"Post" ,minlength:1 },
                "CreatePost": {type:String,default:"Create" ,minlength:1 },
                "EditPost": {type:String,default:"Edit" ,minlength:1 },
                "Tags": {type:String,default:"Tags" ,minlength:1 },
                "Search": {type:String,default:"Search" ,minlength:1 },
                "Messenger": {type:String,default:"Messenger" ,minlength:1 },
                "Profile": {type:String,default:"Profile" ,minlength:1 },
                "Error": {type:String,default:"Error" ,minlength:1 }
            },
            created:{type:Date,default:Date.now},
            applied : { type : Date , default:()=>new Date("1999")}
        })
        this.model=mongoose.model("Vinland_Templates",this.Schema);
    }
    async getTemplate(id){
        let template=await this.model.findById(id).exec();
        if(!template) throw new Error("There is no template with this id");
        return template;
    }
    CreateTemplate(data){
        return this.model.create(data).exec()
            .catch(reason => {console.error(reason);})
    }
    async getAppliedTemplate(){
        let templates=await this.model.find({}).sort("-applied").limit(1).exec();
        if(templates.length>0) return templates[0];
        else throw new Error("There is no template");
    }
    addTemplateFromZip(file){
        let Template;
        return FileManager.Decompress(file)
            .then(Destination=>{
                return FileManager.LoadJsonFile(path.join(Destination,"structure.json"),true)
                    .then(async structure=>{
                        return this.model.create(structure).then(template=>{
                            Template=template;
                            return FileManager.DeleteFile(path.join(Destination,"structure.json"),"file",true);
                        });
                    })
                    .then( async ()=>{
                        let promises=[];
                        promises.push( FileManager.MoveFile(path.join(Destination,"css"),path.join("/css",Template.name),true) );
                        promises.push( FileManager.MoveFile(path.join(Destination,"javascript"),path.join("/javascript",Template.name),true) );
                        promises.push( FileManager.MoveFile(path.join(Destination,"images"),path.join("/images",Template.name),true) );
                        promises.push( FileManager.MoveFile(path.join(Destination,"views"),path.join("../views/templates",Template.name),true) );
                        try {
                            await Promise.all(promises);
                            return FileManager.DeleteFile(Destination,'folder',true);
                        }
                        catch (e) {
                            await this.deleteTemplatesFiles(Template);
                            throw new Error("there is something wrong with the template schema");
                        }
                    })
                    .catch(async error=>{
                        console.error(error);
                        if(Template) Template.remove();
                        await FileManager.DeleteFile(Destination,"folder",true)
                            .catch(reason=>{ console.error(reason)})
                        throw error;
                    })
            })
    }
    deleteTemplatesFiles(Template){
        let promises=[];
        promises.push( FileManager.DeleteFile(path.join("/css",Template.name),"folder").catch(reason => {console.error(reason)}) )
        promises.push( FileManager.DeleteFile(path.join("/javascript",Template.name),"folder").catch(reason => {console.error(reason)}) )
        promises.push( FileManager.DeleteFile(path.join("/images",Template.name),"folder").catch(reason => {console.error(reason)}) )
        promises.push( FileManager.DeleteFile(path.join("../views/templates",Template.name),"folder").catch(reason => {console.error(reason)}) )
        return Promise.all(promises).catch(reason => {console.error("File exist",reason);});
    }
    getTemplates(){
        return this.model.find({}).sort("-applied").exec();
    }
    async applyTemplate(id){
        let template = await this.model.findById(id);
        if(!template) throw new Error("there is no Template with this Id");
        template.applied=new Date();
        await template.save();
        require("./WebSite").LoadTemplate();
    }
    async removeTemplate(id){
        let template = await this.model.findById(id);
        if(!template) throw new Error("there is no Template with this Id");
        await this.deleteTemplatesFiles(template);
        template.remove();
    }
}
module.exports=new TemplatesManager();