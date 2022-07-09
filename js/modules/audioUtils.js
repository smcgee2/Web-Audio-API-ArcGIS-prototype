define([

        // external require (howler.js)
        "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.js"
    ],
    function(howler) {

        function ThreeDAudio(cameraPosition, audioNodePosition, sound) {
            sound.orientation(cameraPosition.position.x, cameraPosition.position.y, 0)
            sound.pos((audioNodePosition[0] - cameraPosition.position.x) / 10, (audioNodePosition[1] - cameraPosition.position.y) / 10, 0)
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
                sound.volume(0)
            } else {
                sound.volume((mixDist - distanceInMeters) / mixDist)
            }
        }

        //Stuff to make public
        return {
            ThreeDAudio: ThreeDAudio,
            createAudio: createAudio,
            updateSoundVolume: updateSoundVolume
        };

    })