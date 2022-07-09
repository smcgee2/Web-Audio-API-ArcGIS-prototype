define([

        // external require (howler.js)
        "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.js"
    ],
    function(howler) {

        // Wind noise as you move****

        function rotate(cx, cy, x, y, angle) {
            var radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
                ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
            return [nx, ny];
        }


        /**
         * Note: We're currently not using Z axis here at the moment.
         * 
         * @param {*} cameraPosition camera coords
         * @param {*} audioNodePosition point coords
         * @param {*} sound This is a sound created using createAudio function below.
         */
        function ThreeDAudio(cameraPosition, audioNodePosition, sound) {
            const localReprojection = rotate(0, 0, (audioNodePosition[0] - cameraPosition.position.x) / 10, (audioNodePosition[1] - cameraPosition.position.y) / 10, 360 - cameraPosition.heading)
            sound.orientation(cameraPosition.position.x, cameraPosition.position.y, 0);
            sound.pos(localReprojection[0], localReprojection[1], 0);
        }

        function createAudio(source) {
            return new howler.Howl({
                src: [source],
                autoplay: true,
                loop: true,
                plannerAttr: {
                    panningModel: 'HRTF'
                }
            });
        }

        function updateSoundVolume(distanceInMeters, mixDist, sound) {
            if (distanceInMeters > mixDist) {
                sound.volume(0);
            } else {
                sound.volume((mixDist - distanceInMeters) / mixDist);
            }
        }

        //Stuff to make public
        return {
            ThreeDAudio: ThreeDAudio,
            createAudio: createAudio,
            updateSoundVolume: updateSoundVolume
        };

    })