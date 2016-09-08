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
  if(lastSkyboxIdx == null || lastSkyboxIdx == undefined) return;
  var path = skybox_imgs[lastSkyboxIdx].bg_audio;
  if(path != ""){
    if(audios[path] != null && audios[path] != false){
      audios[path].stop();
      audios[path] = false;
    }
  }
}

function clearIntroText() {
  if(introText != null) {
    scene.remove( introText );
    introText.geometry.dispose();
  }
}
