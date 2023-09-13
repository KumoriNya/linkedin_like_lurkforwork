import { apiCall, fileToDataUrl } from './helpers.js';

//////////////
// Milestone 1
//////////////
export const switchPage = (fromElement, toElement) => {
    for (const elementToHide of fromElement) {
        hide(elementToHide);
    }

    for (const elementToShow of toElement) {
        show(elementToShow);
    }
}

const show = (element) => {
    document.getElementById(element).classList.remove('hide');
}

const hide = (element) => {
    document.getElementById(element).classList.add('hide');
}

//////////////
// MILESTONE 2
//////////////

export const createHomeFeedDom = () => {
    const homeFeedDom = document.createElement('div');
    homeFeedDom.id = "Home";;
    homeFeedDom.innerText = "Home";
    homeFeedDom.classList.add("large-header");

    return homeFeedDom;
}

export const clearBox = (domElement) => {   
    domElement.innerHTML = "";
    return;
}

const jobDescriptionImageWidth = '100px';
const jobDescriptionImageHeight = '100px';

export const createTitleDom = (feedItem) => {
    const titleDom = document.createElement('div');
    const imgDivDom = document.createElement('div');
    const imgDom = document.createElement('img');
    imgDom.src = feedItem.image;
    imgDom.style.width = jobDescriptionImageWidth;
    imgDom.style.height = jobDescriptionImageHeight;
    imgDivDom.appendChild(imgDom);

    titleDom.style.border = '1px solid #000';
    titleDom.style.textAlign = 'center';
    titleDom.innerText = "Job title: "+feedItem.title;
    titleDom.appendChild(imgDom);

    return titleDom;
}

export const createContentInfoDom = (feedItem) => {
    const contentDom = document.createElement('div');
    contentDom.style.border = '1px solid #000';
    contentDom.innerText = "Job description: " + feedItem.description;

    return contentDom;
}

export const createCreationInfoDom = (feedDom, feedItem) => {
    // Creation information
    const creationInfoDom = document.createElement('div');
    creationInfoDom.style.border = '1px solid #000';

    // Job start time
    const startTimeDom = document.createElement('div');
    startTimeDom.style.border = '1px solid #000';
    // startTimeDom.innerText = "Job starts at: " + feedItem.start;

    // time of creation
    const createTimeDom = document.createElement('p');
    createTimeDom.style.margin = '5px';
    // createTimeDom.innerText = "Created at: " + feedItem.createdAt;
    resolveTime(createTimeDom, startTimeDom, feedItem.createdAt, feedItem.start);
    feedDom.appendChild(startTimeDom);
    creationInfoDom.appendChild(createTimeDom);


    return creationInfoDom;
}


const resolveTime = (createTimeDom, StartTimeDom, createdAt, startAt) => {
    const createdDate = new Date(createdAt)
    const startDate = new Date(startAt)
    const currentDate = new Date()
    if (isLessThan24HoursAgo(createdDate, currentDate)) {
        // Find out how many hours diff
        const diffTime = getDiffTime(createdDate, currentDate, 36e5);
        // Whole hours = floored(total time)
        const diffHours = Math.floor(diffTime)
        // Remaining decimals are how many minutes
        const diffMinutes = Math.floor((diffTime - diffHours) * 60);

        createTimeDom.innerText = 'Created ' + diffHours + ' hours and ' + diffMinutes + ' minutes ago';
    }
    else {
        // In the case where the created date > 24 hours
        // convert to DD/MM/YYYY
        createTimeDom.innerText = convertDateToCalendarString(createdDate)
    }
    
    StartTimeDom.innerText = 'Job starts at: ' + convertDateToCalendarString(startDate);
}

function isLessThan24HoursAgo(dateCreated, currentDate) {
    // Get current date timestamp
    const timeStamp = Math.round(currentDate.getTime() / 1000);

    // Yesterday's timestamp is today - 24 * 3600 seconds
    const timeStampYesterday = timeStamp - (24 * 3600);
    const yesterdayDate = new Date(timeStampYesterday * 1000);

    // Check if date created is after timestamp for yesterday
    const isWithin24HoursAfterYesterday = dateCreated >= yesterdayDate;

    return isWithin24HoursAfterYesterday;
}

function getDiffTime(createdDate, currentDate, unit) {
    return Math.abs(currentDate - createdDate) / unit;
}

function convertDateToCalendarString(date) {
    const yyyy = date.getFullYear();
    let mm = date.getMonth() + 1; // Months start at 0!
    let dd = date.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const calendarString = dd + '/' + mm + '/' + yyyy;

    return calendarString;
}



//////////////////
// MILESTONE 3
//////////////////


////////////////////////////
// MILESTONE 4
////////////////////////////

const userProfileImageWidth = '250px';
const userProfileImageHeight = '250px';

