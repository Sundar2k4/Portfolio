import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.127.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("threejs").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

let object = null;

const loader = new GLTFLoader();
loader.load(
    'processor/scene.gltf',
    function (gltf) {
        object = gltf.scene;
        object.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                if (node.material) {
                    node.material.needsUpdate = true;
                    if (node.material.isMeshStandardMaterial) {
                        node.material.metalness = 0.5;
                        node.material.roughness = 0.5;
                    }
                }
            }
        });
        scene.add(object);
        object.scale.set(1, 1, 1);
        object.position.set(0, 0, 0);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    function (error) {
        console.error('An error occurred:', error);
    }
);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let mouseX = 0;
let mouseY = 0;

const sensitivity = 0.5;
const interactionRadius = 3; 

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);

    if (object) {
        const objectPosition = new THREE.Vector3();
        object.getWorldPosition(objectPosition);

        const mouseVector = new THREE.Vector3(mouseX * 10, mouseY * 10, 0);
        const distance = mouseVector.distanceTo(objectPosition);

        if (distance < interactionRadius) {
            object.rotation.x = mouseY * Math.PI * sensitivity;
            object.rotation.y = mouseX * Math.PI * sensitivity;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();
