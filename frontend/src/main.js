// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, apiCall } from './helpers.js';

import { switchPage,
        createHomeFeedDom, clearBox, createTitleDom, createContentInfoDom, createCreationInfoDom,
        displayUserInfo,
        isJobInfoValid, isValidString, processImage,
        notifyUsers, compareLike, compareComment
 } from './milestoneHelpers.js'


/////////////////////////////////////////////
// MILESTONE 1
/////////////////////////////////////////////

// Milestone 1 elements
const NAVIGATE_TO_REGISTER = document.getElementById('nav-register');
const NAVIGATE_TO_LOGIN = document.getElementById('nav-login');
const LOGOUT_BUTTON = document.getElementById('button-logout');

// Initialise register/login/logout buttons
NAVIGATE_TO_REGISTER.addEventListener('click', () => {
    switchPage(["page-login"], ["page-register"]);
});

NAVIGATE_TO_LOGIN.addEventListener('click', () => {
    switchPage(["page-register"], ["page-login"]);
});

// If user log's out then remove local data and switch to register page
LOGOUT_BUTTON.addEventListener('click', () => {
    switchPage(["session-logged-in"], ["session-logged-out"])
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
});


// 2.1.1 LOGIN
document.getElementById('button-login').addEventListener('click', () => {
    const payload = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value,
    }
    // On successful login, set local storage token to current token and user id
    // Also generate the user's specific 'my-profile' button
    function successfulLogin(data) {
        setTokenAndId(data.token, data.userId);
        updateProfileButton(data.userId)
    }
    apiCall('POST', '/auth/login', payload, successfulLogin);
})

// 2.1.2 REGISTER
document.getElementById('button-register').addEventListener('click', () => {
    const claimedPassword = document.getElementById("register-password").value
    const repeatPassword = document.getElementById("repeat-password").value

    // If password is not correct then alert
    if (claimedPassword !== repeatPassword) {
        alert("Your set password and confirmation password do not match.")
        return;
    }

    // Else register account and login immediately
    const payload = {
        email: document.getElementById("register-email").value,
        password: claimedPassword,
        name: document.getElementById("register-name").value,
    }
    function successfulRegister(data) {
        setTokenAndId(data.token, data.userId);
        updateProfileButton(data.userId)
    }
    apiCall('POST', '/auth/register', payload, successfulRegister);

})

//  When refreshed, if token exists, the user is logged in.
if (localStorage.getItem('token')) {
    switchPage(["session-logged-out"], ["session-logged-in"])
    updateProfileButton(localStorage.getItem("userId"))
    populateHomeFeed();
}


const setTokenAndId = (token, userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    switchPage(["session-logged-out"], ["session-logged-in"])
    populateHomeFeed();
    timeoutForNewJobs();
}

///////////////////////////////////////////
// MILESTONE 2
///////////////////////////////////////////
// 2.2.1 BASIC FEED
function populateHomeFeed() {
    apiCall('GET', '/job/feed?start=0', {}, (jobs => {
        const feed = document.getElementById('feed-items');
        const homeFeedDom = createHomeFeedDom();
        // 1. Clear current feed
        clearBox(feed);

        // 2. Add home info to page
        feed.appendChild(homeFeedDom);
        
        // 3. Add jobs user is following to feed
        addJobsToFeed(feed, jobs);
    }))
}


const addJobsToFeed = (feed, feedItems) => {
    for (const feedItem of feedItems) {
        const feedDom = document.createElement('div');
        feedDom.style.border = '3px solid #000'
        feedDom.style.margin = '5px'
        feedDom.style.class="rounded"
        feedDom.id = feedItem.id;
        // Add Job title and description to job
        feedDom.appendChild(createTitleDom(feedItem));
        // Add linkable name of creator to their profile
        feedDom.appendChild(createCreatorNameDom(feedItem));
        // Add content to job
        feedDom.appendChild(createContentInfoDom(feedItem));
        // Add creation info to job
        feedDom.appendChild(createCreationInfoDom(feedDom, feedItem));

        // Add Likes to job
        feedDom.appendChild(createLikesDom(feedItem));
        // Add like button to job
        feedDom.appendChild(createLikeButton(feedItem));

        // Add comments to Dom
        feedDom.appendChild(createCommentsDom(feedItem));
        // Add comment button
        feedDom.appendChild(createCommentButtonDom(feedItem))


        // Add update button
        addUpdateButton(feedDom, feedItem);
        // Add delete button
        addDeleteButton(feedDom, feedItem);

        feed.appendChild(feedDom);
    }
}