export function displayUserInfo(userProfileDom, userInfo) {
    const profileDom = document.createElement('div');
    profileDom.innerText = "PROFILE"
    profileDom.classList.add("large-header");
    userProfileDom.appendChild(profileDom);
    
    const userImageDom = document.createElement('img');
    if (userInfo.image) {
        userImageDom.src = userInfo.image;
        userImageDom.style.width = userProfileImageWidth;
        userImageDom.style.height = userProfileImageHeight;
        userProfileDom.appendChild(userImageDom);
    } else {
        const preSetImageDom = document.createElement('div');
        preSetImageDom.innerText = 'Waiting for your image';
        preSetImageDom.style.width = userProfileImageWidth;
        preSetImageDom.style.height = userProfileImageHeight;
        preSetImageDom.style.backgroundColor = "grey";
        userProfileDom.appendChild(preSetImageDom);
    }

    const userNameDom = document.createElement('div');
    userNameDom.innerText = "Username: " + userInfo.name;
    userNameDom.style.fontSize = "30px";
    userNameDom.style.fontWeight = "bold";
    userProfileDom.appendChild(userNameDom);

    const emailDom = document.createElement('div');
    emailDom.innerText = "Email: " + userInfo.email;
    emailDom.style.fontSize = "30px";
    emailDom.style.fontWeight = "bold";
    userProfileDom.appendChild(emailDom);

    const idDom = document.createElement('div');
    idDom.innerText = "UserID: " + userInfo.id;
    idDom.style.fontSize = "30px";
    idDom.style.fontWeight = "bold";
    userProfileDom.appendChild(idDom);

    // Enable update info if viewing own profile
    if (localStorage.getItem('userId') === userInfo.id.toString(10)) {
        const updateMyProfileButton = document.createElement('button');
        updateMyProfileButton.innerText = "Edit info"
        updateMyProfileButton.addEventListener('click', () => {
            navigateToEditProfile();
        })
        userProfileDom.appendChild(updateMyProfileButton);
    }
    // Otherwise, add "watch" button
    else {
        const followOtherButton = document.createElement('button');
        // 1. Check if following for text display
        var isWatching = false
        const currentUserId = localStorage.getItem('userId');
        for (const watcheeId of userInfo.watcheeUserIds) {
            if (watcheeId.toString(10) === currentUserId) {
                isWatching = true
            }
        }
        if (isWatching) {
            // 2. implement follow (via put)
            followOtherButton.innerText = "Unwatch"
            followOtherButton.addEventListener('click', () => {
                apiCall('PUT', '/user/watch', {
                    "email": userInfo.email,
                    "turnon": false,
                }, 
                ()=> {
                    // goToProfile(userInfo.id);
                    followOtherButton.innerText = "Watch"
                })
            })
        } else {
            // 2. implement follow (via put)
            followOtherButton.innerText = "Watch"
            followOtherButton.addEventListener('click', () => {
                apiCall('PUT', '/user/watch', {
                    "email": userInfo.email,
                    "turnon": true,
                }, 
                ()=> {
                    // goToProfile(userInfo.id);
                    followOtherButton.innerText = "Unwatch"
                })
            })
        }
        userProfileDom.appendChild(followOtherButton);
    }
}

export const navigateToEditProfile = () => {
    // Set input to empty string
    document.getElementById("profile-update-email").value = '';
    document.getElementById("profile-update-password").value = '';
    document.getElementById("profile-update-name").value = '';
    document.getElementById("profile-update-image").value = '';

    switchPage(["profile-items"], ["edit-profile"])
}

export function processImage(imageInput) {
    return new Promise((resolve, reject) => {
        fileToDataUrl(imageInput)
        .then((imageUrl) => {
            resolve(imageUrl);
        })
    });
};

////////////////////////////
// MILESTONE 5
////////////////////////////

export function isJobInfoValid(jobInfo) {
    if (jobInfo.title && !isValidString(jobInfo.title)) {
        alert("The title is invalid, please enter a proper title")
        return false;
    }
    if (jobInfo.start && !isValidDate(jobInfo.start)) {
        alert("The start date is invalid, please enter a proper start date")
        return false;
    } else if (jobInfo.start === '') {
        alert("You have not entered job start date, please enter a job start date")
        return false
    }
    if (jobInfo.description && !isValidString(jobInfo.description)) {
        alert("The description is invalid, please enter a proper description");
        return false;
    }
    return true;
}

export function isValidString(string) {
    if (string === '' || string === undefined || string === null) {
        return false;
    }
    return true;
}

function isValidDate(date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

/////////////////////////////////////////////
// MILESTONE 6
/////////////////////////////////////////////

// 2.6.3 Push Notifications
export const notifyUsers = (creatorId) => {
    apiCall('GET', '/user?userId='+creatorId, {}, (data => {
        if (!("Notification" in window)) {
          alert("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
          const notification = new Notification(data.name+" has posted a new job");
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().
          then((permission) => {
            if (permission === "granted") {
              const notification = new Notification(data.name+" has posted a new job");
            }
          });
        }
    }))
}


// Compares each element in the like lists
export function compareLike(list1, list2) {
    if (list1.length !== list2.length) {
        return true;
    }
    var found = 0; 
    for (const likeInfo1 of list1) {
        for (const likeInfo2 of list2) {
            if (likeInfo1.userId === likeInfo2.userId && likeInfo1.userEmail === likeInfo2.userEmail && likeInfo1.userName === likeInfo2.userName) {
                found++
            }
        }
    }
    if (found === list1.length) {
        return false
    }
    return true;
}

export function compareComment(list1, list2){
    if (list1.length !== list2.length) {
        return true;
    }
    var found = 0; 
    for (const commentInfo1 of list1) {
        for (const commentInfo2 of list2) {
            if (commentInfo1.userId === commentInfo2.userId && commentInfo1.comment === commentInfo2.comment) {
                found++
            }
        }
    }
    if (found === list1.length) {
        return false
    }
    return true;
}
