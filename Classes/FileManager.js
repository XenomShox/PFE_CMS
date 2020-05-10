const fs=require('fs'),
    path = require('path');
function StatsOfFile(name=""){
   fs.stat(path.join(__dirname, "../files/"+name),(err,res)=>{
      if(!err) return res;
   })
}
function StatsOfFiles(name=""){
   fs.readdir(path.join(__dirname, "../files"+name),(err,res)=>{
      if(err) return null;//console.log(err);
      else res.forEach(el=>{StatsOfFiles(name+el)})
   });
   console.log(StatsOfFile(name));
}
StatsOfFiles();
module.exports = class FileManager {
    /*----------------Attributes------------*/

    /*------------------Methods-------------*/
}
