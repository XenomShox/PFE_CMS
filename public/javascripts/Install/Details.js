$("#KeyWords").tagsinput({confirmKeys: [9, 32]});
$("#Settings form").FormAjax(()=>{Continue();});
$("input[selector-file]").each((i,elm)=>{
    $(elm).FileSelector({url:"/files"});
})
