require([
    // esri requires
    "esri/layers/FeatureLayer",
    "esri/layers/GeoJSONLayer",
    "esri/views/SceneView",
    "esri/WebScene",
    "esri/rest/support/Query",

    // custom module
    "./js/modules/AudioLayer.js"

], function (FeatureLayer, GeoJSONLayer, SceneView, WebScene, Query, AudioLayer) {
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

    // when view is created
    view.when(function () {
        // Add water layer to the map
        view.map.add(waterLayer);

        view.environment.lighting.waterReflectionEnabled = true;

        // Get GeoJSON Layer
        const geojsonLayer = new GeoJSONLayer({
            url: "./data.json",
            copyright: "Please see ./audio/readme.txt"
        });

        // Get all features (including geometry), with the outfield name (same as audio file name)
        const query = new Query({
            where: "1=1",
            returnGeometry: true,
            outFields: ["name"]
        });

        geojsonLayer.queryFeatures(query).then(function (geojson) {
            let sampleAudioLayer = new AudioLayer.create({
                geojson: geojson,
                distance: 200,
                supportStereoAudio: true,
                movingObjects: [],
                camera: view.camera
            });

            view.watch("camera", function (cameraObject) {
                sampleAudioLayer.camera(cameraObject);
            });
        });
    });
});