require([

    // esri requires
    "esri/Graphic",
    "esri/layers/FeatureLayer",
    "esri/views/SceneView",
    "esri/WebScene",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/geometryEngine",

    // custom module
    "./js/modules/audioUtils.js"

], function(Graphic, FeatureLayer, SceneView, WebScene, webMercatorUtils, geometryEngine, audioUtils) {
    let cameraFOV = 55;

    let arrayOfAudioNodes = [{
            coordinate: [1494250.8687, 6893332.5887],
            audio: audioUtils.createAudio('audio/crane.wav'),
            distance: 100
        },
        {
            coordinate: [1493174.243544884, 6893700.514951046],
            audio: audioUtils.createAudio('audio/boatEngine.wav'),
            distance: 75
        },

        {
            coordinate: [1493107.604696026, 6893709.391938755],
            audio: audioUtils.createAudio('audio/water.wav'),
            distance: 500
        },
        {
            coordinate: [1493920.2807606554, 6893570.898283289],
            audio: audioUtils.createAudio('audio/water.wav'),
            distance: 500
        },

        {
            coordinate: [1493325.5917520842, 6893439.523885197],
            audio: audioUtils.createAudio('audio/birds.wav'),
            distance: 500
        },
        {
            coordinate: [1493195.966101118, 6894130.348681002],
            audio: audioUtils.createAudio('audio/birds.wav'),
            distance: 500
        }, {
            coordinate: [1492951.6263078996, 6894975.189566879],
            audio: audioUtils.createAudio('audio/tramStation.wav'),
            distance: 400
        },
    ]

    // Adding buildings + initiating view.
    var view = new SceneView({
        map: new WebScene({
            portalItem: {
                id: "8ede93ea9d8d48bc8cdcbea775936a13"
            }
        }),
        container: "viewDiv",
        qualityProfile: "high"
    });

    const waterLayer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Water_bodies/FeatureServer",
        elevationInfo: {
            mode: "absolute-height",
            offset: 0
        },
        renderer: {
            type: "simple",
            symbol: {
                type: "polygon-3d",
                symbolLayers: [{
                    type: "water",
                    waveDirection: 260,
                    color: "#25427c",
                    waveStrength: "moderate",
                    waterbodySize: "medium"
                }]
            }
        }
    });

    view.map.add(waterLayer);

    // when view is created, then create our crane symbol.
    view.when(function() {
        view.environment.lighting.waterReflectionEnabled = true;
        cameraFOV = view.camera.fov // should be 55 - added this incase mobile/rotated device

        view.watch("camera", function(value) {
            arrayOfAudioNodes.forEach(function(soundNode) {
                // Distance based volume control
                // const distanceFromCamera = getDistance([value.position.x, value.position.y, value.position.z], soundNode.coordinate)
                // const loudNess = soundNode.distance // distance can be heard from object in meters
                // audioUtils.updateSoundVolume(distanceFromCamera, loudNess, audio);

                // 3D spatial audio control
                const audio = soundNode.audio
                audioUtils.ThreeDAudio(value, soundNode.coordinate, audio)
            });
        });
    });

    function getDistance(coodinatesA, coordinatesB) {
        // convert from xy to longlay
        var pointA = webMercatorUtils.xyToLngLat(coodinatesA[0], coodinatesA[1]);
        var pointB = webMercatorUtils.xyToLngLat(coordinatesB[0], coordinatesB[1]);

        // build graphic    
        var polylineGraphic = new Graphic({
            geometry: {
                type: "polyline", // autocasts as new Polyline()
                paths: [
                    [pointA[0], pointA[1], 700],
                    [pointB[0], pointB[1], 700],
                ]
            },
            symbol: null
        });


        // return the length
        return Math.round(geometryEngine.geodesicLength(polylineGraphic.geometry, "meters"));
    }
})