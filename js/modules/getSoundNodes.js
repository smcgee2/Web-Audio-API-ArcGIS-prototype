define([
        "esri/layers/FeatureLayer",
        "esri/rest/support/Query",
        "esri/geometry/geometryEngine",
        "esri/Graphic",

        "dojo/Deferred"
    ],
    function(FeatureLayer, Query, geometryEngine, Graphic, Deferred) {

        const soundResolution = 200

        function convertLineToArrayOfXYPoints(paths, callback) {
            let finalArray = [];

            for (ii = 0; ii < paths.paths[0].length; ii++) {
                finalArray.push(paths.paths[0][ii]);

                if (ii === paths.paths[0].length - 1) {
                    console.logfinalArray
                    callback(finalArray)
                }
            };
        }

        function returnAsPoints(path, callback) {
            // build graphic    
            var polylineGraphic = new Graphic({
                geometry: {
                    type: "polyline", // autocasts as new Polyline()
                    paths: path,
                    spatialReference: {
                        "wkid": 102100
                    }
                },
                symbol: null
            });

            const newLine = geometryEngine.densify(polylineGraphic.geometry, soundResolution, "meters");
            convertLineToArrayOfXYPoints(newLine, function(data) {
                callback(data);
            })
        }


        function getData(callback) {
            var deferred = new Deferred();

            // Point Service
            // const soundFeatureLayer = new FeatureLayer({
            //     url: "https://services6.arcgis.com/RLeqTtnDOX3d9I1F/ArcGIS/rest/services/Sound_Layer_view/FeatureServer/0"
            // })

            const soundFeatureLayerLine = new FeatureLayer({
                url: "https://services6.arcgis.com/RLeqTtnDOX3d9I1F/ArcGIS/rest/services/Sound_Layer_(Line)_view/FeatureServer/0"
            })

            // Line Service

            const query = new Query();
            query.where = "1=1";
            query.returnGeometry = true;
            query.outFields = ["name"];

            soundFeatureLayerLine.queryFeatures(query).then(function(results) {
                // prints the array of result graphics to the console
                var paths = [];

                // List of valid sound effects defined here
                var obj = {}

                for (i = 0; i < results.features.length; i++) {
                    returnAsPoints(results.features[i].geometry.paths[0], function(data) {

                        if (obj[results.features[i].attributes.name]) {
                            obj[results.features[i].attributes.name].coordinates = obj[results.features[i].attributes.name].coordinates.concat(data);
                        } else {
                            // TBC if we should do this?
                            obj[results.features[i].attributes.name] = {
                                coordinates: data
                            }
                        }

                        if (i === results.features.length - 1) {
                            deferred.resolve(obj);
                        }
                    })
                }
            });

            return deferred.promise;
        }

        //Stuff to make public
        return {
            getData: getData
        };
    })