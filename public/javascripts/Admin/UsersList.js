(() => {
    class UsersList {
        #roles;
        constructor(table, _url) {
            let $this = this;
            $.ajax({
                url: "/role",
                dataType: "json",
                success: function (res) {
                    $this.#roles = res;
                    let menu = $(".Context-Menu");
                },
                error: function (xhr, err) {
                    console.log(xhr, err);
                },
            });
            let datatable = table.DataTable({
                ajax: { url: _url, dataSrc: "" },
                lengthMenu: [20, 30, 40, 50],
                columns: [
                    {
                        data: "profileImage",
                        orderable: false,
                        render: function (url, type, full) {
                            return `<div class="avatar-sm"><img src=${url} alt="..." class="avatar-img rounded-circle"></div>`;
                        },
                    },
                    { data: "username", title: "Username" },
                    { data: "firstName", title: "First Name" },
                    { data: "lastName", title: "Last Name" },
                    { data: "email", title: "Email" },
                    // { data: "role", title: "Role" },
                    { data: "birthday", title: "Birthday" },
                    { data: "phone", title: "Phone Number" },
                    {
                        data: "banned",
                        orderable: false,
                        render: function (data, type, full) {
                            if (!data.isBanned)
                                return `<button class="btn btn-round btn-icon btn-danger"><i class="fas fa-user-slash"></i></button>`;
                            else
                                return `<button class="btn btn-round btn-icon btn-warning"><i class="fas fa-user-check"></i></button>`;
                        },
                    },
                ],
                order: 1,
                scrollX: true,
                bAutoWidth: false,
                pageLength: 20,
            });
            table.on("click", "button", async function () {
                let clickedButton = $(this);
                var data = datatable.row(clickedButton.parents("tr")).data();

                if (clickedButton.hasClass("btn-danger")) {
                    Swal.queue([
                        {
                            title: `Ban ${data.username}`,
                            text: `Enter number of days ${data.username} should be banned`,
                            icon: "warning",
                            input: "number",
                            showCancelButton: true,
                            confirmButtonText: "Ban",
                            confirmButtonColor: "rgba(162,4,32,0.95)",
                            showClass: { popup: "animated fadeInDown faster" },
                            hideClass: { popup: "animated fadeOutUp faster" },
                            showLoaderOnConfirm: true,
                            preConfirm: (days) => {
                                return $.ajax({
                                    method: "PUT",
                                    url: `/user/ban/${data._id}`,
                                    data: { days },
                                })
                                    .then((res) => {
                                        clickedButton
                                            .removeClass("btn-danger")
                                            .addClass("btn-warning")
                                            .find("i")
                                            .removeClass("fa-user-slash")
                                            .addClass("fa-user-check");

                                        return Swal.insertQueueStep({
                                            title: `${data.username} is Banned`,
                                            icon: "success",
                                            hideClass: {
                                                popup:
                                                    "animated fadeOutUp faster",
                                            },
                                        });
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        return Swal.insertQueueStep({
                                            title: `${data.username} couldn't be banned`,
                                            text: err,
                                            icon: "danger",
                                            hideClass: {
                                                popup:
                                                    "animated fadeOutUp faster",
                                            },
                                        });
                                    });
                            },
                        },
                    ]);
                } else if (clickedButton.hasClass("btn-warning")) {
                    Swal.queue([
                        {
                            title: `Unban ${data.username}`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Unban",
                            confirmButtonColor: "rgba(162,4,32,0.95)",
                            showClass: { popup: "animated fadeInDown faster" },
                            hideClass: { popup: "animated fadeOutUp faster" },
                            showLoaderOnConfirm: true,
                            preConfirm: (days) => {
                                return $.ajax({
                                    method: "PUT",
                                    url: `/user/unban/${data._id}`,
                                })
                                    .then((res) => {
                                        clickedButton
                                            .removeClass("btn-warning")
                                            .addClass("btn-danger")
                                            .find("i")
                                            .removeClass("fa-user-check")
                                            .addClass("fa-user-slash");

                                        return Swal.insertQueueStep({
                                            title: `${data.username} is Unbanned`,
                                            icon: "success",
                                            hideClass: {
                                                popup:
                                                    "animated fadeOutUp faster",
                                            },
                                        });
                                    })
                                    .catch((err) => {
                                        return Swal.insertQueueStep({
                                            title: `${data.username} couldn't Unbanned`,
                                            text: err,
                                            icon: "danger",
                                            hideClass: {
                                                popup:
                                                    "animated fadeOutUp faster",
                                            },
                                        });
                                    });
                            },
                        },
                    ]);
                }
                // location.reload();
            });
            table.on("contextmenu", "tr", function (e) {
                e.preventDefault();
                let rowUser = datatable.row($(this)).data();
                let menu = $(".Context-Menu");
                menu.empty()
                    .append($('<h4 class="text-center">Roles</h4>'))
                    .append($('<hr class="w-75 rounded mb-2 mt-1">'))
                    .append($this.createRolesElems(rowUser));
                console.log($(e.target).parent().offset().left);
                console.log(menu.height());
                menu.css({
                    display: "block",
                    left: $(e.target).parent().offset().left - 220,
                    top:
                        $(e.target).offset().top +
                        $(e.target).height() / 2 -
                        menu.height() / 2 -
                        10,
                }).show();
            });
            $(document).click(function (e) {
                if ($(e.target).parents(".Context-Menu").length === 0) {
                    $(".Context-Menu").hide();
                }
            });
        }
        createRolesElems(user) {
            let list = $(`<ul class="navbar-nav not-selected-nav"></ul>`);
            this.#roles.forEach((role, idx) => {
                let checkbox = $(
                    `<input id="check${idx}" type="checkbox" ${
                        user.roles.indexOf(role._id) !== -1 ? "checked" : ""
                    }>`
                ).change(function (e) {
                    if (this.checked) {
                        $.ajax({
                            url: `/user/role/${user._id}/${role._id}`,
                            type: "POST",
                            success: () => {
                                console.log("Role Added");
                            },
                        });
                    } else {
                        $.ajax({
                            url: `/user/role/delete/${user._id}/${role._id}`,
                            type: "DELETE",
                            success: () => {
                                console.log("Role Deleted");
                            },
                            error: function (xhr, err) {
                                console.log(xhr);
                                console.log(err);
                            },
                        });
                    }
                });
                list.append(
                    $(
                        `<li class="rounded p-1 my-1 d-flex justify-content-between align-items-center"></li>`
                    )
                        .append($(`<h5 class="m-0 mr-4">${role.name}</h5>`))
                        .append(checkbox)
                );
            });
            return list;
        }
    }
    $.fn.UsersList = function (url) {
        return new UsersList(this, url);
    };
})();
let userList = $("#UsersList table").UsersList("/user/");

$("#UsersList table tr").on("click", "button", function () {
    alert("testing");
});
