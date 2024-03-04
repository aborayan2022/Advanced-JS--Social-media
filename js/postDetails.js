const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("postId");
let baseUrl = "https://tarmeezacademy.com/api/v1";
getPost();

function getPost() {
    axios.get(`${baseUrl}/posts/${id}`)
    .then(function (response) {
        const post = response.data.data;
        const comments = post.comments;
        const author = post.author;

        document.getElementById("user-name-span").innerHTML = author.username;

        let postTitle = "";
        if (post.title != null) {
            postTitle = post.title;
        }

        let commentsContent = ``;

        for (let comment of comments) {
            commentsContent += `
                <div class=" col-8  d-flex justify-content-sm-start   px-lg-2 py-lg-3    " >
                                <img src="${comment.author.profile_image}" alt="" srcset="" 
                                    class="rounded-circle border border-2 m-lg-3 " style="width: 60px; height: 60px" />
                                <div class="bg-secondary-subtle rounded-5  px-lg-2 py-lg-2">
                                    <b>@${comment.author.username}</b>
                                    <h6>${comment.body}</h6>
                                </div>
                            </div>
                
                `;
        }

        const postContent = `
            <div class="card shadow my-4">
                <div class="card-header">
                    <img src="${author.profile_image}" class="rounded-circle border border-2"
                        style="width:50px;height:50px;">
                    <b>@ ${author.username}</b>
                </div>
                <div class="card-body"onclick="postClicked(${post.id})" style="cursor:pointer;">
                    <img class="w-100" src="${post.image}" alt="photo" srcset="">
                    <p class="text-body-tertiary fs-6 mt-2">${post.created_at}</p>
                    <h5 class="">
                        ${postTitle}
                    </h5>
                    <p>${post.body}</p>
                    <hr>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-chat" viewBox="0 0 16 16">
                        <path
                            d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
                    </svg>
                    <span >
                    ${post.comments_count} comment
                    <span id="post-tags-${post.id}">
                    
                    </span>
                    
                    </span>
                </div>
                
                    <!-- Add Comment -->
                <div class="card-footer d-flex flex-column "id="add-comments" >
                    ${commentsContent}
                </div>
                        <!-- //Add Comment //-->
                    <div class="input-group mb-1   " id="add-comment-div">
                    <input type="text" name="" id="comment-input" placeholder="add your comment here..." class="form-control ">
                    <button type="button" class="btn btn-outline-primary " onclick="createCommentClicked()">SEND</button>
                    </div>
            </div>  
        `;
        document.getElementById("post").innerHTML = postContent;
    });
}

function createCommentClicked() {
    let commentBody = document.getElementById("comment-input").value

    let params = {
        "body": commentBody
    };
    let token = localStorage.getItem("token");
    let url = `${baseUrl}/posts/${id}/comments`;

    axios.post(url, params, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })
        .then((response) => {
            showAlert("The Comment has been Created Successfully" , "success")
            getPost()
        })
        .catch((error) => {
            const errorMessage = error.response.data.message
            showAlert(errorMessage, "danger")
        })
}
setupUI()
function setupUI()
{
    const token = localStorage.getItem("token")
    const loggedInDiv = document.getElementById("logged-in-div")
    const logoutBtn = document.getElementById("logout-Div")
    // hidden and show but new comment
    const addBtnComment = document.getElementById("add-comments")

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

function postClicked(postId) {
    window.location = `postDetails.html?postId=${postId}`
}

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


function getCurrentUser() {
    let user = null

    let storageUser = localStorage.getItem("user")

    if (storageUser != null) {
        user = JSON.parse(storageUser)
    }
    return user
}
