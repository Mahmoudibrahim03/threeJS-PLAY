import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
const gui = new dat.GUI();

THREE.ColorManagement.enabled = false;

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Object
 */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove(event) {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

let elapsedTime = 0;

let boxesActiveColor = {
	color: "#ff0000",
};
gui.addColor(boxesActiveColor, "color");
function effect() {
	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera(pointer, camera);

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects(boxesGroup.children);
	for (let i = 0; i < intersects.length; i++) {
		intersects[i].object.material.color.set(boxesActiveColor.color);
		intersects[i].object.scale.set(1.5, 1.5, 1.5);
		intersects[i].object.position.z = 0.1;
	}
}

const boxesGroup = new THREE.Group();
for (let i = 0; i < 70; i++) {
	for (let j = 0; j < 70; j++) {
		const geometry = new THREE.BoxGeometry(1 / 90, 1 / 90, 1 / 110);
		const material = new THREE.MeshStandardMaterial({
			color: 0xeeeeee,
		});
		const mesh = new THREE.Mesh(geometry, material);
		boxesGroup.add(mesh);
		mesh.position.z = 1 / 110 / 2 + 0.0001;
		mesh.position.x = i / 70 - 0.49;
		mesh.position.y = j / 70 - 0.49;
		mesh.receiveShadow = true;
		mesh.roughness = 0.5;
		mesh.castShadow = true;
	}
}

scene.add(boxesGroup);
// plane mesh
const planeGeometry = new THREE.PlaneGeometry(1, 1, 32, 32);
const planeMaterial = new THREE.MeshStandardMaterial({
	color: 0xeeeeee,
	side: THREE.DoubleSide,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.receiveShadow = true;
scene.add(planeMesh);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// lights

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(2, 2, 3);
directionalLight.shadow.camera.far = 5;
directionalLight.shadow.camera.near = 2;
directionalLight.shadow.camera.left = -1;
directionalLight.shadow.camera.right = 1;
directionalLight.shadow.camera.top = 1;
directionalLight.shadow.camera.bottom = -1;
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.target = boxesGroup;

scene.add(directionalLight);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
// camera.position.x = 1;
camera.position.y = -0.2;
camera.position.x = 0;
camera.position.z = 0.5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
	elapsedTime = clock.getElapsedTime();
	// console.log(elapsedTime);
	// Update controls
	controls.update();
	// Render
	renderer.render(scene, camera);

	boxesGroup.children
		.filter(e => e.scale.x === 1.5)
		.forEach((obj, i) => {
			console.log(obj);
			obj.position.z = Math.abs(Math.sin(elapsedTime * 0.5 + i) * 0.1);
		});
	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
	window.requestAnimationFrame(effect);
};
window.addEventListener("pointermove", onPointerMove);

tick();
