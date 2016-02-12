/* objects recycle */

function clearAll( prev_skybox_index ){
  clearRing();
  clearOldSkybox();
  clearOldCubesAndText();
  clearVideoScreen();
  clearAudio( prev_skybox_index );
  clearDoors();
  clearAnimation();

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
}

function clearOldSkybox(){
  if(skybox != null){
    scene.remove(skybox);
    skybox.geometry.dispose();
    skybox.material.map.dispose();
    skybox.material.dispose();
  }
}

function clearVideoScreen(){
  // if(videoMesh != null){
  //   scene.remove( videoMesh );
  //   videoMesh.geometry.dispose();
  //   videoMesh.material.map.dispose();
  //   videoMesh.material.dispose();
  //   videoScreenContext.clearRect( 0, 0, videoScreen.width, videoScreen.height )
  //   videoMesh = null;
  // }
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
  var audio_path = skybox_images[prev_skybox_index].bg_audio;
  // console.log(audio_path);
  if(audio_path != ""){
    // console.log(audios[audio_path]);
    if(audios[audio_path] != null && audios[audio_path] != false){
      audios[audio_path].stop();
      audios[audio_path] = false;
    }
  }
}

function clearDoors() {
  for (var i = 0; i < doorArray.length; i++){
    // scene.remove( cubeArray[i].children[0] );
    scene.remove(doorArray[i]);
    // doorArray[i].geometry.dispose();
  }
}

function clearAnimation() {
  for (var i = 0; i < animationArray.length; i++){
    // scene.remove( cubeArray[i].children[0] );
    scene.remove(animationArray[i]);
    console.log(animationArray[i]);
    animationArray[i].geometry.dispose();
  }

}

function clearIntroText() {
  if(introText != null) {
    scene.remove( introText );
    introText.geometry.dispose();
  }
}