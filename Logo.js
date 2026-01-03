import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';

export class Logo {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Logo container ${containerId} not found`);
            return;
        }

        this.scene = new THREE.Scene();
        // Use transparent background
        this.scene.background = null;

        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.camera.position.z = 4;

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        const width = this.container.clientWidth || 60;
        const height = this.container.clientHeight || 60;

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
        dirLight.position.set(5, 5, 10);
        this.scene.add(dirLight);

        const backLight = new THREE.DirectionalLight(0xaaaaff, 1.0);
        backLight.position.set(-5, -5, -10);
        this.scene.add(backLight);

        this.model = null;
        this.loadModel();

        this.animate();
    }

    async loadModel() {
        const loader = new PLYLoader();
        try {
            const geometry = await loader.loadAsync('spoon.ply');

            // Need to compute vertex normals if they don't exist
            geometry.computeVertexNormals();

            // Create a material
            const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                metalness: 0.8,
                roughness: 0.2
            });

            this.model = new THREE.Mesh(geometry, material);

            // Center the model
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center);

            // Normalize size
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const targetSize = 2.5;
            const scale = targetSize / maxDim;
            this.model.scale.multiplyScalar(scale);

            // Add a slight tilt
            this.model.rotation.z = Math.PI / 4;
            this.model.rotation.x = Math.PI / 6;

            this.scene.add(this.model);
            console.log("Logo loaded successfully");
        } catch (e) {
            console.error('Failed to load logo model:', e);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.model) {
            // Constant rotation
            this.model.rotation.y += 0.02;

            // Gentle bobbing
            this.model.position.y = Math.sin(Date.now() * 0.002) * 0.1;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
