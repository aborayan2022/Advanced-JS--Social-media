const baseUrl = 'https://tarmeezacademy.com/api/v1';
let currentPage = 1;
let isLoading = false;

// Initial load
loadFriends();

// Add scroll event listener
window.addEventListener("scroll", function () {
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.scrollHeight;
    if (endOfPage && !isLoading) {
        loadFriends()
    }
});

function loadFriends() {
    isLoading = true;
    toggleLoader(true);

    axios.get(`${baseUrl}/users?limit=100&page=${currentPage}`)
        .then(data => {
            toggleLoader(false);
            const newFriends = data.data.data;
            showFriends(newFriends);
            currentPage++;
            isLoading = false;
        })
        .catch(error => {
            console.error("Error fetching users:", error);
            toggleLoader(false);
            isLoading = false;
        });
}

function showFriends(newFriends) {
    let lestFriends = document.querySelector('.lestFriends');
    newFriends.forEach(friend => {
        let newFriend = document.createElement('a');
        newFriend.href = `profile.html?userid=${friend.id}`;
        newFriend.classList.add('item', 'card');
        let avatarUrl = friend.profile_image || 'path/to/default-image.jpg';
        newFriend.innerHTML = `
                <div class="image">
                    <img src="${avatarUrl}" alt="${friend.username}" >
                </div>
                <div class="info">
                    <div class="name">Name: ${friend.username}</div>
                    <div class="email fs-5 ">${friend.email}</div>
                    <div class="created d-flex justify-content-evenly fs-6 ">
                        <div class="comments">Comments: ${friend.comments_count}</div>
                        <div class="posts">Posts: ${friend.posts_count}</div>
                    </div>
                </div>
                `;
        lestFriends.appendChild(newFriend);
    });
}

function toggleLoader(show = true) {
    if (show) {
        document.getElementById("loader").style.visibility = "visible";
    } else {
        document.getElementById("loader").style.visibility = "hidden";
    }
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
        logoutBtn.style.setProperty("display", "block", "important");
        logoutSlide.style.setProperty("display", "flex", "important");
        if (addBut) {
            addBut.style.setProperty("display", "flex", "important");
        }

        // let user = getCurrentUser();
        
        // document.getElementById("nav-user-name").innerHTML = user.username;
        // document.getElementById("nav-user-image").src = user.profile_image;
    }
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

function addBtnClicked() {
    document.getElementById("post-modal-submit-btn").textContent = "Create";
    document.getElementById("post-id-input").value = "";
    document.getElementById("post-modal-title").textContent = "Create A New Post";
    document.getElementById("post-title-input").value = "";
    document.getElementById("post-body-input").value = "";

    let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"), {});
    postModal.show();
}




function userClicked(userId) {
    window.location = `profile.html?userid=${userId}`
}


function getCurrentUser() {
    let user = null

    const storageUser = localStorage.getItem("user")
    console.log(storageUser)
    if (storageUser != null) {
        user = JSON.parse(storageUser)
    }
    return user
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

        alertPlaceholder.append(wrapper)
    };

    appendAlert(customMessage, type);

    setTimeout(() => {
        alertPlaceholder.style.visibility = "hidden"
    }, 3000);
}

setupUI()