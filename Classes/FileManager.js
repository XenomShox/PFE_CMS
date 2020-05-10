const fs=require('fs'),
    path = require('path');

function WalkFiles(name=""){
   fs.readdir(path.join(__dirname, "../files"+name),(err,res)=>{
      if(err) console.log(err);
      else res.forEach(el=>{
         let temp=name+"/"+el;
         console.log(temp);
         fs.stat(path.join(__dirname, "../files"+temp),(err,res)=>{
            if(err)console.log(err);
            else if(res.isDirectory()) WalkFiles(temp)
            else console.log(res);
         });
      })
   });
   //console.log(StatsOfFile(name));
}
WalkFiles();
module.exports = class FileManager {
    /*----------------Attributes------------*/

    /*------------------Methods-------------*/
}
