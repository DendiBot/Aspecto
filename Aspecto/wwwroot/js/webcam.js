var GROUP_ID = "hospital-patients"
var recording = true;
var totalEmotions = [
    ["Anger", 0],
    ["Contempt", 0],
    ["Happiness", 0],
    ["Neutral", 0],
    ["Sadness", 0],
];

function requestData() {
    //Recording
    getRealtime(GROUP_ID, function(data) {
        console.log(data);
        var emotions = [
            ["Anger", data.anger],
            ["Contempt", data.contempt],
            ["Happiness", data.happiness],
            ["Neutral", data.neutral],
            ["Sadness", data.sadness],
        ];

        totalEmotions[0][1] += data.anger;
        totalEmotions[1][1] += data.contempt;
        totalEmotions[2][1] += data.happiness;
        totalEmotions[3][1] += data.neutral;
        totalEmotions[4][1] += data.sadness;

        console.log("Total Emotions: " + totalEmotions)
    })
}

function getTotalEmotions() {
    return totalEmotions;
}


$(function() {
    var video = document.querySelector("#webcamStream");
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({ video: true }, handleVideo, videoError);
    }


    function handleVideo(stream) {
        video.src = window.URL.createObjectURL(stream);
    }

    function videoError(e) {}
});
