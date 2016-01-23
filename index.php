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

<!--
  three.js 3d library
  -->
<script src="bower_components/threejs/build/three.js"></script>

<!--
  VRControls.js acquires positional information from connected VR devices and applies the transformations to a three.js camera object.
   -->
<script src="bower_components/threejs/examples/js/controls/VRControls.js"></script>

<!--
  VREffect.js handles stereo camera setup and rendering.
  -->
<script src="bower_components/threejs/examples/js/effects/VREffect.js"></script>

<!--
  A polyfill for WebVR using the Device{Motion,Orientation}Event API.
  -->
<script src="bower_components/webvr-polyfill/build/webvr-polyfill.js"></script>

<!--
  Helps enter and exit VR mode, provides best practices while in VR.
  -->
<script src="build/webvr-manager.js"></script>

<!--
  Imports All New Functions
  -->

<script src="initObjects.js"></script>
<script src="removeObjects.js"></script>
<script src="cameraFunctions.js"></script>
<script src="functions.js"></script>
<script src="src/util.js"></script>
<!--
  Imports Door
  -->

<script src="bower_components/threejs/examples/js/loaders/ColladaLoader.js"></script>
<script src="bower_components/threejs/examples/js/loaders/OBJLoader.js"></script>

<!--
  Imports Font
  -->

<script src="fonts/helvetiker_regular.typeface.js"></script>
<script src="fonts/Lato_Regular.js"></script>


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
// var ring = new THREE.Mesh(
//     new THREE.TorusGeometry( 0.17, 0.017, 4, 70 ),            // set 'radius segment' to 0 to make it a flat 2D ring
//     new THREE.MeshBasicMaterial( { color: 0xffffff } ));      // set color to white
// scene.add(ring);

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
request.open("GET", "./data.json", false);
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

  // Below are for debugging
  // console.log( camera.position.x + ", " + camera.position.y + " ," + camera.position.z );
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

window.scrollTo(0, 20);
</script>

</html>


