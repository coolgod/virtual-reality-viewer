/* objects recycle */

function clearOldCubesAndText(){
  /* remove the cubes already in the scene */
  for (var i = 0; i < cubeArray.length; i++){
    scene.remove( cubeTextArray[i] );
    cubeTextArray[i].geometry.dispose();
    scene.remove( cubeArray[i] );
    cubeArray[i].material.dispose();
    cubeArray[i].material.map.dispose();
    cubeArray[i].geometry.dispose();
  }

  // empty the array
  cubeTextArray = [];
  cubeArray = [];
}

function clearAudio ( lastSkyboxIdx ) {
  var audio_path = skybox_imgs[lastSkyboxIdx].bg_audio;
  if(audio_path != ""){
    if(audios[audio_path] != null && audios[audio_path] != false){
      audios[audio_path].stop();
      audios[audio_path] = false;
    }
  }
}

function clearIntroText() {
  if(introText != null) {
    scene.remove( introText );
    introText.geometry.dispose();
  }
}