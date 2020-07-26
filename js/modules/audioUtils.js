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

        function updateSoundVolume(distanceInMeters, sound) {
            if (distanceInMeters > 1000) {
                sound.volume(0)
            } else {
                sound.volume((1000 - distanceInMeters) / 1000)
            }
        }
        //Stuff to make public
        return {
            createAudio: createAudio,
            updateSoundVolume: updateSoundVolume
        };

    })