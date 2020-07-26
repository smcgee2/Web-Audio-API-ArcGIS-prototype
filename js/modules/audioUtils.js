define([

        // external require (howler.js)
        "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.js"
    ],
    function(howler) {


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
            createAudio: createAudio,
            updateSoundVolume: updateSoundVolume
        };

    })