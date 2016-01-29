/* objects recycle */

function clearAll(){
  clearRing();
  clearOldSkybox();
  clearOldCubesAndText();
  clearVideoScreen();
  clearAudio();
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

function clearAudio () {
  if(audio != null){
    // audio.dispose();
    audio.stop();
    scene.remove(audio);
    audio = null;
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