function initLoadingBar() {
	$("#progressbar").progressbar({
		value: 0,
		complete: () => {
			$("#progressbar-group").fadeOut(1000, "swing", () => {
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
		.then(() => {
			return Promise.all(skybox_imgs[3].box.map((box) => {
				loadImg(box_path_pre + skybox_imgs[box.next_idx].bg_img)
			}));
		})
		.then(() => {
			return Promise.all(skybox_imgs[24].box.map((box) => {
				loadImg(box_path_pre + skybox_imgs[box.next_idx].bg_img)
			}));
		})
		.then(loadFile("audio/Brookings.mp3"))
		.then(loadFile("audio/bd.mp3"))
}

function loadImg(url) {
	return new Promise((resolve, reject) => {
		var loader = new THREE.ImageLoader();
		loader.load(url, () => {
			updateLoadingBar();
			resolve(url);
		});
	});
}

function loadFile(url) {
	// console.log("loading", url);
	return new Promise((resolve, reject) => {
		var loader = new THREE.XHRLoader();
		loader.load(url, () => {
			updateLoadingBar();
			resolve(url);
		});
	});
}

initLoadingBar();

$(document).ready(function() {
	$("#start-btn").click(function() {
		$("#wrapper").fadeOut(2000, "swing", function() {
			renderer.domElement.style.display = "block";
			renderer.domElement.style.width = "100%";
			document.body.appendChild(renderer.domElement);
		});
	});
});
