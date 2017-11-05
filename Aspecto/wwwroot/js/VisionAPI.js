var API_KEY = "8eb644e5c7e845bdb3b77f5e5119364e";
var DEBUG = true;

/**
 * Methods for analysis and tracking of students
 */

function analyzeFaces(imageURI, callback) {
    var baseApiURL = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?";
    var params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
    };

    $.ajax({
        url: baseApiURL + $.param(params),
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", API_KEY);
        },
        type: "POST",
        processData: false,
        data: makeBlob(imageURI)
    })
        .done(function (data) {
            if (DEBUG) console.log("Face analysis returned " + data.length + " people.");
            callback(data);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (DEBUG) console.log("Face analysis failed: " + textStatus);
            callback([]);
        });
}

function identifyFaces(groupId, faceIdList, callback) {
    var baseApiURL = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/identify?";
    var params = {};
    var body = {
        "personGroupId": groupId,
        "faceIds": faceIdList,
        "maxNumOfCandidatesReturned": 1,
        "confidenceThreshold": 0.50,
    };

    $.ajax({
        url: baseApiURL + $.param(params),
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", API_KEY);
        },
        type: "POST",
        data: JSON.stringify(body)
    })
        .done(function (data) {
            if (DEBUG) console.log("Face identification succeeded for " + faceIdList.length + " people.");
            callback(data);
        })
        .fail(function () {
            if (DEBUG) console.log("Face identification failed for " + faceIdList.length + " people.");
            callback([]);
        });
}

/**
 * Methods for creating and updating classes.
 */

/**
 * Create Group
 * Callback data: groupId
 **/
function newGroup(groupId, groupName, callback) {
    var baseApiURL = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
    var params = {};

    var body = {
        "name": groupName,
        "userData": "None"
    };
    $.ajax({
        url: baseApiURL + groupId + $.param(params),
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", API_KEY);
        },
        type: "PUT",
        data: JSON.stringify(body)
    })
        .done(function (data) {
            if (DEBUG) console.log("Successfully created group " + groupName + " with id " + groupId);
            callback(groupId);
        })
        .fail(function () {
            if (DEBUG) console.log("Failed to create group " + groupName + " with id " + groupId);
            callback(null);
        });
}

/**
 * Add Person
 * Callback data: personId
 **/
function addPerson(groupId, personName, callback) {
    var baseApiURL = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
    var params = {};
    var body = {
        "name": personName,
        "userData": "None",
    };

    $.ajax({
        url: baseApiURL + groupId + "/persons?" + $.param(params),
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", API_KEY);
        },
        type: "POST",
        data: JSON.stringify(body)
    })
        .done(function (data) {
            if (DEBUG) console.log("Successfully added person " + personName + " with id " + data["personId"] + " to group " + groupId);
            callback(data["personId"]);
        })
        .fail(function () {
            if (DEBUG) console.log("Failed to add person " + personName + " to group " + groupId);
            callback(null);
        });
}

/**
 * Add Face
 * Callback data: persistedFaceId
 **/
function addFace(groupId, personId, imageURI, callback) {
    var baseApiURL = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
    var params = {};

    $.ajax({
        url: baseApiURL + groupId + "/persons/" + personId + "/persistedFaces?" + $.param(params),
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", API_KEY);
        },
        type: "POST",
        data: makeBlob(imageURI),
        processData: false
    })
        .done(function (data) {
            if (DEBUG) console.log("Successfully added face with persistent id " + data["persistedFaceId"] + " to person " + personId + " in group " + groupId);
            callback(data["persistedFaceId"]);
        })
        .fail(function () {
            if (DEBUG) console.log("Failed adding face to person " + personId + " in group " + groupId);
            callback(null);
        });
}

/**
 * Train Group
 * Callback data: groupId
 **/
function trainGroup(groupId, callback) {
    var baseApiURL = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
    var params = {};
    var body = {};

    $.ajax({
        url: baseApiURL + groupId + "/train?" + $.param(params),
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", API_KEY);
        },
        type: "POST",
        data: JSON.stringify(body)
    })
        .done(function (data) {
            if (DEBUG) console.log("Successfully trained group " + groupId);
            callback(groupId);
        })
        .fail(function () {
            if (DEBUG) console.log("Failed to train group " + groupId);
            callback(null);
        });
}


function makeBlob(dataURI) {
    var BASE64_MARKER = ';base64,';
    if (dataURI.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURI.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);
        return new Blob([raw], { type: contentType });
    }
    var parts = dataURI.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}