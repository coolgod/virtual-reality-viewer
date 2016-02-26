WebVRManager.prototype.render = function(scene, camera, timestamp) {
  this.resizeIfNeeded_(camera);

  if (this.isVRMode()) {
    this.distorter.preRender();
    this.renderer.clear();
    this.effect.render(scene, camera);
    this.distorter.postRender();
  } else {
    // Scene may be an array of two scenes, one for each eye.
    if (scene instanceof Array) {
      this.renderer.clear();
      this.renderer.render(scene[0], camera);
    } else {
      this.renderer.clear();
      this.renderer.render(scene, camera);
    }
  }
};