function createCreatorNameDom(feedItem) {
    const creatorDom = document.createElement('div');
    creatorDom.textContent = "Created by: "
    creatorDom.style.margin = '5px';
    creatorDom.style.border = '1px solid #000';

    apiCall('GET', '/user?userId='+feedItem.creatorId, {}, (jobInfo => {
        creatorDom.appendChild(addUserAsLinkableText(feedItem.creatorId, jobInfo.name))
    }))

    return creatorDom;

}


//////////////////////////////////////////
// Milestone 3
//////////////////////////////////////////


// 2.3.1 SHOW LIKES ON A JOB
function createLikeButton(feedItem) {
    const likesButton = document.createElement("button");
    likesButton.textContent = "Like";

    likesButton.addEventListener('click', () => {
        apiCall("PUT", "/job/like", {
            "id": feedItem.id, 
            "turnon": true
        })
        populateHomeFeed();        
    });
    return likesButton;
}

const createLikesDom = (feedItem) => {
    const likesDom = document.createElement('div');
    likesDom.id = 'likes'+feedItem.id;

    const likesTitle = document.createElement('div');
    likesTitle.textContent = "Liked By"
    likesTitle.style.fontSize = "20px";
    likesTitle.margin = '5px';
    likesTitle.style.fontWeight = "bold";

    const likesList = document.createElement('div');
    likesList.style.border = '1px solid #000';
    likesList.style.margin = '5px';
    resolveLikes(likesList, feedItem.likes);

    likesDom.appendChild(likesTitle);
    likesDom.appendChild(likesList);

    return likesDom;
}


// 2.3.2 SHOW COMMENTS ON A JOB
const createCommentsDom = (feedItem) => {
    const commentsDom = document.createElement('div');

    const commentTitle = document.createElement('div');
    commentTitle.textContent = "Comments"
    commentTitle.style.fontSize = "20px";
    commentTitle.margin = '5px';
    commentTitle.style.fontWeight = "bold";

    const commentsBox = document.createElement('div');
    commentsBox.style.border = '1px solid #000';
    commentsBox.style.margin = '5px';
    resolveComments(commentsBox, feedItem.comments);

    commentsDom.appendChild(commentTitle);
    commentsDom.appendChild(commentsBox);

    return commentsDom;
}

// 2.3.3 LIKING A JOB
const resolveLikes = (likesDom, likes) => {
    let likesList = document.createElement('div');
    likesList.innerText = "";
    likesList.margin = "5px";

    for (const like of likes) {
        // Add user to likes list and also make the text name link to profile
        likesList.appendChild(addUserAsLinkableText(like.userId, like.userName));

        const comma = document.createElement('span');
        comma.textContent = ", "
        likesList.appendChild(comma)
    }
    if (likes.length == 0) {
        likesList.innerText = 'No one has liked this job post :( ';
    } else {
        likesList.removeChild(likesList.lastChild)
    }

    likesDom.appendChild(likesList);
}

// 2.3.4 Feed Pagination
window.addEventListener('scroll', () => {
    // Condition set to confirm the user is logged in, and at the home (job feed page)
    if (localStorage.getItem('token') && !document.getElementById('page-job-feeds').classList.contains("hide")) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (clientHeight + scrollTop >= scrollHeight - 5) {
            loadNextJobs();
        }
    }
});

function loadNextJobs() {
    const feedDom = document.getElementById('feed-items');
    // Only infinite scroll for home page for now
    if (feedDom.firstChild.id !== "Home") {
        return;
    }
    // 1. The num of items in the feed is equal to index 
    // of the next job in the job list
    const currentFeedItemsIndex = feedDom.childElementCount;

    // 2. Get jobs after the last job on the page
    apiCall('GET', `/job/feed?start=${currentFeedItemsIndex}`, {}, (jobs => {
        const feed = document.getElementById('feed-items');
        addJobsToFeed(feed, jobs);
    }))
}




////////////////////////////////////////////
// MILESTONE 4
///////////////////////////////////////////

// Milestone 4 elements
const NAVIGATE_TO_HOME = document.getElementById('button-go-home');
const CONFIRM_UPDATE_PROFILE_BUTTON = document.getElementById('button-confirm-profile-update');
const WATCH_BY_EMAIL_BUTTON = document.getElementById('button-watch');

