var skybox = null;
var frontSkybox = null;
var skybox_index = null;
var prev_skybox_index = null;
var loadingSkyboxIndex = null;
var isLoading = false;

var introText = null;
var homeLogo = null;
var cubeArray = [];
var cubeTextArray = [];

var annie = null;
var audios = new Array();

// global image loader for skybox and cubes only
var imgLoader = new THREE.TextureLoader();
imgLoader.crossOrigin = '';

function initSkybox(skybox_index, prev_skybox_index, preGazingIndex) {
  console.log("enter scene: " + skybox_index + ", prev scene: " + prev_skybox_index);

  // manager.input is defined after invoking render method
  if (manager.input != undefined && skybox_index == 1) {
    manager.input.theta = 0;
    manager.input.phi = 0;
  }

  // clean up previous scene
  if (prev_skybox_index != null || prev_skybox_index != undefined) {
    clearAll(prev_skybox_index);
    if (prev_skybox_index == 1) {
      clearIntroText();
    }
  }

  // preload audio
  if (skybox_index == 0 || skybox_index == 1) {
    audios[skybox_imgs[0].bg_audio] = new Howl({
      urls: [skybox_imgs[0].bg_audio]
    });
    audios[skybox_imgs[6].bg_audio] = new Howl({
      urls: [skybox_imgs[6].bg_audio]
    });
  }

  // load intro text and gaze pointer
  if (skybox_index != 0) {
    // logo
    if (homeLogo == null) {
      initHomeLogo(); //load logo only when it hasn't been initialized
    }

    // intro text
    if (skybox_index == 1) {
      initIntroText(skybox_index);
      homeLogo.visible = false;
    } else {
      homeLogo.visible = true;
    }

    // gaze pointer
    if (ring == null) {
      ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.17, 0.017, 0, 70),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide
        }));
      top_scene.add(ring);
    }
  }

  // load skybox
  var this_skybox = skybox_imgs[skybox_index];
  imgLoader.load(
    path_pre + this_skybox.bg_img,
    function(texture) {
      // start caching skybox images for other scenes asynchronously
      var cacheLoader = new THREE.ImageLoader(THREE.DefaultLoadingManager);
      cacheLoader.setCrossOrigin('');
      for (i = 0; i < this_skybox.box.length; i++) {
        var path = path_pre + skybox_imgs[this_skybox.box[i].next_idx].bg_img;
        cacheLoader.load(path);
      }

      if (this_skybox.bg_img != "") {
        texture.minFilter = THREE.NearestMipMapLinearFilter
      }

      if (this.skybox == null) {
        this.skybox = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40),
          new THREE.MeshBasicMaterial({
            map: texture
          }));
        this.skybox.scale.x = -1.0;
        this.skybox.receiveShadow = true;
        this.skybox.material.transparent = true;
        this.scene.add(skybox);

        // loading new cubes
        box_count = this_skybox.box.length;
        for (i = 0; i < box_count; i++) {
          this.cubeArray.push(this.initCube(this_skybox.box[i]));
        }
      } else {
        (function fadeout() {
          if (cubeArray[preGazingIndex].material.opacity > 0.1) {
            cubeArray[preGazingIndex].material.opacity -= 0.05;
            requestAnimationFrame(fadeout);
          }else{
            clearOldCubesAndText();
            ambientLight.color = new THREE.Color(0x222222);
            // loading new cubes
            box_count = this_skybox.box.length;
            for (i = 0; i < box_count; i++) {
              this.cubeArray.push(this.initCube(this_skybox.box[i]));
            }
          }
        })();
        this.skybox.material.map = texture;
      }
    }
  );

  // load audio using Howler.js
  var audio_path = skybox_imgs[skybox_index].bg_audio;
  if (audio_path != "") {
    if (audios[audio_path] == null) { // if it hasn't been loaded
      audios[audio_path] = new Howl({
        urls: [audio_path]
      }).play();
      // console.log( audios[audio_path] );
    } else {
      if (audios[audio_path] != false) { //if it has been loaded but not played
        audios[audio_path].play();
      }
    }
  }
}

function initCube(box_specific) {
  // load texture images
  var texture = imgLoader.load(
    box_path_pre + skybox_imgs[box_specific.next_idx].bg_img,
    function(texture) {
      return texture;
    }
  );
  texture.miniFilter = THREE.LinearFilter;

  // create cube mesh
  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshPhongMaterial({
      map: texture,
      shading: THREE.SmoothShading,
      opacity: 0.7,
      transparent: true
    })
  );
  sphere.next_idx = box_specific.next_idx;
  sphere.position.set(box_specific.coord[0], box_specific.coord[1], box_specific.coord[2]);
  scene.add(sphere);

  // initialize 3D Text
  var text3D = initText(sphere, box_specific.text);
  scene.add(text3D);
  cubeTextArray.push(text3D);

  return sphere;
}

function initText(sphere, txt) {

  // text above cube
  var textGeometry = new THREE.TextGeometry(txt, {
    size: 1,
    height: 0.2,
    weight: "normal",
    style: "normal",
    curveSegments: 3,
    font: "raleway",
    material: 0,
    extrudeMaterial: 1
  });
  var textMaterial = new THREE.MeshPhongMaterial({
    color: 0xDDDDDD,
    specular: 0x009900,
    shininess: 10,
    shading: THREE.SmoothShading,
    opacity: 0.8,
    transparent: true
  });

  text3D = new THREE.Mesh(textGeometry, textMaterial);

  var deltaX = ((sphere.position.z > 0) ? +1 : -1) * (txt.length * 0.2);
  var deltaZ = ((sphere.position.x > 0) ? -1 : +1) * (txt.length * 0.2);
  deltaX = (sphere.position.z == 0) ? 0 : deltaX;
  deltaZ = (sphere.position.x == 0) ? 0 : deltaZ;
  text3D.position.set(sphere.position.x + deltaX, sphere.position.y + 1.5, sphere.position.z + deltaZ);


  text3D.lookAt(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z));

  text3D.visible = false;
  return text3D;
}

function initIntroText(skybox_index) {
  var textGeometry = new THREE.TextGeometry(skybox_imgs[skybox_index].bg_name, {
    size: 1,
    height: 0.2,
    weight: "normal",
    style: "normal",
    curveSegments: 20,
    font: "raleway",
    material: 0,
    extrudeMaterial: 1
  });
  var textMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x595050,
    specular: 0xffffff,
    shininess: 10,
    shading: THREE.SmoothShading,
    opacity: 0.8,
    transparent: true
  });
  introText = new THREE.Mesh(textGeometry, textMaterial);
  introText.position.set(-10, 5, -15);
  introText.lookAt(new THREE.Vector3(camera.position.x - 10, camera.position.y, camera.position.z));
  introText.visible = true;
  scene.add(introText);
}

function initHomeLogo() {
  var loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  var texture = loader.load(
    logo_img,
    function(texture) {
      return texture;
    }
  );

  homeLogo = new THREE.Mesh(
    new THREE.CircleGeometry(1, 30),
    new THREE.MeshPhongMaterial({
      map: texture,
      shading: THREE.SmoothShading,
      transparent: true
    })
  );
  homeLogo.position.set(camera.position.x, camera.position.y - 10, camera.position.z);
  homeLogo.lookAt(camera.position);
  resetHomeLogo();
  homeLogo.visible = true;
  scene.add(homeLogo);
}

function resetHomeLogo() {
  homeLogo.scale.set(3, 3, 3);
  homeLogo.material.opacity = 0.2;
}