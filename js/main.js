require([
    "esri/Graphic",
    "esri/views/SceneView",
    "esri/WebScene",
    "esri/symbols/WebStyleSymbol"

], function(Graphic, SceneView, WebScene, WebStyleSymbol) {

    var cameraFOV = 55

    // Adding buildings + initiating view.
    var view = new SceneView({
        map: new WebScene({
            portalItem: {
                id: "167f8a547ded4171abb2480a30022303"
            }
        }),
        container: "viewDiv"
    });

    // when view is created, then create our crane symbol.
    view.when(function() {
        const craneCoordinates = [947733.6382228889, 6008332.401697359];
        createCraneGraphic(craneCoordinates);

        cameraFOV = view.camera.fov // should be 55 - added this incase mobile/rotated device
        setupCameraListeners()
    });

    // creating crane object - [x,y]
    function createCraneGraphic(craneCoordinates) {
        var craneSymbol = new WebStyleSymbol({
            styleName: "EsriRealisticTransportationStyle",
            name: "Tower_Crane"
        });

        craneSymbol.fetchSymbol().then(function(pointSymbol3D) {
            view.graphics.add(new Graphic({
                geometry: {
                    x: craneCoordinates[0],
                    y: craneCoordinates[1],
                    type: "point",
                    spatialReference: view.spatialReference
                },
                symbol: pointSymbol3D
            }));
        });
    };

    // setup listeners
    function setupCameraListeners() {

        setupPropertiesListener(view, "camera");

        // returns full camera object
        function setupPropertiesListener(view, name) {
            view.watch(name, function(value) {
                console.log(value)
            });
        }
    }

    // Detect if the audio context is supported.
    window.AudioContext = (
        window.AudioContext ||
        window.webkitAudioContext ||
        null
    );

    if (!AudioContext) {
        throw new Error("AudioContext not supported!");
    }

    // Create a new audio context.
    var ctx = new AudioContext();
    setTimeout(function() {

        // Create a AudioGainNode to control the main volume.
        var mainVolume = ctx.createGain();
        // Connect the main volume node to the context destination.
        mainVolume.connect(ctx.destination);

        // Create an object with a sound source and a volume control.
        var sound = {};
        sound.source = ctx.createBufferSource();
        sound.volume = ctx.createGain();

        // Connect the sound source to the volume control.
        sound.source.connect(sound.volume);
        // Hook up the sound volume control to the main volume.
        sound.volume.connect(mainVolume);

        // Make the sound source loop.
        sound.source.loop = true;

        // Load a sound file using an ArrayBuffer XMLHttpRequest.
        var request = new XMLHttpRequest();
        request.open("GET", "audio/crane.wav", true);
        request.responseType = "arraybuffer";
        request.onload = function(e) {

            // Create a buffer from the response ArrayBuffer.
            ctx.decodeAudioData(this.response, function onSuccess(buffer) {
                sound.buffer = buffer;

                // Make the sound source use the buffer and start playing it.
                sound.source.buffer = sound.buffer;
                sound.source.start(ctx.currentTime);
            }, function onFailure() {
                alert("Decoding the audio buffer failed");
            });
        };
        request.send();
    }, 3000);
})