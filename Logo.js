import * as THREE from 'three';


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
        const loader = new THREE.TextureLoader();
        try {
            const texture = await loader.loadAsync('logo-icon.jpg');
            texture.colorSpace = THREE.SRGBColorSpace;

            const geometry = new THREE.PlaneGeometry(2.5, 2.5);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });

            this.model = new THREE.Mesh(geometry, material);

            // Add a slight tilt
            this.model.rotation.z = 0;
            this.model.rotation.x = 0;

            this.scene.add(this.model);
            console.log("Logo image loaded successfully");
        } catch (e) {
            console.error('Failed to load logo image:', e);
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
