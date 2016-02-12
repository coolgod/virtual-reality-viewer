<!DOCTYPE html>

<html lang="en">
<head>
  <title>WashU VRV</title>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

  <link href='http://fonts.googleapis.com/css?family=Raleway' rel='stylesheet' type='text/css'>
  <link href='css/style.css' rel='stylesheet' type='text/css'>
</head>
</head>


<body>
  <!-- 
  <video id="video" loop="" style="display:none">
      <source src="video/Friends.mp4" type="video/mp4; codecs=&quot;avc1.42E01E, mp4a.40.2&quot;">
  </video>
  -->
  
    <div class="wrapper" id="wrapper">
      <div class="header">
        <h1 class="title">WuVR</h1>
      </div>
      <div class="content">
        <div class="info">
          <p>Welcome to a virtual tour of Washington University in St.Louis</p>
        </div>
        <div class="button">
          <a href="#" class="btn">Get Started</a>
        </div>
      </div>
      <div class="footer">
        <span class="copyright">Washington University in St. Louis </span> —
        <a href="http://sts.wustl.edu" class="link">STS</a>
        <a href="#" class="link">SDC</a>
        <a href="http://sts.wustl.edu/vrv/" class="link">VRV</a>
      </div>
    </div>
 
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
<!-- <script src="fonts/helvetiker_regular.typeface.js"></script> -->
<!-- <script src="fonts/Lato_Regular.js"></script> -->
<script src="fonts/Raleway_Medium.js"></script>
<!-- WebVR Polyfill: a JavaScript implementation of the WebVR spec -->
<script src="bower_components/webvr-polyfill/build/webvr-polyfill.js"></script>
<!-- WebVR Boilerplate: A THREE.js-based starting point for VR experiences -->
<script src="bower_components/webvr-boilerplate/build/webvr-manager.js"></script>
<script src="js/webvr-boilerplate/webvr-manager-extras.js"></script>
<!-- jquery -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
<!-- howler.js - Modern Web Audio Javascript Library -->
<script src="bower_components/howler.js/howler.js"></script>

<!--All Self-implemented Script -->
<script src="js/initObjects.js"></script>
<script src="js/htmlFunctions.js"></script>
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

/* Restructuring

Moved below line to htmlFunctions.js due to div resizing issues for the starting screen (wrapper)

// Append the canvas element created by the renderer to document body element.
// document.body.appendChild(renderer.domElement);

*/

// Create a three.js scene.
var scene = new THREE.Scene();
var top_scene = new THREE.Scene();

// Create cube & door array used for each scene
var cubeArray = [];
var cubeTextArray = [];
var doorArray = [];
var animationArray = [];

// Create a three.js camera.
// dynamic vFOV ref: https://github.com/mrdoob/three.js/issues/1239
var aspect = window.screen.availWidth / window.screen.availHeight;
var camera = new THREE.PerspectiveCamera(90, aspect, 0.1, 501);
camera.target = new THREE.Vector3( 10, 10, 0 );
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
var particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
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

// helper object for zooming camera in/out
newCameraPosition = new THREE.Vector3(0,0,0);

// Create a VR manager helper to enter and exit VR mode.
var manager = new WebVRManager(renderer, effect, {hideButton: false});

// Load resource data files
var request = new XMLHttpRequest();
if ( /iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream ) {
  request.open("GET", "data/data-iphone.json", false);
}else if ( /iPad/i.test(navigator.userAgent) ) {
  //request.open("GET", "data/data-ipad.json", false);
  request.open("GET", "data/data.json", false);
}else if ( /Anroid/i.test(navigator.userAgent)  ){
  request.open("GET", "data/data-android.json", false);
}else{
  request.open("GET", "data/data.json", false);
}
request.send();
skybox_images = JSON.parse(request.responseText).locations;

// Initialize a skybox.
skybox_index = Util.getQueryParameter("skybox_index");
if ( skybox_index == "" ) {
  skybox_index = 8;
}
initSkybox(skybox_index, null);

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


