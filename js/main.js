require([

    // esri requires
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    "esri/views/SceneView",
    "esri/WebScene",
    "esri/symbols/WebStyleSymbol",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/geometryEngine",

    // custom module
    "./js/modules/audioUtils.js"

], function(Graphic, GraphicsLayer, FeatureLayer, SceneView, WebScene, WebStyleSymbol, webMercatorUtils, geometryEngine, audioUtils) {
    let cameraFOV = 55;

    var arrayOfAudioNodes = [{
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


    const tempCalculationsGL = new GraphicsLayer();

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
        setupCameraListeners();
    });

    // setup listeners
    function setupCameraListeners() {
        view.watch("camera", function(value) {
            //console.log(value.position.x, value.position.y, value.position.z)

            // NOTE, here is where I want to start adding in LEFT and RIGHT/3D sound... for now, manually changing volume based on distance.
            //sound.orientation(value.position.x, value.position.y, value.position.z)
            //sound.pos(craneCoordinates[0], craneCoordinates[1], value.position.z)

            for (soundNode = 0; soundNode < arrayOfAudioNodes.length; soundNode++) {
                const distanceFromCamera = getDistance([value.position.x, value.position.y, value.position.z], arrayOfAudioNodes[soundNode].coordinate)
                const loudNess = arrayOfAudioNodes[soundNode].distance // distance can be heard from object in meters
                const audio = arrayOfAudioNodes[soundNode].audio
                audioUtils.updateSoundVolume(distanceFromCamera, loudNess, audio)
            };
        });
    }


    function getDistance(a, b) {
        tempCalculationsGL.removeAll();

        // convert from xy to longlay
        var pointA = webMercatorUtils.xyToLngLat(a[0], a[1]);
        var pointB = webMercatorUtils.xyToLngLat(b[0], b[1]);

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

        // add graphic to layer
        tempCalculationsGL.add(polylineGraphic);

        // return the length
        return Math.round(geometryEngine.geodesicLength(polylineGraphic.geometry, "meters"));
    }
})