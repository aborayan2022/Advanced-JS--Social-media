const baseUrl = 'https://tarmeezacademy.com/api/v1'
let currentPage = 1
let lastPage = 1
setupUI()
getPosts()
window.addEventListener("scroll", function () {
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.scrollHeight;
    if (endOfPage && currentPage < lastPage) {
        currentPage = currentPage + 1

        getPosts(false, currentPage)
    }
})

function userClicked(userId) {
    window.location = `profile.html?userid=${userId}`
}


function getPosts(reload = true, page = 1) {
    toggleLoader(true)
    axios.get(`${baseUrl}/posts?limit=15&page=${page}`)
        .then((response) => {
            toggleLoader(false)
            const posts = response.data.data;
            lastPage = response.data.meta.last_page
            if (reload) {
                document.getElementById("posts").innerHTML = ""
            }
            for (let post of posts) {


                // Show or Hide (edit) Button
                let user = getCurrentUser()
                let isMyPost = user != null && post.author.id == user.id
                let editBtnContent = ``

                if (isMyPost) {
                    editBtnContent =
                        `
                        <button class="btn btn-danger float-end ms-3 my-2 " onclick="deletePostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Delete</button>
                        <button class="btn btn-primary float-end my-2 " onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Edit</button>
                        `
                }
                const author = post.author;
                let postTitle = "";
                if (post.title != null) {
                    postTitle = post.title;
                }
                let content = `
                <div class="card shadow my-4">
                    <div class="card-header">
                        <span onclick="userClicked(${author.id})" style="cursor:pointer;">
                            <img src="${author.profile_image}" class="rounded-circle border border-2"
                                style="width:50px;height:50px;">
                            <b>${author.username}</b>
                        </span>
                        ${editBtnContent}
                    </div>
                    <div class="card-body"onclick="postClicked(${post.id})" style="cursor:pointer;">
                        <img class="w-100" src="${post.image}" alt="photo" srcset="">
                        <p class="text-body-tertiary fs-6 mt-2">${post.created_at}</p>
                        <h5 class="">
                            ${postTitle}
                        </h5>
                        <p>${post.body}</p>
                        <hr>
                        <span >
                        ${post.comments_count} comment
                        <span id="post-tags-${post.id}">
                        
                        </span>
                        
                        </span>
                    </div>
                    
                </div>  
                `;
                document.getElementById("posts").innerHTML += content;

                // Tags content 

                const currentPostTagsId = `post-tags${post.id}`

                // document.getElementById(currentPostTagsId).innerHTML = ""

                for (tag of post.tags) {

                    let tagsContent =
                        `
                        <button class = "btn btn-ms rounded-5" style = "background-color:gray; color: white" >
                        ${tag.name}
                        </button>
                        `;
                    document.getElementById(currentPostTagsId).innerHTML += tagsContent
                }
            }
        })
        .catch((error) => {
            const message = error.response.data.message
            showAlert(message, "danger")
        })

}

function postClicked(postId) {
    window.location = `postDetails.html?postId=${postId}`
}