NAVIGATE_TO_HOME.addEventListener('click', () => {
    switchPage(["page-profile", "create-job-post", "update-job-post"], ["page-job-feeds"])
    populateHomeFeed();
})


// 2.4.1 VIEWING OTHER'S PROFILES
// Make username in text linkable e.g. in like, comment, etc
function addUserAsLinkableText(userId, userName) {
    const userNameAsElement = document.createElement("span");
    userNameAsElement.textContent = userName
    userNameAsElement.style.color = "Blue";
    userNameAsElement.classList.add("link");

    addProfileLinkToElement(userNameAsElement, userId);

    return userNameAsElement;
}

function addProfileLinkToElement(element, userId) {
    element.addEventListener('click', () => {
        goToProfile(userId);
    });
}


function goToProfile(userId) {
    const userProfile = document.getElementById("profile-items");
    // 1. Switch to profile page
    switchPage(["page-job-feeds", "create-job-post", "edit-profile", "update-job-post"], ["page-profile", "profile-items"])
    
    const userProfileDom = document.createElement('div');
    // 2. Get user
    apiCall('GET', `/user?userId=${userId}`, {}, (userInfo => {
        // 3. Display user's info

        // Display basic info
        displayUserInfo(userProfileDom, userInfo);
        // Display followers
        displayFollowers(userProfileDom, userInfo.watcheeUserIds);
        // Display jobs
        displayJobs(userProfileDom, userInfo.jobs);
        clearBox(userProfile);
        userProfile.appendChild(userProfileDom);
    }))
}

function displayFollowers(userProfileDom, watcheeUserIds) {
    const followerDom = document.createElement('div');

    const followerTitleDom = document.createElement('div');
    followerTitleDom.innerText = "Total Watchees:"+ watcheeUserIds.length +"   Watched by: ";
    followerTitleDom.style.fontSize = "30px";
    followerTitleDom.style.fontWeight = "bold";

    let followerBoxDom = document.createElement('div');
    followerBoxDom.innerText = "";
    followerBoxDom.style.border = '1px solid #000';
    followerBoxDom.style.margin = '5px';

    // For each userID, get their name and display in followerBoxDom
    for (const watcheeUserId of watcheeUserIds) {
        apiCall('GET', `/user?userId=${watcheeUserId}`, {}, (watcheeUserInfo => {
            // For each watchee user, add as linkable text
            followerBoxDom.appendChild(addUserAsLinkableText(watcheeUserInfo.id, watcheeUserInfo.name));

            const comma = document.createElement('span');
            comma.textContent = ", "
            followerBoxDom.appendChild(comma)
        }))
    }


    followerDom.appendChild(followerTitleDom);
    followerDom.appendChild(followerBoxDom);

    userProfileDom.appendChild(followerDom);
}

function displayJobs(userProfileDom, usersJobs) {
    const jobTitleDom = document.createElement('div');
    jobTitleDom.innerText = "Posted jobs: ";
    jobTitleDom.style.fontSize = "30px";
    jobTitleDom.style.fontWeight = "bold";
    userProfileDom.appendChild(jobTitleDom);
    const sortedJobs = usersJobs;
    sortedJobs.sort((job1, job2) => {
        return new Date(job2.createdAt) - new Date(job1.createdAt);
    })
    addJobsToFeed(userProfileDom, sortedJobs);
}


// 2.4.2 VIEWING OWN PROFILE
// Function updates the 'my profile' button to go to current logged
// in user's profile
function updateProfileButton(loggedInUserId) {
    const myProfileButton = document.getElementById('button-my-profile');
    // View own profile

    addProfileLinkToElement(myProfileButton, loggedInUserId)
}

