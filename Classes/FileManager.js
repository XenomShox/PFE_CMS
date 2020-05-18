const fs=require('fs'),
    path = require('path');

module.exports = class FileManager {
    /*----------------Attributes------------*/
   static Path="../files";
    /*------------------Methods-------------*/
   static GetFileType(FileName){
      let ext=FileName.match(/[\.]([^\.]+$)/);
      if(ext!=null)
      switch (ext[1].toLowerCase()) {
         //audio
         case "aif": case "cda": case "mid": case "midi":  case "mp3":  case "mpa":  case "ogg": case "wav": case "wma": case "wpl":
            return {type: "Audio", icon: 'fas fa-file-audio'};
         //Compressed
         case "7z": case "arj": case "deb": case "pkg": case "rar": case "rpm": case "gz": case "z": case "zip":
            return {type: "Compressed", icon: "fas fa-file-archive"};
         //Disc and media file
         case "bin": case "dmg": case "iso": case "toast": case "vcd":
            return {type:"Disc",icon:"fas fa-compact-disc"};
         //Data and database
         case "csv": case "dat": case "db": case "dbf": case "log": case "mdb": case "sav": case "sql": case "tar": case "xml":
            return {type: "Data",icon: "fas fa-database"};
         //Email
         case "email": case "eml": case "emlx": case "msg": case "oft": case "ost": case "pst": case "vcf":
            return {type: "Email",icon: "far fa-envelope"};
         //Executable
         case "bat":  case "com": case "exe": case "gadget":  case "msi": case "wsf":
            return {type: "Executable", icon: "far fa-window-maximize"};
         case "jar": case "class": case "java": return {type: "Java",icon: "fab fa-java"}; //Java
         case "c": case "cpp":case "cs": case "h":case "m":case "mm": return {type: "C-language Family",icon: "fab fa-cuttlefish"}; // C-Languages
         case "apk": return {type: "Android-App",icon: "fab fa-android"};//Android
         case "ipa": return {type: "Ios-App",icon: "fab fa-app-store-ios"};//Ios App
          //fonts
         case "fnt": case "fon": case "otf": case "ttf":
            return {type: "Font",icon: "fas fa-font"};
         //Images
         case "ai": case "bmp": case "gif": case "ico": case "jpeg": case "jpg": case "png": case "ps": case "psd": case "svg": case "tif":  case "tiff":
            return {type: "Image",icon: "fas fa-file-image"};
         //scripts and languages
         case "asp": case "aspx": case "cer": case "cfm": case "cgi": case "pl": case "css": case "htm": case "html": case "js": case "jsp": case "part": case "php": case "py": case "rss": case "xhtml": case "sh": case "swift": case "vb":
            return {type: "Scripts/Languages", icon:"fas fa-file-code"};
         //spreadsheet
         case "ods": case "xls": case "xlsm": case "xlsx": return {type: "Spreadsheet", icon: "fas fa-file-excel"}
         //System
         case "bak": case "cab": case "cfg": case "cpl": case "cur": case "dll": case "dmp": case "drv": case "ini": case "lnk":  case "sys": case "tmp":
            return {type: "System",icon: "fas fa-cogs"}
         //videos
         case "avi": case "mpg": case "mpe": case "mpeg": case "asf": case "wmv": case "mov": case "qt": case "rm": case "mp4": case "flv": case "m4v": case "webm": case "ogv":  case "mkv" :
            return {type: 'Video',icon: 'fas fa-file-video'};
         //Word
         case "doc":case "docx": return {type: 'word',icon: 'fas fa-file-word'};
         case "pdf": return {type: "Pdf file",icon: "fas fa-file-pdf"} //PDF
         case "rtf": case "txt": case "tex": case "wpd": case "odt": return {type: "Text File",icon: "fas fa-file-alt"};//Text File
         //PowerPoint
         case "key": case "odp": case "ppt":case "pps":case "pptx": return {type: "Power-Point",icon: "fas fa-file-powerpoint"};
      }
      return {type:"file",icon:"fas fa-file"};
   }
   static GetFolder(Path="",callback){
      fs.readdir(path.join(__dirname, FileManager.Path + Path),(err,res)=>{
         if(err) callback(400,{Error:"This directory doesn't exist"});
         else{
            let result=[];
            res.forEach(el=>{
               result.push(FileManager.GetFileStats(Path,el));
            });
            Promise.all(result).then(values=>{callback(200,values)})
         }
      });
   }
   static async GetFileStats(Path,file){
      return new Promise((resolve,reject)=> {
         fs.stat(path.join(__dirname, FileManager.Path + Path + '/' + file), async function (err,res) {
            if(err) resolve({
               url: Path + '/' + file,
               name: file,
               type:{type:'Corapted',icon:'fas fa-file-medical-alt'},
               size: 0
            });
            else {
               if(res.isDirectory()) resolve({
                     url: Path + '/' + file,
                     name: file,
                     type:{type:'folder',icon:'fas fa-folder'},
                     size: res.size
                  });
               else if(res.isFile()){

                  resolve({
                     url: Path + '/' + file,
                     name: file,
                     type:FileManager.GetFileType(file),
                     size: res.size,
                     atime:res.atime,
                     mtime:res.mtime,
                     ctime:res.ctime
                  });
               }
               else reject({Error:"this file isn't a file nor a directory"});
            }
         });
      })
          .catch(reason => {console.log(reason);});
   }
   static GetFilesTree(Path="",callback){
      let result={};
      fs.readdir(path.join(__dirname, FileManager.Path + Path),{withFileTypes :true},(err,list)=>{
         if(err) return callback(500, {err});
         let pending=list.length;
         if(!pending) return callback(200,result);
         list.forEach(file=>{
            if (file.isDirectory()) FileManager.GetFilesTree(Path+"/"+file.name, function(status, res) {
               result[file.name]=res;
               if (!--pending) callback(200, result);
            });
            else if (!--pending) callback(200, result);
         });
      });
   }
   static NewFolder(Path,FolderName,callback){
      fs.mkdir(path.join(__dirname,FileManager.Path+Path+"/"+FolderName),err=>{
         if(err) return callback(500,"Couldn't Create Folder");
         return callback(201,"Folder Created successfully");
      })
   }
   static DeleteFolder(pathname, DeleteFolder, callback) {
      fs.rmdir(path.join(__dirname,FileManager.Path+pathname+"/"+DeleteFolder),{recursive :true},err=>{
         if(err) return callback(500,"Couldn't Create Folder");
         return callback(200,"Folder Created successfully");
      })
   }
}
