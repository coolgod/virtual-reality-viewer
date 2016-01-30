<!DOCTYPE html>

<html lang="en">
<head>
<title>WASHINGTON UNIVERSITY IN ST.LOUIS VR EXPERIENCE</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<style>
body {
  width: 100%;
  height: 100%;
  background-color: #000;
  color: #fff;
  margin: 0px;
  padding: 0;
  overflow: hidden;
}
</style>
</head>

<body>
  <!-- 
  <video id="video" loop="" style="display:none">
      <source src="video/Friends.mp4" type="video/mp4; codecs=&quot;avc1.42E01E, mp4a.40.2&quot;">
  </video>
  -->
</body>

<script>
/*
 * Debug parameters.
 */
WebVRConfig = {
  /**
   * webvr-polyfill configuration
   */

  // Forces availability of VR mode.
  FORCE_ENABLE_VR: true, // Default: false.
  // Complementary filter coefficient. 0 for accelerometer, 1 for gyro.
  K_FILTER: 0.98, // Default: 0.98.
  // How far into the future to predict during fast motion.
  //PREDICTION_TIME_S: 0.050, // Default: 0.050s.

  /**
   * webvr-boilerplate configuration
   */
  // Forces distortion in VR mode.
  FORCE_DISTORTION: true, // Default: false.
  // Override the distortion background color.
  // DISTORTION_BGCOLOR: {x: 1, y: 0, z: 0, w: 1}, // Default: (0,0,0,1).
};
</script>

<!-- All Library dependencies -->
<!-- three.js: JavaScript 3D library -->
<script src="bower_components/threejs/build/three.js"></script>
<script src="js/threejs-extras/TextGeometry.js"></script>
<script src="js/threejs-extras/FontUtils.js"></script>
<script src="js/threejs-extras/VRControls.js"></script>
<script src="js/threejs-extras/VREffect.js"></script>
<script src="fonts/helvetiker_regular.typeface.js"></script>
<script src="fonts/Lato_Regular.js"></script>
<!-- WebVR Polyfill: a JavaScript implementation of the WebVR spec -->
<script src="bower_components/webvr-polyfill/build/webvr-polyfill.js"></script>
<!-- WebVR Boilerplate: A THREE.js-based starting point for VR experiences -->
<script src="bower_components/webvr-boilerplate/build/webvr-manager.js"></script>
<script src="js/webvr-boilerplate/webvr-manager-extras.js"></script>

<!--All Self-implemented Script -->
<script src="js/initObjects.js"></script>
<script src="js/removeObjects.js"></script>
<script src="js/cameraFunctions.js"></script>
<script src="js/functions.js"></script>
<script src="js/util.js"></script>

<script>

//Setup three.js WebGL renderer
var renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.sortObjects = true;  // not always working
renderer.autoClear = false;

// Append the canvas element created by the renderer to document body element.
document.body.appendChild(renderer.domElement);

// Create a three.js scene.
var scene = new THREE.Scene();
var top_scene = new THREE.Scene();

// Create cube & door array used for each scene
var cubeArray = [];
var cubeTextArray = [];
var doorArray = [];
var animationArray = [];

// Create a three.js camera.
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.target = new THREE.Vector3( 10, 10, 0 );
// console.log(camera);
camera.lookAt(new THREE.Vector3( 100, 100, 100 ));

// Apply VR headset positional data to camera.
var controls = new THREE.VRControls(camera);

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Create a clock object for animation control
var clock = new THREE.Clock(false);
var animationClock = new THREE.Clock();

// Lights
particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
scene.add( particleLight );

scene.add( new THREE.AmbientLight( 0x111111 ) );

var directionalLight = new THREE.DirectionalLight( Math.random() *  0xff0000, 0.4 );

directionalLight.position.x = Math.random() - 0.5;
directionalLight.position.y = Math.random() - 0.5;
directionalLight.position.z = Math.random() - 0.5;

directionalLight.position.normalize();

scene.add( directionalLight );

var pointLight = new THREE.PointLight( 0xffffff, 1 );
particleLight.add( pointLight );


// gaze pointer
var raycaster = new THREE.Raycaster();
raycaster.near = 1;                                              // ray will collide with the gaze pointer ring, but will ignore it  
var ring = null;

// add video texture
var videoMesh = null, video, videoTexture, videoScreen, videoScreenContext;
// initVideo();


// add audio listener
listener = new THREE.AudioListener();
camera.add( listener );


// helper object for zooming camera in/out
newCameraPosition = new THREE.Vector3(0,0,0);



// Initialize a list of skybox_images (link to images & coordinates of boxes)
/*
This all_picture_path variable contains all pathing towards the
Struture is

background_image:<path>, 
box_image:[{background_index:<num>,box_img_path:"<path>"},{background_index:<num>,box_img_path:"<path>"}, background_audio:<path>]
first box image and its corresponding background        2nd box image and its corresponding

Current background ----------------------------------------- bg paths from this current bg
0.brookings ------------------------------------------------ samfox & engineering---------------------   7,1
1.engineering ---------------------------------------------- outside olin & brookings----------------   2,0
2.outside olin --------------------------------------------- olin circ & fun room & engineering------   3,4
3.olin circ ------------------------------------------------ outside olin   -------------------------   2
4.fun room ------------------------------------------------- outside olin & sts----------------------   2,5
5.sts ------------------------------------------------------ fun room & bd --------------------------   4,6
6.bd ------------------------------------------------------- sts & samfox----------------------------   5,7
7.samfox --------------------------------------------------- bd & brookings--------------------------   6,0
8.Introduction --------------------------------------------- brookings & bd--------------------------   0,6
*/
var request = new XMLHttpRequest();
request.open("GET", "data/data.json", false);
request.send();
skybox_images = JSON.parse(request.responseText).locations;

// Initialize a skybox.
skybox_index = Util.getQueryParameter("skybox_index");
if ( skybox_index == "" ) {
  skybox_index = 8;
}
initSkybox(skybox_index);



// Create a VR manager helper to enter and exit VR mode.
var manager = new WebVRManager(renderer, effect, {hideButton: false});

// Request animation frame loop function
function animate(timestamp) {
  // Update VR headset position and apply to camera.
  controls.update();

  /* update clock for animation */
  delta = animationClock.getDelta();
  if (annie != null) {
    annie.update(1000 * delta);
  }

  // Keep Zooming in until designated position
  zoomInCamera();

  // Render the scene through the manager.
  manager.render(scene, camera, timestamp);

  requestAnimationFrame(animate);
}

// Kick off animation loop
animate();

// Reset the position sensor when 'z' pressed.
function onKey(event) {
  if (event.keyCode == 90) { // z
    controls.resetSensor();
  }
}

window.addEventListener('keydown', onKey, true);
</script>

</html>