// 2.4.3 UPDATING YOUR PROFILE
CONFIRM_UPDATE_PROFILE_BUTTON.addEventListener('click', () => {
    const updateEmailInput = document.getElementById("profile-update-email").value;
    const updatePasswordInput = document.getElementById("profile-update-password").value;
    const updateNameInput = document.getElementById("profile-update-name").value;
    const updateImageInput = document.getElementById("profile-update-image").files[0];

    const payload = {}
    // Set value to input only if target value is changed
    if (updateEmailInput !== '') {
        payload.email = updateEmailInput;
    }
    if (updatePasswordInput !== '') {
        payload.password = updatePasswordInput;
    }
    if (updateNameInput !== '') {
        payload.name = updateNameInput;
    }
    
    if (updateImageInput !== undefined) {
        processImage(updateImageInput)
        .then((imageUrl) => {
            payload.image = imageUrl
        })
        .then(() => {
            apiCall("PUT", "/user", payload, successfulEdit);
        })
    }
    function successfulEdit(data) {
    }

    // Condition set since fileToDataUrl is a promise which executes later than the apicall if image exists
    if (updateImageInput === undefined) {
        apiCall("PUT", "/user", payload, successfulEdit);
    }

    switchPage(["edit-profile"], ["profile-items"]);
    goToProfile(localStorage.getItem("userId"))
});

// 2.4.4 WATCHING / UNWATCHING
WATCH_BY_EMAIL_BUTTON.addEventListener('click', () => {
    var targetEmail = prompt("Please enter the email of the user you want to follow: ")
    if (targetEmail === null | targetEmail === '') {
        alert("Search cancelled by user.")
    } else {
        // Probably should be "user not exists" than "invalid user id"?
        apiCall('PUT', '/user/watch', {
            "email": targetEmail,
            "turnon": true,
        })
        populateHomeFeed();
    }
});



///////////////////////////
// MILESTONE 5
///////////////////////////


// Milestone 5 elements
const CREATE_JOB_BUTTON = document.getElementById('create-job');
const CONFIRM_CREATE_JOB_BUTTON = document.getElementById('confirm-create-job-post');
const RESET_CREATE_JOB_BUTTON = document.getElementById('reset-create-job-post');
const CONFIRM_UPDATE_JOB_BUTTON = document.getElementById('confirm-update-job-post');


// 2.5.1 ADDING A JOB
CREATE_JOB_BUTTON.addEventListener('click', () => {
    switchPage(["page-job-feeds", "page-profile", "update-job-post"], ["create-job-post"])
});

CONFIRM_CREATE_JOB_BUTTON .addEventListener('click', () => {
    const jobInfo = {};
    jobInfo.title = document.getElementById("job-create-title").value;
    const image = document.getElementById("job-create-image").files[0];
    jobInfo.start = document.getElementById("job-create-start").value;
    jobInfo.description = document.getElementById("job-create-description").value;

    // Check if job info is valid
    if (!isJobInfoValid(jobInfo)) {
        return;
    }
    processImage(image)
    .then((imageUrl) => {
        jobInfo.image = imageUrl;
    })
    .then(() => {
        apiCall('POST', '/job', jobInfo, (data => {
            if (data !== undefined) {
                alert("Job posted successfully");
            }
        }))
    })
    .then(() => {
        // Switch back to home page
        NAVIGATE_TO_HOME.click()
    })


});

RESET_CREATE_JOB_BUTTON.addEventListener('click', () => {
    document.getElementById("job-create-title").value = '';
    document.getElementById("job-create-image").value = '';
    document.getElementById("job-create-start").value = '';
    document.getElementById("job-create-description").value = '';
});

// 2.5.2 UPDATE AND DELETE POST

// Add Update button if job is created by current user
function addUpdateButton(feedDom, feedItem) {
    // User can only update if the post is their's
    if (parseInt(feedItem.creatorId) !== parseInt(localStorage.getItem('userId'))) {
        return;
    }

    const updateButton = document.createElement("button");
    updateButton.textContent = "Update";

    updateButton.addEventListener('click', () => {
        switchPage(["page-job-feeds", "page-profile", "create-job-post"], ["update-job-post"])
    });

    feedDom.appendChild(updateButton);
}

CONFIRM_UPDATE_JOB_BUTTON.addEventListener('click', () => {
    const updateJobInfo = {};

    updateJobInfo.id = localStorage.getItem("job-to-update-id")
    const updateTitle = document.getElementById("job-update-title").value;
    const updateStart = document.getElementById("job-update-start").value;
    const updateDescription = document.getElementById("job-update-description").value;
    const image = document.getElementById("job-update-image").files[0];

    if (updateTitle !== '') {
        updateJobInfo.title = updateTitle;
    }
    if (updateDescription !== '') {
        updateJobInfo.description = updateDescription;
    }
    if (updateStart !== '') {
        updateJobInfo.start = updateStart;
    }

    // Check if job info is valid
    if (!isJobInfoValid(updateJobInfo)) {
        return;
    }  

    if (image !== undefined) {
        processImage(image)
        .then((imageUrl) => {
            updateJobInfo.image = imageUrl;
        })
        .then(() => {
            apiCall('PUT', '/job', updateJobInfo)
            alert("Job updated successfully");
        
            // Switch back to home page
            NAVIGATE_TO_HOME.click()
        })
    } else {
        apiCall('PUT', '/job', updateJobInfo)
        alert("Job updated successfully");
    
        // Switch back to home page
        NAVIGATE_TO_HOME.click()
    }

});

