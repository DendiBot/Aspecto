var DEBUG = true;

function webcamInit(webcamDivId, callback) {
  Webcam.attach("#" + webcamDivId);
  Webcam.on("live", function() {
    if (DEBUG) {
      console.log("Successfully attached webcam to div " + webcamDivId);
    }
    callback();
  });

}

function takeSnapshot(callback) {
  Webcam.snap(function(imageData) {
    if (DEBUG) {
      console.log("Successfully snapped image.");
    }
    callback(imageData);
  });
}
