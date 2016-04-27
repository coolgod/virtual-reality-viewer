function zoomInCamera(loadingSkyboxIndex) {
  cubeArray[loadingSkyboxIndex].material.side = THREE.DoubleSide;
  cubeArray[loadingSkyboxIndex].material.opacity = 1;

  var position = {
    x: cubeArray[loadingSkyboxIndex].position.x,
    y: cubeArray[loadingSkyboxIndex].position.y,
    z: cubeArray[loadingSkyboxIndex].position.z
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
    prev_skybox_index = skybox_index;
    if (loadingSkyboxIndex == -1) { // back to start
      skybox_index = 1;
    } else {
      skybox_index = cubeArray[loadingSkyboxIndex].next_idx;
    }
  });

  cubeTween.onUpdate(function() {
    cubeArray[loadingSkyboxIndex].position.set(position.x, position.y, position.z);
    if(cubeArray[loadingSkyboxIndex].position.distanceTo(camera.position) <= 0.1 + 1) {
      ambientLight.color = new THREE.Color(0xffffff);
    }
  });

  cubeTween.onComplete(function() {
    initSkybox(skybox_index, prev_skybox_index, loadingSkyboxIndex);
    updateTween = false;
  });
}