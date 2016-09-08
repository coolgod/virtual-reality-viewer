var showTextIndex = -1;
var gazingIndex = -1;
var scaleCubeIndice = [];

function rotateCube() {
  cubes.forEach(function(cube) {
    cube.rotation.y += 0.01;
  })
}

function positionRing() {
  ring.position.set(camera.getWorldDirection().x * 3, camera.getWorldDirection().y * 3, camera.getWorldDirection().z * 3);
  ring.quaternion.copy(camera.quaternion);
}

function renderIntersects() {
  var intersects = raycaster.intersectObjects(scene.children);
  var isGazingCube, isGazingLogo = false;
  gazingIndex = -1;

  if (intersects.length > 0) {
    // first check if collide with the logo
    if (intersects[0].object === logo) {
      logo.scale.set(1.2, 1.2, 1.2);
      logo.material.opacity = 0.6;
      isGazingLogo = true;
    }
    // second check if collide with the cubes
    else if ((gazingIndex = cubes.indexOf(intersects[0].object)) != -1) {
      showTextIndex = gazingIndex;
      if (cubes[gazingIndex].position.distanceTo(camera.position) > 0.1 + 1) {
        cubes[gazingIndex].scale.set(1.2, 1.2, 1.2);
        if(!~scaleCubeIndice.indexOf(gazingIndex)) scaleCubeIndice.push(gazingIndex);
        isGazingCube = true;
      } else {
        cubes[gazingIndex].scale.x = -1.2;
      }
    }
  }

  if (isGazingCube || isGazingLogo) {
    showText(gazingIndex);
    gaze(gazingIndex);
  } else {
    clock.stop();
    while(scaleCubeIndice.length > 0){
      cubes[scaleCubeIndice.pop()].scale.set(1, 1, 1);
    }
    ring.scale.set(1, 1, 1);
    ring.visible = true;
    hideText(showTextIndex);
    resetLogo();
  }
}

function showText(idx) {
  if (idx != -1 && cubeTxt[idx] != null)
    cubeTxt[idx].visible = true;
}

function hideText(idx) {
  if (idx != -1 && cubeTxt[idx] != null) {
    cubeTxt[idx].visible = false;
    showTextIndex = -1;
  }
}

function hideOtherCubes(gazeIdx) {
  for (var i = 0; i < cubes.length; i++) {
    if (i != gazeIdx) {
      cubes[i].visible = false;
    }
  }
}

function gaze(gazingIndex) {
  if (ring.visible == false) return;
  if (!clock.running) clock.start();
  var t = 0.001 * (self.performance.now() - clock.oldTime);
  var factor = 1;

  // change ring size
  // make it smaller
  if (t <= 1.6) {
    factor = 1 - t / 20;
    // make it bigger
  } else if (t > 1.6 && t <= 3) {
    factor = 1 + t / 10;
  } else {
    // zoom in camera
    ring.visible = false;
    clock.stop();
    zoomInCamera(gazingIndex);
  }
  ring.scale.set(ring.scale.x * factor,
    ring.scale.y * factor, 1); // 2-d, no scale for z axis
}

function zoomInCamera(gazeIdx) {
  hideOtherCubes(gazeIdx);

  // if gazing at the logo, then init skybox without zoom in
  if (gazeIdx == -1) {
    lastSkyboxIdx = nextSkyboxIdx;
    nextSkyboxIdx = 1;
    initSkybox(nextSkyboxIdx, lastSkyboxIdx, gazeIdx);
    return;
  } else {
    lastSkyboxIdx = nextSkyboxIdx;
    nextSkyboxIdx = cubes[gazeIdx].next_idx;
  }

  cubes[gazeIdx].material.side = THREE.DoubleSide;
  cubes[gazeIdx].material.opacity = 1;

  var position = {
    x: 0,
    y: 0,
    z: 0
  };

  var target = {
    x: cubes[gazeIdx].position.x,
    y: cubes[gazeIdx].position.y,
    z: cubes[gazeIdx].position.z
  };

  updateTween = true;

  var cubeTween = new TWEEN.Tween(position).to(target, 2000).start();
  cubeTween.easing(TWEEN.Easing.Quartic.Out);

  cubeTween.onUpdate(function() {
    camera.position.set(position.x, position.y, position.z);
    if (camera.position.distanceTo(cubes[gazeIdx].position) <= 0.1 + 1 && lights.children.length == 1) {
      lights.add(new THREE.AmbientLight(0xffffff, 1));
    }
  });

  cubeTween.onComplete(function() {
    initSkybox(nextSkyboxIdx, lastSkyboxIdx, gazeIdx);
    camera.position.set(0, 0, 0);
    cubes[gazeIdx].position.set(0, 0, 0);
    updateTween = false;
  });
}
