function deleteComment(e) {
    e.preventDefault();
    let comment = $(this).parent().parent().parent().parent().parent().parent();
    $.ajax({
        url: `${slug}?comment=${$(comment).data("id")}`,
        method: "DELETE",
        success: function (res) {
            comment.remove();
        },
        error: function (xhr, err) {
            console.log(xhr, err);
        },
    });
}

$(document).ready(function (e) {
    let form = $("form.comment-form");
    let DCButtons = $("button.delete-comment");
    for (let i = 0; i < DCButtons.length; i++) {
        $(DCButtons[i]).click(deleteComment);
    }

    form.submit(function (e) {
        e.preventDefault();
        let data = { text: $(this).serializeArray()[0].value };
        data.user = $("a.dropdown-item.id").data("id");
        $.ajax({
            contentType: "application/json",
            dataType: "json",
            url: $(this).attr("action"),
            method: "POST",
            data: JSON.stringify(data),
            success: function (res) {
                let infos = {
                    id: $("a.dropdown-item.id").data("id"),
                    username: $("a.dropdown-item.id").data("username"),
                    profileImage: $("a.dropdown-item.id").data("image"),
                };
                let commentList = $("div.comments-area");
                commentList.append(
                    $(`<div class="comment-list mt-4" data-id="${res._id}"></div>`).append($(
                        '<div class="single-comment justify-content-between d-flex"></div>'
                    ).append(
                        $(
                            '<div class="user justify-content-start d-flex w-100"></div>'
                        )
                            .append(
                                $('<div class="thumb"></div>').append(
                                    $(`<img src=${infos.profileImage} alt="">`)
                                )
                            )
                            .append(
                                $('<div class="desc w-100"></div>')
                                    .append(
                                        $(`<p class="comment">${res.text}</p>`)
                                    )
                                    .append(
                                        $(
                                            '<div class="d-flex justify-content-between w-100"></div>'
                                        )
                                            .append(
                                                $(
                                                    '<div class="d-flex align-items-center"></div>'
                                                ).append(
                                                    $("<h5></h5>").append(
                                                        $(
                                                            `<a href="/user/profile/${infos.id}">${infos.username}</a>`
                                                        )
                                                    )
                                                )
                                            )
                                            .append(
                                                $(
                                                    '<div class="reply-btn"></div>'
                                                ).append(
                                                    $(
                                                        '<button class="delete-comment btn btn-outline-danger btn-sm">DELETE</button>'
                                                    ).click(deleteComment)
                                                )
                                            )
                                    )
                            )
                    ))
                );
            },
            error: function (xhr, err) {
                console.log(xhr, err);
            },
        });
    });
});
