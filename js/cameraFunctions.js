function changeCameraTarget( phi, theta ) {
  camera.target.x = - Math.sin(this.phi + 0.5 * Math.PI) * Math.cos(this.theta - 0.5 * Math.PI) * 3;
  camera.target.y = - Math.cos(this.phi + 0.5 * Math.PI) * 3;
  camera.target.z = Math.sin(this.phi + 0.5 * Math.PI) * Math.sin(this.theta - 0.5 * Math.PI) * 3;
}

function zoomInCamera( loadingSkyboxIndex ) {
  var position = { x: 0, y: 0, z: 0 };
  var target = { x: camera.getWorldDirection().x*delta*500, 
                 y: camera.getWorldDirection().y*delta*500, 
                 z: camera.getWorldDirection().z*delta*500 };
  
  updateTween = true;

  var cameraTween = new TWEEN.Tween(position).to(target, 2000).start();
  cameraTween.easing(TWEEN.Easing.Quartic.Out);

  //ADD EVENTS TO TWEEN
  cameraTween.onStart(function() { 
    // jump is from the current skybox
    prev_skybox_index = skybox_index;
    // loadingSkyboxIndex is the index of the cube whose 'next_idx' attribute is the target skybox
    if (loadingSkyboxIndex == -1) { // go back to start when look on the ground
        skybox_index = 1;
    } else { // find the target skybox index by 'next_idx' of the cube
        skybox_index = cubeArray[loadingSkyboxIndex].next_idx;
    }
  });

  cameraTween.onUpdate(function() {
    camera.position.x = position.x;
    camera.position.y = position.y;
    camera.position.z = position.z;
  });

  cameraTween.onComplete(function() { console.log("complete");
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;

    // jump from 'prev_skybox_index', jump to 'skybox_index'
    initSkybox(skybox_index, prev_skybox_index);;

    updateTween = false;
  });

}
