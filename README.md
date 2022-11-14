# Web-Audio-API-ArcGIS-prototype
Exploring creating 3D audio with a 3D map (WIP)

The idea for this application is to showcase 3D audio in 3D space. The ArcGIS platform has a lot of data that we can help harness to hopefully make the process of adding in audio clips easier. 

Stage 1.
Demo of a sample AudioLayer module.
Audio files hosted alongside the app.

let sampleAudioLayer = new AudioLayer.create({
    geojson: geojson, (array of polyline features)
    distance: 200, (in meters before sound plays)
    supportStereoAudio: true, (not implemented)
    movingObjects: [], (not implemented)
    camera: view.camera (trigger this on camera change)
});

view.watch("camera", function (cameraObject) {
    sampleAudioLayer.camera(cameraObject);
});

Stage 2.
Automate with another external API to get sound effects.

## Links 
Web Audio API documentation
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

Howler.js as an easier 3d audio api
https://github.com/goldfire/howler.js

ArcGIS API for JavaScript (3D)
https://developers.arcgis.com/javascript/latest/api-reference/

Sound API (Stage 2+)
https://freesound.org/help/developers/
