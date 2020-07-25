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
})