function loginButClicked() {
    toggleLoader(true)
    const userName = document.getElementById("userName-input").value;
    const password = document.getElementById("password-input").value;

    const prams = {
        username: userName,
        password: password,
    };

    const url = `${baseUrl}/login`;
    axios.post(url, prams)
        .then((response) => {
            toggleLoader(false)
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            const modal = document.getElementById("login-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide()
            showAlert(" User Login successfully", "success")
            setupUI()
        }).catch((error) => {
            const message = error.response.data.message
            console.log(message)
            showAlert(message, "danger")
        }).finally(() => {
            toggleLoader(false)

        })

}

function registerButClicked() {
    const name = document.getElementById("register-name-input").value;
    const userName = document.getElementById("register-userName-input").value;
    const password = document.getElementById("register-password-input").value;
    const proImage = document.getElementById("register-proImg-input").files[0]


    let formData = new FormData()
    formData.append("name", name)
    formData.append("username", userName)
    formData.append("password", password)
    formData.append("image", proImage)


    const headers = {
        "Content-type": "multipart/from-data"
    }

    const url = `${baseUrl}/register`;
    toggleLoader(true)
    axios.post(url, formData, {
        headers: headers
    })
        .then((response) => {
            toggleLoader(false)
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            const modal = document.getElementById("register-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide()
            showAlert("New User Register successfully", "success")
            setupUI()
        }).catch((error) => {
            const message = error.response.data.message

            showAlert(message, "danger")
        }).finally(() => {
            toggleLoader(false)
        })


}

function logOut() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showAlert("Logged Out Successfully")
    setupUI()
}

function createNewPostClicked() {
    let postId = document.getElementById("post-id-input").value;
    let isCreate = postId == null || postId == ""


    const title = document.getElementById("post-title-input").value;
    const body = document.getElementById("post-body-input").value;
    const image = document.getElementById("post-image-input").files[0]
    const token = localStorage.getItem("token")

    let formData = new FormData()
    formData.append("title", title)
    formData.append("body", body)
    formData.append("image", image)

    let url = ``

    const headers = {
        "Content-Type": "multipart/form-data",
        "authorization": `Bearer ${token}`
    }

    if (isCreate) {

        formData.append("_method", "post")
        url = `${baseUrl}/posts`
    } else {

        formData.append("_method", "put")
        url = `${baseUrl}/posts/${postId}`
    }

    axios.post(url, formData, {
        headers: headers
    })
        .then((response) => {
            const modal = document.getElementById("create-post-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide()
            showAlert("New Post Has Been Created", "success")
            getPosts();
        })
        .catch((error) => {
            const message = error.response.data.message
            showAlert(message, "danger")
        })
}

function addBtnClicked() {
    document.getElementById("post-modal-submit-btn").textContent = "Create";
    document.getElementById("post-id-input").value = "";
    document.getElementById("post-modal-title").textContent = "Create A New Post";
    document.getElementById("post-title-input").value = "";
    document.getElementById("post-body-input").value = "";

    let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"), {});
    postModal.show();
}


function editPostBtnClicked(postObject) {
    let post = JSON.parse(decodeURIComponent(postObject));

    document.getElementById("post-modal-submit-btn").innerHTML = "Update";
    document.getElementById("post-id-input").value = post.id;
    document.getElementById("post-modal-title").innerHTML = "Edit Post";
    document.getElementById("post-title-input").value = post.title;
    document.getElementById("post-body-input").value = post.body;

    let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"), {});
    postModal.toggle();
}

function deletePostBtnClicked(postObject) {
    let post = JSON.parse(decodeURIComponent(postObject))

    document.getElementById("delete-post-id-input").value = post.id
    let postModal = new bootstrap.Modal(document.getElementById("delete-post-modal"), {})
    postModal.toggle()
}

function confirmPostDelete() {
    const token = localStorage.getItem("token")
    const postIdBtn = document.getElementById("delete-post-id-input").value
    const url = `${baseUrl}/posts/${postIdBtn}`
    const headers = {
        "authorization": `Bearer ${token}`
    }

    axios.delete(url, {
        headers: headers
    })
        .then((response) => {
            const modal = document.getElementById("delete-post-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide()
            showAlert("The Post Has Ben Deleted Successfully", "success")
            getPosts();
        })
        .catch((error) => {
            const message = error.response.data.message
            showAlert(message, "danger")
        });
}

function showAlert(customMessage, type = "success") {
    const alertPlaceholder = document.getElementById("success-alert");
    const appendAlert = (message, type) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            "</div>",
        ].join("");

        alertPlaceholder.append(wrapper);
    };

    appendAlert(customMessage, type);

    setTimeout(() => {
        alertPlaceholder.style.visibility = "hidden"
    }, 3000);
}

function setupUI() {
    const token = localStorage.getItem("token");
    const loggedInDiv = document.getElementById("logged-in-div");
    const logoutBtn = document.getElementById("logout-Div");
    const addBut = document.getElementById("add-but");
    const logoutSlide = document.getElementById("logout-nav-Div");

    // Check if the script is on the main page
    const isMainPage = window.location.pathname === "/js/min.js" || window.location.pathname === "/index.html"; // Adjust the path accordingly

    if (token == null || !isMainPage) {
        // user is guest (not logged in) or not on the main page
        loggedInDiv.style.setProperty("display", "flex", "important");
        logoutBtn.style.setProperty("display", "none", "important");
        logoutSlide.style.setProperty("display", "none", "important");
        if (addBut) {
            addBut.style.setProperty("display", "none", "important");
        }
    } else {
        // for logged in user on the main page
        loggedInDiv.style.setProperty("display", "none", "important");
        logoutBtn.style.setProperty("display", "flex", "important");
        logoutSlide.style.setProperty("display", "flex", "important");
        if (addBut) {
            addBut.style.setProperty("display", "flex", "important");
        }

        const user = getCurrentUser();
        document.getElementById("nav-username").innerHTML = user.username;
        document.getElementById("nav-user-image").src = user.profile_image;
    }
}


function getCurrentUser() {
    let user = null

    let storageUser = localStorage.getItem("user")

    if (storageUser != null) {
        user = JSON.parse(storageUser)
    }
    return user
}

function profileClicked() {
    window.location = `profile.html?userid=${getCurrentUser().id}`
}

function toggleLoader(show = true) {
    if (show) {
        document.getElementById("loader").style.visibility = "visible";

    } else {
        document.getElementById("loader").style.visibility = "hidden";
    }
}




