// WebVRManager.prototype.render = function(scene, camera, timestamp) {
//   this.resizeIfNeeded_(camera);
  
//   if (nextSkyboxIdx != 0) {
//     /* functions exist in functions.js */
//     rotateCube();
//     raycaster.set(camera.position, camera.getWorldDirection());
//     positionRing();
//     renderIntersects();
//   }

//   if (this.isVRMode()) {
//     // console.log("VRMode Render");
//     this.distorter.preRender();
//     this.renderer.clear();
//     this.effect.render(scene, camera);
//     this.renderer.clearDepth();
//     this.effect.render(top_scene, camera);
//     this.distorter.postRender();
//   } else {
//     // Scene may be an array of two scenes, one for each eye.
//     this.renderer.clear();
//     if (scene instanceof Array) {
//       this.renderer.render(scene[0], camera);
//     } else {
//       this.renderer.render(scene, camera);
//     }

//     this.renderer.clearDepth();
//     this.renderer.render( top_scene, camera );
//   }
// };