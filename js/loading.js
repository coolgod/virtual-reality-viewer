function initLoadingBar() {
	$("#progressbar").progressbar({
		value: 0,
		complete: function() {
			$("#progressbar-group").fadeOut(1000, "swing", function() {
				$("#start-btn").show();
			});
		}
	});
}

function updateLoadingBar() {
	var val = $("#progressbar").progressbar("value");
	$("#progressbar").progressbar("value", val + 50);
}

function preLoad() {
	loadImg(box_path_pre + "brookings.jpg")
		.then(loadImg(box_path_pre + "bd.jpg"))
		.then(loadImg(path_pre + skybox_imgs[3].bg_img))
		.then(loadImg(path_pre + skybox_imgs[24].bg_img))
		.then(loadImg(logo_img))
		.then(function() {
			return Promise.all(skybox_imgs[3].box.map(function(box) {
				loadImg(box_path_pre + skybox_imgs[box.next_idx].bg_img)
			}));
		})
		.then(function() {
			return Promise.all(skybox_imgs[24].box.map(function(box) {
				loadImg(box_path_pre + skybox_imgs[box.next_idx].bg_img)
			}));
		})
		.then(loadFile("audio/Brookings.mp3"))
		.then(loadFile("audio/bd.mp3"))
}

function loadImg(url) {
	return new Promise(function(resolve, reject) {
		var loader = new THREE.ImageLoader();
		loader.load(url, function() {
			updateLoadingBar();
			resolve(url);
		});
	});
}

function loadFile(url) {
	// console.log("loading", url);
	return new Promise(function(resolve, reject) {
		var loader = new THREE.XHRLoader();
		loader.load(url, function() {
			updateLoadingBar();
			resolve(url);
		});
	});
}

function showEntryScene() {
	$("#wrapper").fadeOut(2000, "swing", function() {
		var canvas = $(renderer.domElement);
		canvas.css({
			"display": "block",
			"height": "100%",
			"width": "100%"
		});
		$(document.body).append(canvas);
	});

	stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild(stats.dom);
}

initLoadingBar();

$(document).ready(function() {
	$("#start-btn").click(showEntryScene);
});
