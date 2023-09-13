/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

import { BACKEND_PORT } from './config.js';
const url = 'http://localhost:'+BACKEND_PORT

export const apiCall = (method, path, payload, success) => {
    const options = {
        method: method,
        headers: {
            'Content-type': 'application/json',
        },
    }
    if (method === 'GET') {
        // path = 
    } else {
        options.body = JSON.stringify(payload);
    }
    if (localStorage.getItem('token')) {
        options.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    }

    fetch(url + path, options)
        .then((response) => {
            response.json()
                .then((data) => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        if (success) {
                            success(data);
                        }
                    }
                })
        });
}
// const getUsers = new Promise((resolve, reject) => {
//     fetch(url+"/user")
//         .then((res) => res.json())
//         .then((userIds) => {
//             Promise.all(
//                 userIds.map((userId) =>
//                     fetch(`http://localhost:3000/user/${userId}`).then((res) =>
//                         res.json()
//                 )
//             )
//         ).then((users) => resolve(users));
//     });
// });
