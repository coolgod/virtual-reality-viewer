function initLoadingBar() {
	$("#progressbar").progressbar({
		value: 0,
		change: function() {
		},
		complete: function() {
			$("#progressbar").fadeOut(1000, "swing", function() {
				$("#progressbar-text").css("display", "none");
				$("#start-btn").css("display", "inline-block");
			});
		}
	});
}

function updateLoading() {
	var val = $("#progressbar").progressbar("value");
	$("#progressbar").progressbar("value", val + 10);
}

function preLoad() {
	// pre load images and audios
	var imgLoader = new THREE.ImageLoader();
	var fileLoader = new THREE.XHRLoader();
	// logo
	imgLoader.load(logo_img, updateLoading);
	// scene 1
	imgLoader.load(box_path_pre + "brookings.jpg", updateLoading);
	imgLoader.load(box_path_pre + "bd.jpg", updateLoading);
	// scene 3, brookings
	imgLoader.load(path_pre + skybox_imgs[3].bg_img, updateLoading);
	skybox_imgs[3].box.forEach(function(box) {
		imgLoader.load(box_path_pre + skybox_imgs[box.next_idx].bg_img, updateLoading);
	});
	fileLoader.load("audio/Brookings.mp3", updateLoading);
	imgLoader.load(path_pre + skybox_imgs[24].bg_img, updateLoading, updateLoading);
	// scene 24, bears den
	skybox_imgs[24].box.forEach(function(box) {
		imgLoader.load(box_path_pre + skybox_imgs[box.next_idx].bg_img);
	});
	fileLoader.load("audio/bd.mp3", updateLoading);
}

initLoadingBar();