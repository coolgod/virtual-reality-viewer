function rotateCube() {
  for (var i = 0; i < cubes.length; i++) {
    cubes[i].rotation.y += 0.01;
  }
}

function positionRing() {
  ring.position.set(camera.getWorldDirection().x * 3, camera.getWorldDirection().y * 3, camera.getWorldDirection().z * 3);
  ring.quaternion.copy(camera.quaternion);
}

function renderIntersects() {
  var intersects = raycaster.intersectObjects(scene.children);
  var isGazingCube, isGazingLogo = false;
  var gazingIndex = -1;

  if (intersects.length > 0) {
    // first check if collide with the logo
    if (intersects[0].object === logo) {
      logo.scale.set(1.2, 1.2, 1.2);
      logo.material.opacity = 0.6;
      isGazingLogo = true;
    }
    // second check if collide with the cubes
    else if ((gazingIndex = cubes.indexOf(intersects[0].object)) != -1) {
      if (cubes[gazingIndex].position.distanceTo(camera.position) > 0.1 + 1) {
        cubes[gazingIndex].scale.set(1.2, 1.2, 1.2);
        isGazingCube = true;
      } else {
        cubes[gazingIndex].scale.x = -1.2;
      }
    }
  }

  if (isGazingCube || isGazingLogo) {
    gazeFunction(gazingIndex);
  } else {
    clock.stop();
    cubes.forEach(function(cube) {
      if (cube.position.distanceTo(camera.position) > 0.1 + 1) {
        cube.scale.set(1, 1, 1);
      }
    });
    ring.scale.set(1, 1, 1);
    hideText();
    resetLogo();
  }
}

function showText(idx) {
  if(cubeTxt[idx] != null)
    cubeTxt[idx].visible = true;
}

function hideText() {
  cubeTxt.forEach(function(txt) {
    txt.visible = false;
  });
}

function hideOtherCubes(gazeIdx) {
  for (var i = 0; i < cubes.length; i++) {
    if (i != gazeIdx) {
      cubes[i].visible = false;
    }
  }
}

function gazeFunction(gazingIndex) {
  if (!clock.running) {
    clock.start();
  }
  var t = 0.001 * (self.performance.now() - clock.oldTime);
  var factor = 1;

  if (gazingIndex != -1) {
    showText(gazingIndex);
  }

  /* gaze indicator(cursor) zoom-out-zoom-in */
  if (t <= 2) { // zoom-out the ring
    factor = 1 - t / 20;
  } else if (t > 2 && t <= 3) { // zoom-in the ring
    factor = 1 + t / 10;
  } else { // reset
    factor = 1;
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
