require([

    // esri requires
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/views/SceneView",
    "esri/WebScene",
    "esri/symbols/WebStyleSymbol",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/geometryEngine",

    // custom module
    "./js/modules/audioUtils.js"

], function(Graphic, GraphicsLayer, SceneView, WebScene, WebStyleSymbol, webMercatorUtils, geometryEngine, audioUtils) {

    var cameraFOV = 55
    const craneCoordinates = [947733.6382228889, 6008332.401697359];
    var graphicsLayer = new GraphicsLayer();

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
        var crane = audioUtils.createAudio('audio/crane.wav');
        setupPropertiesListener(view, "camera");

        function setupPropertiesListener(view, name) {
            view.watch(name, function(value) {
                // console.log(value.position.x, value.position.y, value.position.z)

                // NOTE, here is where I want to start adding in LEFT and RIGHT/3D sound... for now, manually changing volume based on distance.
                //sound.orientation(value.position.x, value.position.y, value.position.z)
                //sound.pos(craneCoordinates[0], craneCoordinates[1], value.position.z)


                var distance = getDistance([value.position.x, value.position.y, value.position.z], craneCoordinates)
                audioUtils.updateSoundVolume(distance, crane)
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