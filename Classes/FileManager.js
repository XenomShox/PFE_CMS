const fs=require('fs'),
    path = require('path');

/*
function WalkFiles(name=""){
   let root={};
   fs.readdir(path.join(__dirname, "../files"+name),(err,res)=>{
      if(err) console.log(err);
      else res.forEach(el=>{
         let temp=name+"/"+el;
         fs.stat(path.join(__dirname, "../files"+temp),(err,res)=>{
            if(err)console.log(err);
            else if(res.isDirectory()) WalkFiles(temp)
            else console.log(el);
         });
      })
   });
}
*/
module.exports = class FileManager {
    /*----------------Attributes------------*/
   static Path="../files";
    /*------------------Methods-------------*/
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
      if(Path==="/")Path="";
      return new Promise((resolve,reject)=> {
         fs.stat(path.join(__dirname, FileManager.Path + Path + '/' + file), async function (err,res) {
            if(err) reject(err);
            else {
               if(res.isDirectory()){
                  resolve({
                     url: Path + '/' + file,
                     name: file,
                     type:'folder',
                     size: res.size
                  })
               }
               else if(res.isFile()){
                  let type=file.match(/[\.]([^\.]+$)/);
                  resolve({
                     url: Path + '/' + file,
                     name: file,
                     type:type===null?"Unknown":type[1],
                     size: res.size,
                     atime:res.atime,
                     mtime:res.mtime,
                     ctime:res.ctime
                  });
               }
               else reject({Error:"this file isn't a file nor a directory"});
            }
         });
      }).catch(reason => {
         console.log(reason);
      })
   }
}
