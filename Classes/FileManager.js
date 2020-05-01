const fs=require("fs"),
    path = require("path");

fs.readdir(path.join(__dirname, "../public"),(err,res)=>{
   if(err)console.log(err);
   else console.log(res);
});
module.exports = class FileManager {
    /*----------------Attributes------------*/

    /*------------------Methods-------------*/
}
