define([
    "esri/geometry/geometryEngine",
    "esri/Graphic",

    // external require (howler.js)
    "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.2/howler.js"
],
    function (geometryEngine, Graphic, howler) {
        const soundResolution = 10; // meters

        /**
         * 
         * @param {*} cameraObject 
         * Required:
         * heading
         * position.x
         * position.y
         * position.z
         * position.longitude
         * position.latitude
         * @returns boolean
         */
        function isCameraObjectValid(cameraObject) {
            if (cameraObject.heading == undefined) {
                return false;
            }

            if (cameraObject.position == undefined) {
                return false;
            }

            if (cameraObject.position.x == undefined) {
                return false;
            }

            if (cameraObject.position.y == undefined) {
                return false;
            }

            if (cameraObject.position.z == undefined) {
                return false;
            }

            if (cameraObject.position.latitude == undefined) {
                return false;
            }

            if (cameraObject.position.longitude == undefined) {
                return false;
            }

            return true;
        }

        /**
         * Converts a polyline to an array of points (split by distance) const
         * @param {*} polyline 
         * @returns array of points
         */
        function splitPolylineIntoPoints(polylinePath, name) {
            const polylineGraphic = new Graphic({
                geometry: {
                    type: "polyline", // autocasts as new Polyline()
                    paths: polylinePath,
                    spatialReference: {
                        "wkid": 102100
                    }
                },
                symbol: null
            });

            const newLine = geometryEngine.densify(polylineGraphic.geometry, soundResolution, "meters");
            const newLinePaths = newLine.paths[0];

            let finalArray = [];

            for (ii = 0; ii < newLinePaths.length; ii++) {
                finalArray.push(newLinePaths[ii]);

                if (ii === newLinePaths.length - 1) {
                    return {
                        "coordinates": finalArray,
                        "name": name
                    }
                }
            };
        }

        /**
         * If a given point falls within a given polygon
         * This is used to see if the camera is within the polygon.
         * @param {*} point 
         * @param {*} polygon 
         * @returns boolean
         */
        function pointFallsWithinPolygon(point, polygon) {

        }

        /**
         * Split polygon into a polyline 
         * @param {*} polygon 
         * @returns polyline 
         */
        function splitPolygonIntoPolyline(polygon) {

        }


        function getDistance(coodinatesA, coordinatesB) {
            // build graphic    
            const polylineGraphic = new Graphic({
                geometry: {
                    type: "polyline", // autocasts as new Polyline()
                    paths: [
                        [coodinatesA[0], coodinatesA[1], 700],
                        [coordinatesB[0], coordinatesB[1], 700],
                    ]
                },
                symbol: null
            });

            // return the length
            return Math.round(geometryEngine.geodesicLength(polylineGraphic.geometry, "meters"));
        }


        function localReprojection(cx, cy, x, y, angle) {
            let radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
                ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
            return [nx, ny];
        }

        /**
         * 
         * @param {*} camera camera object
         * @param {*} distance before audio starts playing
         * @param {*} geojson array of features
         * @returns array of points that should be played
         */
        function playAudioByDistance(camera, audioNodes, distance) {
            const cameraCoords = [camera.position.longitude, camera.position.latitude];

            const possibleAudioToPlayCoordinates = audioNodes;

            for (let coordinates = 0; coordinates < possibleAudioToPlayCoordinates.length; coordinates++) {
                const distanceBetweenPoints = getDistance(cameraCoords, possibleAudioToPlayCoordinates[coordinates].coordinates);

                if (distanceBetweenPoints < distance) {
                    const localReprojectionCoords = localReprojection(0, 0, (possibleAudioToPlayCoordinates[coordinates].coordinates[0] - camera.position.longitude), (possibleAudioToPlayCoordinates[coordinates].coordinates[1] - camera.position.latitude), 360 - camera.heading);

                    ThreeDAudio(localReprojectionCoords, cameraCoords, possibleAudioToPlayCoordinates[coordinates].sound);
                    updateSoundVolume(distanceBetweenPoints, distance, possibleAudioToPlayCoordinates[coordinates].sound);
                } else {
                    muteClip(possibleAudioToPlayCoordinates[coordinates].sound);
                }
            }
        }

        function listen(cameraObject, audioNodes, distance) {
            playAudioByDistance(cameraObject, audioNodes, distance);
        }

        // HOWLER JS RELATED FUNCTIONS
        /**
          * Note: We're currently not using Z axis here at the moment.
          * 
          * @param {*} cameraPosition camera coords
          * @param {*} audioNodePosition point coords
          * @param {*} sound This is a sound created using createAudio function below.
          */
        function ThreeDAudio(localReprojection, cameraCoords, sound) {
            unmuteClip(sound);
            sound.orientation(cameraCoords[0], cameraCoords[1], 0);
            sound.pos(localReprojection[0], localReprojection[1], 0);
        }

        function createAudio(source) {
            return new howler.Howl({
                src: [source],
                autoplay: true,
                loop: true,
                volume: 0,
                plannerAttr: {
                    panningModel: 'HRTF'
                }
            });
        }

        function updateSoundVolume(distanceInMeters, maxDist, sound) {
            if (distanceInMeters > maxDist) {
                muteClip(sound);
            } else {
                sound.volume((maxDist - distanceInMeters) / maxDist);
            }
        }

        function muteClip(sound) {
            sound.volume(0);
        }

        function unmuteClip(sound) {
            sound.volume(1);
        }

        return {
            create: class AudioLayer {
                constructor(object) {
                    this.object = object;
                    this.geometry = object.geojson.features;
                    this.distance = object.distance;

                    let arrayOfNodes = [];

                    for (let feature = 0; feature < object.geojson.features.length; feature++) {
                        const geometry = object.geojson.features[feature].geometry
                        const geometryType = geometry.type;
                        const nameAttrbiute = object.geojson.features[feature].attributes.name;

                        switch (geometryType) {
                            case "polyline":
                                const getPoints = splitPolylineIntoPoints(geometry.paths, nameAttrbiute);
                                const soundFileName = getPoints.name + ".mp3";

                                for (let featureCoords = 0; featureCoords < getPoints.coordinates.length; featureCoords++) {
                                    arrayOfNodes.push({ "coordinates": getPoints.coordinates[featureCoords], "sound": createAudio('audio/' + soundFileName) })
                                }
                                break;
                            default:
                                break;
                        }

                        if (feature === object.geojson.features.length - 1) {
                            // Sean adding manual boat engine via point.
                            arrayOfNodes.push({
                                "coordinates": [13.413500399967207, 52.514536519806214],
                                "sound": createAudio('audio/boatEngine.mp3')
                            })

                            this.audioNodes = arrayOfNodes;
                        }
                    }

                    if (object.camera != undefined) {
                        if (isCameraObjectValid(object.camera)) {
                            this.updateCameraObject(object.camera);
                        }
                    }
                }

                updateCameraObject(cameraObject) {
                    this.cameraObject = cameraObject;
                    listen(this.cameraObject, this.audioNodes, this.distance);
                }

                camera(cameraObject) {
                    if (isCameraObjectValid(cameraObject)) {
                        this.updateCameraObject(cameraObject);
                    }
                }

                isReady() {
                    return true
                }
            }
        };
    });