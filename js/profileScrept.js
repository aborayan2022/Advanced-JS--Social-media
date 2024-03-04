// const currentPostTagsId = `post-tags${post.id}`

function getCurrentUserId() {
    
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("userid");

    return id
}


setupUI()


// دالة الحصول على المستخدمين



function getUsers() {
    const id = getCurrentUserId()

    axios.get(`${baseUrl}/users/${id}`)
        .then((response) => {
            const user = response.data.data;
            // إضافة البريد الإلكتروني والاسم واسم المستخدم
            document.getElementById("main-info-name").innerHTML = user.name;
            document.getElementById("main-info-userName").innerHTML = user.username;
            document.getElementById("main-info-email").innerHTML = user.email;
            // عدد المنشورات وعدد التعليقات
            document.getElementById("number-posts").innerHTML = user.posts_count;
            document.getElementById("number-comments").innerHTML = user.comments_count;
            // صورة المستخدم
            document.getElementById("image-user").src = user.profile_image;
            // اسم المنشور
            document.getElementById("name-post").innerHTML = `${user.username}`;
        });
}
getUsers() 

// دالة الحصول على المنشور الأول
function getPost1() {
    const id = getCurrentUserId()
    axios.get(`${baseUrl}/users/${id}/posts`)
        .then(function (response) {
            const posts = response.data.data;
    
            document.getElementById("userPost").innerHTML = ''
            for (let post of posts) {
                const author = post.author;
                let postTitle = "";

                // إظهار أو إخفاء زر (تحرير)
                let user = getCurrentUser();
                let isMyPost = user !== null && post.author.id === user.id;
                let editBtnContent = ``;

                if (isMyPost) {
                    editBtnContent =
                        `
                        <button class="btn btn-danger float-end ms-3 my-2 " onclick="deletePostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Delete</button>
                        <button class="btn btn-primary float-end my-2 " onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Edit</button>
                        `;
                }

                if (post.title !== null) {
                    postTitle = post.title;
                }

                let content = `
                    <div class="card shadow my-4">
                        <div class="card-header">
                            <img src="${author.profile_image}" class="rounded-circle border border-2" style="width:50px;height:50px;">
                            <b>${author.username}</b>
                            ${editBtnContent}
                        </div>
                        <div class="card-body" onclick="postClicked(${post.id})" style="cursor:pointer;">
                            <img class="w-100" src="${post.image}" alt="photo" srcset="">
                            <p class="text-body-tertiary fs-6 mt-2">${post.created_at}</p>
                            <h5 class="">${postTitle}</h5>
                            <p>${post.body}</p>
                            <hr>
                            <span>${post.comments_count} comment
                                <span id="post-tags-${post.id}"></span>
                            </span>
                        </div>
                    </div>
                `;
                document.getElementById("userPost").innerHTML += content
            }
        });
}
getPost1() 



function loginButClicked() {

    const userName = document.getElementById("userName-input").value;
    const password = document.getElementById("password-input").value;

    const prams = {
        username: userName,
        password: password,
    };

    const url = `${baseUrl}/login`;
    axios.post(url, prams)
        .then((response) => {

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            const modal = document.getElementById("login-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide()
            showAlert(" User Login successfully", "success")
            setupUI()
        });

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

    axios.post(url, formData, {
        headers: headers
    })
        .then((response) => {
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
        })


}

function logOut() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showAlert("Logged Out Successfully")
    setupUI()
}




function addBtnClicked() {
    document.getElementById("post-modal-submit-btn").innerHTML = "Create"
    document.getElementById("post-id-input").value = ""
    document.getElementById("post-modal-title").innerHTML = "Create A New Post"
    document.getElementById("post-title-input").value = ""
    document.getElementById("post-body-input").value = ""

    let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"), {})
    postModal.toggle()
}

function editPostBtnClicked(postObject) {
    let post = JSON.parse(decodeURIComponent(postObject))

    document.getElementById("post-modal-submit-btn").innerHTML = "Update"
    document.getElementById("post-id-input").value = post.id
    document.getElementById("post-modal-title").innerHTML = "Edit Post"
    document.getElementById("post-title-input").value = post.title
    document.getElementById("post-body-input").value = post.body

    let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"), {})
    postModal.toggle()
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
    const token = localStorage.getItem("token")
    const loggedInDiv = document.getElementById("logged-in-div")
    const logoutBtn = document.getElementById("logout-Div")
    // add but new post 
    const addBut = document.getElementById("add-but")

    if (token == null) // user is guest (not logged in)
    {
        loggedInDiv.style.setProperty("display", "flex", "important")
        logoutBtn.style.setProperty("display", "none", "important")
        
    } else { // for logged in user
        loggedInDiv.style.setProperty("display", "none", "important")
        logoutBtn.style.setProperty("display", "flex", "important")

        const user = getCurrentUser()
        document.getElementById("nav-username").innerHTML = user.username
        document.getElementById("nav-user-image").src = user.profile_image
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
