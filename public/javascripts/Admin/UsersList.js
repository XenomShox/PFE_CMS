(()=> {
    class UsersList {
        constructor(table, _url){
            table.DataTable({
                ajax:{url: _url, dataSrc: ''},
                lengthMenu:[20, 30, 40, 50],columns:[
                    {
                        "data": "profileImage",
                        "orderable": false,
                        "render" : function ( url, type, full) {
                            return `<div class="avatar-sm"><img src=${url} alt="..." class="avatar-img rounded-circle"></div>`;
                        }
                    },
                    {data: 'username', title: "Username"},
                    {data: 'firstName', title: "First Name"},
                    {data: 'lastName', title: "Last Name"},
                    {data: 'email', title: "Email"},
                    {data: 'role', title: "Role"},
                    {data: 'birthday', title: "Birthday"},
                    {data: 'phone', title: "Phone Number"}
                   
                ], order: 1,scrollX: true,bAutoWidth:false,pageLength:20
            });
            
        }
    }
    $.fn.UsersList = function(url) {return new UsersList(this, url);}
})();
$("#UsersList table").UsersList("/user/");