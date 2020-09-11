(() => {
    class RolesList {
        constructor(container) {
            let $this = this;
            $.ajax({
                url: "/role",
                type: "GET",
                success: function (roles) {
                    roles = roles.filter(role => role.name !== "Owner" && !role.owner)
                    roles.forEach((role) => {
                        container.append(
                            $(`<li class="rounded p-1 role-permission-button d-flex justify-content-between align-items-center" data-id=${role._id}></li>`)
                                .append($(`<span>${role.name.replace("_", " ")}</span>`))
                                .append($(`<i class="far fa-trash-alt"></i>`))
                                .on("click", $this.displayPermissions)
                                .on("click", "i", $this.removeRole)
                        );
                    });
                },
                error: function (xhr, err) {
                    console.log(xhr, err);
                },
            });
            $("li.add-role-button").on("click", function (e) {
                $.ajax({
                    contentType: "application/json",
                    url: "/role",
                    method: "POST",
                    dataType: "json",
                    data: JSON.stringify({ name: "new role", category: "all" }),
                    success: function (role) {
                        container.append(
                            $(`<li class="rounded p-1 role-permission-button d-flex justify-content-between align-items-center" data-id=${role._id}></li>`)
                                .append($(`<span>${role.name.replace("_", " ")}</span>`))
                                .append($(`<i class="far fa-trash-alt"></i>`))
                                .on("click", $this.displayPermissions)
                                .on("click", "i", $this.removeRole)
                        );
                    },
                    error: function (xhr, err) {
                        console.log(xhr, err);
                    },
                });
            });
        }
        removeRole(e) {
            let roleli = $(this).parent();
            $.ajax({
                url: `/role/${roleli.data("id")}`,
                method: "DELETE",
                success: function (res) {
                    roleli.remove();
                },
                error: function (xhr, err) {
                    console.log(xhr, err);
                },
            });
        }

        displayPermissions(e) {
            if ($(e.target).prop("tagName") != "I") {
                let roleLi = $(this);
                $.ajax({
                    url: `/role/${roleLi.data("id")}`,
                    method: "GET",
                    success: (permissions) => {
                        let { category, name, _id, __v } = permissions;
                        delete permissions["_id"];
                        delete permissions["__v"];
                        delete permissions["category"];
                        delete permissions["name"];
                        delete permissions["owner"];
                        // console.log(permissions);
                        let permissionsContainer = $(
                            "div.role-permission-list"
                        );
                        permissionsContainer.empty();

                        let hr = $('<hr class="my-3">');

                        let form = $(`<form></form>`).submit(function (e) {
                            e.preventDefault();
                            let permsKeys = [
                                "owner",
                                "admin_privillage",
                                "create_post",
                                "delete_post",
                            ];
                            let values = {};
                            $.each($(this).serializeArray(), function (
                                i,
                                field
                            ) {
                                values[field.name] = field.value;
                            });
                            let { category, name, ...perms } = values;
                            Object.keys(perms).forEach((key) => {
                                perms[key] = Boolean(perms[key]);
                            });
                            permsKeys.forEach((key) => {
                                perms[key] = !!perms[key] || false;
                            });
                            console.log(perms);
                            $.ajax({
                                contentType: "application/json",
                                url: `/role/${_id}`,
                                method: "PUT",
                                dataType: "json",
                                data: JSON.stringify({
                                    category,
                                    name,
                                    ...perms,
                                }),
                                success: function (role) {
                                    roleLi.find("span").text(values.name);
                                    $.notify(
                                        {
                                            // options
                                            icon: "fas fa-check-circle",
                                            title: "Changes Saved",
                                            message:
                                                "Your changes have been saved you can apply them by right clicking on a user in the User List page",
                                        },
                                        {
                                            // settings
                                            type: "success",
                                        }
                                    );
                                    console.log(role);
                                },
                                error: function (xhr, err) {
                                    $.notify(
                                        {
                                            // options
                                            icon: "fas fa-times",
                                            title: "Error",
                                            message:
                                                "Your changes couldn't be saved for some reasons",
                                        },
                                        {
                                            // settings
                                            type: "danger",
                                        }
                                    );
                                    console.log(xhr, err);
                                },
                            });
                        });

                        let nameInput = $(`<div class="mt-4"></div>`)
                            .append(
                                $(
                                    '<h6 class="text-muted font-weight-bold" >ROLE NAME</h6>'
                                )
                            )
                            .append(
                                $(
                                    `<input name="name" type="text" placeholder="Owner" class="form-control" value="${name}">`
                                )
                            );

                        let categoryInput = $(`<div class="mt-4"></div>`)
                            .append(
                                $(
                                    '<h6 class="text-muted font-weight-bold" >ROLE CATEGORY</h6>'
                                )
                            )
                            .append(
                                $(
                                    `<input name="category" type="text" placeholder="Owner" class="form-control" value=${category}>`
                                )
                            );
                        let permissionsList = $(
                            `<div class="mt-4"></div>`
                        ).append(
                            $(
                                '<h6 class="text-muted font-weight-bold mb-5" >GENERAL PERMISSIONS</h6>'
                            )
                        );
                        Object.keys(permissions).forEach((key) => {
                            let permissionsInputs = $(
                                '<div class="fml"></div>'
                            ).append(
                                $(
                                    '<div class="d-flex justify-content-between"></div>'
                                )
                                    .append(
                                        $(`<h4>${key.replace("_", " ")}</h4>`)
                                    )
                                    .append(
                                        $(
                                            '<label class="switch"></label>'
                                        ).append(
                                            $(
                                                `<input name="${key}" value="${key}" type="checkbox" class="success" ${
                                                    permissions[key]
                                                        ? "checked"
                                                        : ""
                                                }><span class="slider round"></span>`
                                            )
                                        )
                                    )
                            );
                            permissionsList.append([
                                permissionsInputs,
                                $('<hr class="my-3">'),
                            ]);
                        });

                        form.append([
                            nameInput,
                            $('<hr class="my-3">'),
                            categoryInput,
                            $('<hr class="my-3">'),
                            permissionsList,
                            $(
                                '<button class="btn btn-success text-center" type="submit">Save</button>'
                            ),
                        ]);
                        permissionsContainer.append(form);
                    },
                    error: function (xhr, err) {
                        console.log(xhr, err);
                    },
                });
            }
        }
    }
    $.fn.RolesList = function () {
        return new RolesList(this);
    };
})();
$("#Roles div.card-body ul").RolesList();
