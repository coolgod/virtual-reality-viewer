function changeCameraTarget( phi, theta ) {
  camera.target.x = - Math.sin(this.phi + 0.5 * Math.PI) * Math.cos(this.theta - 0.5 * Math.PI) * 3;
  camera.target.y = - Math.cos(this.phi + 0.5 * Math.PI) * 3;
  camera.target.z = Math.sin(this.phi + 0.5 * Math.PI) * Math.sin(this.theta - 0.5 * Math.PI) * 3;
}

function zoomInCamera() {
  if (Math.abs(newCameraPosition.x) > Math.abs(camera.position.x)) {
    camera.position.x += camera.getWorldDirection().x*delta*10;
    camera.position.y += camera.getWorldDirection().y*delta*10;
    camera.position.z += camera.getWorldDirection().z*delta*10;
  
    // Trigger loading the new skybox
    if (Math.abs(newCameraPosition.x) < Math.abs(camera.position.x) + Math.abs(camera.getWorldDirection().x*delta*50) && !isLoading) {
      skybox_index = cubeArray[loadingSkyboxIndex].next_index;
      isLoading = true;
    }
  }

  // Stop Zooming in when reach designated position
  // Reset camera position to default(0,0,0)
  else if (Math.abs(newCameraPosition.x) <= Math.abs(camera.position.x) && loadingSkyboxIndex != null && isLoading) {
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;
    newCameraPosition.x = 0;
    newCameraPosition.y = 0;
    newCameraPosition.z = 0;

    // Load the new skybox after the camera is reset
    initSkybox(cubeArray[loadingSkyboxIndex].next_index);
    // updateSkybox(cubeArray[loadingSkyboxIndex].next_index);
    loadingSkyboxIndex = null;
    isLoading = false;
  }
}
