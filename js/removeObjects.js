/* objects recycle */

function clearOldCubesAndText(){
  /* remove the cubes already in the scene */
  for (var i = 0; i < cubes.length; i++){
    scene.remove( cubeTxt[i] );
    cubeTxt[i].geometry.dispose();
    scene.remove( cubes[i] );
    cubes[i].material.dispose();
    cubes[i].material.map.dispose();
    cubes[i].geometry.dispose();
  }

  // empty the array
  cubeTxt = [];
  cubes = [];
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
