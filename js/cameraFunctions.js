function zoomInCamera(gazeIdx) {
  hideOtherCubes(gazeIdx);
  // if gazing at the logo, then init skybox without zoom in
  if (gazeIdx == -1) {
    lastSkyboxIdx = nextSkyboxIdx;
    nextSkyboxIdx = 1;
    initSkybox(nextSkyboxIdx, lastSkyboxIdx, gazeIdx);
    return;
  }
  
  cubeArray[gazeIdx].material.side = THREE.DoubleSide;
  cubeArray[gazeIdx].material.opacity = 1;

  var position = {
    x: cubeArray[gazeIdx].position.x,
    y: cubeArray[gazeIdx].position.y,
    z: cubeArray[gazeIdx].position.z
  };

  var target = {
    x: 0,
    y: 0,
    z: 0
  };

  updateTween = true;

  var cubeTween = new TWEEN.Tween(position).to(target, 2000).start();
  cubeTween.easing(TWEEN.Easing.Quartic.Out);

  //ADD EVENTS TO TWEEN
  cubeTween.onStart(function() {
    lastSkyboxIdx = nextSkyboxIdx;
    nextSkyboxIdx = cubeArray[gazeIdx].next_idx;
  });

  cubeTween.onUpdate(function() {
    cubeArray[gazeIdx].position.set(position.x, position.y, position.z);
    if (cubeArray[gazeIdx].position.distanceTo(camera.position) <= 0.1 + 1) {
      ambientLight.color = new THREE.Color(0xffffff);
    }
  });

  cubeTween.onComplete(function() {
    initSkybox(nextSkyboxIdx, lastSkyboxIdx, gazeIdx);
    updateTween = false;
  });
}