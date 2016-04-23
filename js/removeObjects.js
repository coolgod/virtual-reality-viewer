/* objects recycle */

function clearAll( prev_skybox_index ){
  clearRing();
  clearOldCubesAndText();
  clearAudio( prev_skybox_index );
}

function clearOldCubesAndText(){
  /* remove the cubes already in the scene */
  for (var i = 0; i < cubeArray.length; i++){
    scene.remove( cubeTextArray[i] );
    //cubeTextArray[i].material.dispose();
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

function clearRing () {
  if(ring != null){
    top_scene.remove(ring);
    ring.geometry.dispose();
    ring.material.dispose();
    ring = null;
  }
}

function clearAudio ( prev_skybox_index ) {
  var audio_path = skybox_imgs[prev_skybox_index].bg_audio;
  // console.log(audio_path);
  if(audio_path != ""){
    // console.log(audios[audio_path]);
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