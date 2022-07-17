require([
    // esri requires
    "esri/layers/FeatureLayer",
    "esri/views/SceneView",
    "esri/WebScene",

    "esri/Graphic",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/geometryEngine",

    // custom module
    "./js/modules/audioUtils.js",
    "./js/modules/getSoundNodes.js"

], function(FeatureLayer, SceneView, WebScene, Graphic, webMercatorUtils, geometryEngine, audioUtils, getSoundNodes) {
    // Example format for audio code

    let arrayOfAudioNodes = [{
        coordinate: [1493174.243544884, 6893700.514951046],
        audio: audioUtils.createAudio('audio/boatEngine.mp3'),
    }];

    getSoundNodes.getData().then(function(results) {

        // Yes, there's a nicer way of doing below.
        // Future Sean - please refactor this.
        for (i = 0; i < results.birds.coordinates.length; i++) {
            arrayOfAudioNodes.push({
                coordinate: results.birds.coordinates[i],
                audio: audioUtils.createAudio('audio/birds.mp3')
            })
        }

        for (i = 0; i < results.water.coordinates.length; i++) {
            arrayOfAudioNodes.push({
                coordinate: results.water.coordinates[i],
                audio: audioUtils.createAudio('audio/water.mp3')
            })
        }

        for (i = 0; i < results.train.coordinates.length; i++) {
            arrayOfAudioNodes.push({
                coordinate: results.train.coordinates[i],
                audio: audioUtils.createAudio('audio/tramStation.mp3')
            })
        }

        for (i = 0; i < results.road.coordinates.length; i++) {
            arrayOfAudioNodes.push({
                coordinate: results.road.coordinates[i],
                audio: audioUtils.createAudio('audio/road.mp3')
            })
        }

        audioNodesLoaded = true
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

    // Adding buildings + initiating view.
    let view = new SceneView({
        map: new WebScene({
            portalItem: {
                id: "8ede93ea9d8d48bc8cdcbea775936a13"
            }
        }),
        container: "viewDiv",
        qualityProfile: "high"
    });

    // Adding realistic water
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

    // Add water layer to the map
    view.map.add(waterLayer);

    // when view is created
    view.when(function() {
        view.environment.lighting.waterReflectionEnabled = true;

        view.watch("camera", function(cameraNode) {
            arrayOfAudioNodes.forEach(function(soundNode) {
                const distanceFromCamera = getDistance([cameraNode.position.x, cameraNode.position.y, cameraNode.position.z], soundNode.coordinate)

                // 3D spatial audio control
                if (distanceFromCamera < 200) {
                    audioUtils.ThreeDAudio(cameraNode, soundNode.coordinate, soundNode.audio)
                } else {
                    audioUtils.muteClip(soundNode.audio)
                }
            });
        });

        // Click to slowly zoom to...
        view.on("click", function(e) {
            view.goTo(e.mapPoint, {
                duration: 10000,
                maxDuration: 10000
            })
        })
    });
})