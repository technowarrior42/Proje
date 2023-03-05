import * as THREE from "three";

import { World } from "./World";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "dat.gui";

// Renderer oluştur
const renderer = new THREE.WebGLRenderer();

// Ekran boyutunu gir
renderer.setSize(window.innerWidth, window.innerHeight);

// Renderer'ı gir
document.body.appendChild(renderer.domElement);

// Sahne oluştur
const scene = new THREE.Scene();

// Uzay rengini gir
scene.background = new THREE.Color(0, 192, 255);

// Kamerayı oluştur
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

// Kamerayı uzayda hareket ettir
const orbitControl = new OrbitControls(camera, renderer.domElement);

// Gui oluştur
const gui = new GUI();

// Chunk oluştur
const world = new World(scene, gui, 0, 0);

// Ambient light ekle
const ambientLight = new THREE.AmbientLight(0x333333);

scene.add(ambientLight);

// Yönlü ışık ekle
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);

scene.add(directionalLight);

// Kamera transformasyonunu güncelle
camera.position.set(0, 0, 5);
orbitControl.update();

function main()
{
    // Sahneyi çiz
    renderer.render(scene, camera);
}

// Döngü oluştur
renderer.setAnimationLoop(main);