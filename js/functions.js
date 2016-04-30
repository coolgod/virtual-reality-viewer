function rotateCube() {
  for (var i = 0; i < cubeArray.length; i++) {
    cubeArray[i].rotation.y += 0.01;
  }
}

function positionRing() {
  ring.position.set(camera.getWorldDirection().x * 3, camera.getWorldDirection().y * 3, camera.getWorldDirection().z * 3);
  ring.quaternion.copy(camera.quaternion); // makes the ring face the screen (in conjunction with the camera)
}

function renderIntersects() {
  var intersects = raycaster.intersectObjects(scene.children);
  var isGazingCube, isGazingLogo = false;
  var gazingIndex = -1;

  if (intersects.length > 0) {
    // first check if collide with the logo
    if (intersects[0].object === homeLogo) {
      homeLogo.scale.set(3.5, 3.5, 3.5);
      homeLogo.material.opacity = 0.6;
      isGazingLogo = true;
    }
    // second check if collide with the cubes
    else if ((gazingIndex = cubeArray.indexOf(intersects[0].object)) != -1) {
      if(cubeArray[gazingIndex].position.distanceTo(camera.position) > 0.1 + 1) {
        cubeArray[gazingIndex].scale.set(1.2, 1.2, 1.2);
        isGazingCube = true;
      }else{
        cubeArray[gazingIndex].scale.x = -1.2;
      }
    }
  }
  
  if (isGazingCube || isGazingLogo) {
    gazeFunction(gazingIndex);
  } else {
    clock.stop();
    cubeArray.forEach(function(cube) {
      if(cube.position.distanceTo(camera.position) > 0.1 + 1) {
        cube.scale.set(1, 1, 1);
      }
    });
    ring.scale.set(1, 1, 1);
    hideText();
    resetHomeLogo();
  }
}

function showText(gazingIndex) {
  if (!cubeTextArray[gazingIndex].visible) {
    cubeTextArray[gazingIndex].visible = true;
  }
}

function hideText(gazingIndex) {
  for (var i = 0; i < cubeTextArray.length; i++) {
    if (cubeTextArray[i].visible) {
      cubeTextArray[i].visible = false;
    }
  }
}

function hideOtherCubes(gazeIdx) {
  for (var i = 0; i < cubeArray.length; i++) {
    if (i != gazeIdx) {
      cubeArray[i].visible = false;
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