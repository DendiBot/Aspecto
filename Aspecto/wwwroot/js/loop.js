function getRealtime(groupId, callback) {
    takeSnapshot(function (imageData) {
        analyzeFaces(imageData, function (faceData) {
            var emotions = ["happiness", "sadness", "contempt", "anger", "neutral"];
            var data = {};
            $.map(faceData, function (face) {
                var fa = face.faceAttributes;
                $.map(emotions, function (emotion) {
                    if (!data[emotion]) data[emotion] = 0;
                    data[emotion] += fa.emotion[emotion];
                })
            });

            var detectedIds = $.map(faceData, function (face) { return face.faceId; });
            console.log("Detected IDs: " + detectedIds);

            if (faceData.length != 0) {
                //Match these face IDs to people in the group
                identifyFaces(groupId, detectedIds, function (faceMatches) {
                    $.map(faceMatches, function (face, i) {
                        //Were there any matching candidates
                        if (face.candidates.length > 0) {
                            //If so, grab their person id
                            var personId = face.candidates[0].personId;
                            console.log("Match: " + personId);
                        }
                        else {
                            console.log("No Matches");
                            addPerson(groupId, "TempName", function (personData) {
                                addFace(groupId, personData, imageData, function () { });
                            });
                            trainGroup(groupId, function () { });
                        }
                    });
                    callback(data);
                })
            }
            else {
                console.log("No Faces Detected");
            }
        });
    });
}

$(function () {
    webcamInit("webcamStream", function () { })
})