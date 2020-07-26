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

    var cameraFOV = 55
    const craneCoordinates = [1494250.8687, 6893332.5887];
    const boatEngine = [1493174.243544884, 6893700.514951046];
    const waterA = [1493107.604696026, 6893709.391938755];
    const waterB = [1493920.2807606554, 6893570.898283289];
    const birdsA = [1493325.5917520842, 6893439.523885197];
    const birdsB = [1493195.966101118, 6894130.348681002];
    const tramStation = [1492951.6263078996, 6894975.189566879];

    var graphicsLayer = new GraphicsLayer();

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
        createCraneGraphic(craneCoordinates); //manual showcase of webstyle symbol creation with audio

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
        // define audio/sound files here.
        var crane = audioUtils.createAudio('audio/crane.wav');
        var water = audioUtils.createAudio('audio/water.wav');
        var birds = audioUtils.createAudio('audio/birds.wav');
        var boatEngineSound = audioUtils.createAudio('audio/boatEngine.wav');
        var tramSound = audioUtils.createAudio('audio/tramStation.wav');

        setupPropertiesListener(view, "camera");

        function setupPropertiesListener(view, name) {
            view.watch(name, function(value) {
                //console.log(value.position.x, value.position.y, value.position.z)

                // NOTE, here is where I want to start adding in LEFT and RIGHT/3D sound... for now, manually changing volume based on distance.
                //sound.orientation(value.position.x, value.position.y, value.position.z)
                //sound.pos(craneCoordinates[0], craneCoordinates[1], value.position.z)

                // get the distnace + update the volume for each sound node
                var distance = getDistance([value.position.x, value.position.y, value.position.z], craneCoordinates)
                audioUtils.updateSoundVolume(distance, 1000, crane)

                var distanceWater = getDistance([value.position.x, value.position.y, value.position.z], waterA)
                audioUtils.updateSoundVolume(distanceWater, 500, water)

                var distanceWaterB = getDistance([value.position.x, value.position.y, value.position.z], waterB)
                audioUtils.updateSoundVolume(distanceWaterB, 500, water)

                var distanceBirds = getDistance([value.position.x, value.position.y, value.position.z], birdsA)
                audioUtils.updateSoundVolume(distanceBirds, 500, birds)

                var distanceBirdsB = getDistance([value.position.x, value.position.y, value.position.z], birdsB)
                audioUtils.updateSoundVolume(distanceWaterB, 500, birds)

                var distanceBoat = getDistance([value.position.x, value.position.y, value.position.z], boatEngine)
                audioUtils.updateSoundVolume(distanceBoat, 200, boatEngineSound)

                var tramStationDistance = getDistance([value.position.x, value.position.y, value.position.z], tramStation)
                audioUtils.updateSoundVolume(tramStationDistance, 400, tramSound)

            });
        }
    }


    function getDistance(a, b) {
        graphicsLayer.removeAll();

        // convert from xy to longlay
        var pointA = webMercatorUtils.xyToLngLat(a[0], a[1]);
        var pointB = webMercatorUtils.xyToLngLat(b[0], b[1]);

        // create geometry
        var polyline = {
            type: "polyline", // autocasts as new Polyline()
            paths: [
                [pointA[0], pointA[1], 700],
                [pointB[0], pointB[1], 700],
            ]
        };

        // build graphic
        var polylineGraphic = new Graphic({
            geometry: polyline,
            symbol: null
        });

        // add graphic to layer
        graphicsLayer.add(polylineGraphic);

        // return the length
        return geometryEngine.geodesicLength(polylineGraphic.geometry, "meters")
    }
})