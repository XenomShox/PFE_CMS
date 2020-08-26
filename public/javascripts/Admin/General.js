$("#KeyWords").tagsinput({confirmKeys: [9, 32]});
$("#Settings form").FormAjax();
$("input[selector-file]").each((i,elm)=>{
    $(elm).FileSelector({url:"/files"});
})