// Delete job is a button that can be seen for jobs if user created the job
function addDeleteButton(feedDom, feedItem) {
    // User can only delete if the post is their's
    if (parseInt(feedItem.creatorId) !== parseInt(localStorage.getItem('userId'))) {
        return;
    }
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    const jobPayload = {"id":feedItem.id}

    deleteButton.addEventListener('click', () => {
        apiCall('DELETE', '/job', jobPayload)
        alert("Job deleted successfully");
        // Switch back to home page
        NAVIGATE_TO_HOME.click()
    });

    feedDom.appendChild(deleteButton);
}

// 2.5.3 LEAVING COMMENTS
function createCommentButtonDom(feedItem) {
    const commentButton = document.createElement("button");
    commentButton.textContent = "Comment";

    commentButton.addEventListener('click', () => {
        const comment = prompt("Enter your comment")

        if (isValidString(comment)) {
            const commentPayload = {"id": feedItem.id, "comment": comment}
            apiCall('POST', '/job/comment', commentPayload, (data => {
                if (data !== undefined) {
                    alert("Comment posted successfully");
                }
            }));
        } else {
            alert("Please enter a valid comment")
        }
    })

    return commentButton
}

// Comments have username link to profile
const resolveComments = (commentsDom, comments) => {
    for (const comment of comments) {
        const commentDom = document.createElement('div');
        commentDom.style.border = '1px solid #000';
        commentDom.style.margin = '5px';

        // Append comment
        const commentAsElement = document.createElement("span");
        commentAsElement.textContent = comment.comment + " - "
        commentDom.appendChild(commentAsElement)

        // Add name as linkable text
        const userId = comment.userId

        apiCall('GET', '/user?userId='+userId, {}, (data => {
            commentDom.appendChild(addUserAsLinkableText(userId, data.name))
        }))

        commentsDom.appendChild(commentDom);
    }
}

// Milestone 6
// 2.6.2 Live Update
// When comment or like is changed, appeal that change.
// Change can be observed via get /job/feed
// function updateLike() {

// }

function timeoutForNewJobs() {
    setTimeout(currentNewJobs, 1000);
    return
}

function currentNewJobs() {
    // Condition check for page
    apiCall('GET', '/job/feed?start=0', {}, (jobs => {
        for (const job of jobs) {
            const currentJobInfo = {id:job.id, creatorId:job.creatorId, likes: job.likes, comments: job.comments}
            // If current job info is not included in the storage array, it's new, thus notify
            if (!myIncludes(toBeStoredJobs,currentJobInfo)) {
                toBeStoredJobs[toBeStoredJobs.length] = currentJobInfo
                if (toBeStoredJobs.length > 5) {
                    notifyUsers(job.creatorId);
                }
            } else {
                const changed = commentOrLikeChange(toBeStoredJobs, currentJobInfo)
                if (changed) {
                    populateHomeFeed()
                }
            }
        }
        if (localStorage.getItem('token')) {
            timeoutForNewJobs();
        }
    }))
}

function myIncludes(list, target) {
    for (const item of list) {
        if (item.id.toString(10) === target.id.toString(10) && item.creatorId.toString(10) === target.creatorId.toString(10)) {
            return true
        }
    }
    return false
}

const toBeStoredJobs = []

// Returns true if the like list or the comment list has changed
function commentOrLikeChange(list, target) {
    var index = 0
    for (const item of list) {
        if (item.id.toString(10) === target.id.toString(10) && item.creatorId.toString(10) === target.creatorId.toString(10)) {
            if (compareLike(item.likes, target.likes) || compareComment(item.comments, target.comments)) {
                toBeStoredJobs[index] = target
                return true
            }
        }
        index++
    }
    return false
}

// 2.6.3 Push Notifications
if (localStorage.getItem('token')) {
    timeoutForNewJobs();
}
