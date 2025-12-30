import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SimplexNoise } from './noise.js';

class AmazingApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.controls = null;
        this.monster = null;
        this.bunny = null;
        
        // Light circles for characters
        this.monsterLightCircle = null;
        this.bunnyLightCircle = null;
        
        // Sound system
        this.sounds = {};
        this.audioContext = null;
        this.audioInitialized = false;
        
        // Enhanced game features
        this.particles = [];
        this.powerUps = [];
        this.screenShake = { intensity: 0, duration: 0 };
        this.cameraOriginalPosition = new THREE.Vector3();
        
        this.gameState = {
            score: 0,
            gameActive: false,
            monsterSpeed: 0.035, // Faster base speed
            lastDodge: 0,
            combo: 0,
            powerUpActive: false,
            excitement: 0,
            isIt: false, // true = Bunny (player) has the "potato"
            timeRemaining: 60,
            tagCooldown: 0,
            hasPlayed: false
        };
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.noise = new SimplexNoise();
        
        this.init();
    }

    async init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createPostProcessing();
        this.createLighting();
        this.createEnvironment();
        this.generateEnvironmentMap();
        this.createControls();
        this.createUI();
        this.createTargetMarker();
        await this.loadModels();

        // Remove loading screen
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.remove();
            });
        }

        this.createLightCircles();
        this.initSoundSystem();
        this.setupEventListeners();
        this.startGameLoop();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        
        // Set natural sky color as fallback
        this.scene.background = new THREE.Color(0x87ceeb);
        
        // Add atmospheric fog for depth and realism
        this.scene.fog = new THREE.Fog(0xa0c4e8, 20, 80);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 12);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        this.cameraOriginalPosition.copy(this.camera.position);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        document.getElementById('viewer-container').appendChild(this.renderer.domElement);
    }

    createPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom effect for magical glow
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.4, // strength
            0.2, // radius
            0.95 // threshold
        );
        this.composer.addPass(bloomPass);
        
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }

    createLighting() {
        // Enhanced ambient light for natural outdoor illumination
        this.ambientLight = new THREE.AmbientLight(0xb8e8ff, 0.6);
        this.scene.add(this.ambientLight);

        // Sun-like directional light for primary illumination
        this.sunLight = new THREE.DirectionalLight(0xffe8d4, 2.5);
        this.sunLight.position.set(8, 15, 5);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.1;
        this.sunLight.shadow.camera.far = 50;
        this.sunLight.shadow.camera.left = -25;
        this.sunLight.shadow.camera.right = 25;
        this.sunLight.shadow.camera.top = 25;
        this.sunLight.shadow.camera.bottom = -25;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);

        // Hemisphere light for sky/ground illumination balance
        this.hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a7c2a, 0.8);
        this.hemiLight.position.set(0, 20, 0);
        this.scene.add(this.hemiLight);

        // Character highlighting lights that follow the characters
        this.monsterHighlight = new THREE.PointLight(0xff4080, 1.5, 8);
        this.monsterHighlight.position.set(4, 3, 0);
        this.scene.add(this.monsterHighlight);

        this.bunnyHighlight = new THREE.PointLight(0x80ff40, 1.0, 6);
        this.bunnyHighlight.position.set(0, 2, 2);
        this.scene.add(this.bunnyHighlight);

        // Soft fill light to reduce harsh shadows
        this.fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        this.fillLight.position.set(-8, 10, -5);
        this.scene.add(this.fillLight);

        // Dramatic SpotLight that follows action
        this.spotLight = new THREE.SpotLight(0xffaa00, 500);
        this.spotLight.position.set(0, 20, 0);
        this.spotLight.angle = Math.PI / 6;
        this.spotLight.penumbra = 0.5;
        this.spotLight.decay = 2;
        this.spotLight.distance = 50;
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = 1024;
        this.spotLight.shadow.mapSize.height = 1024;
        this.spotLight.shadow.bias = -0.0001;
        this.scene.add(this.spotLight);
        this.spotLight.target.position.set(0, 0, 0);
        this.scene.add(this.spotLight.target);
    }

    generateEnvironmentMap() {
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        // Generate environment map from the current scene (sky, ground, hills)
        // This captures the procedural sky and grass for realistic reflections
        this.scene.environment = pmremGenerator.fromScene(this.scene, 0.04).texture;

        pmremGenerator.dispose();
    }

    createEnvironment() {
        // Create uneven terrain
        this.createTerrain();
        
        // Create beautiful sky background
        this.createSkyBackground();
        
        // Add environmental elements
        this.createBackgroundElements();
    }

    getTerrainHeight(x, z) {
        // Base terrain noise
        let height = this.noise.noise2D(x * 0.05, z * 0.05) * 2;
        // Detailed noise
        height += this.noise.noise2D(x * 0.2, z * 0.2) * 0.5;

        // Flatten center area for gameplay
        const dist = Math.sqrt(x*x + z*z);
        if (dist < 8) {
            height *= THREE.MathUtils.smoothstep(dist, 0, 8) * 0.2; // Smoothly flatten
        }

        return height;
    }

    createTerrain() {
        const size = 60;
        const segments = 100;
        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

        const positionAttribute = geometry.attributes.position;
        const colors = [];
        const colorAttr = new THREE.BufferAttribute(new Float32Array(positionAttribute.count * 3), 3);

        const baseColor = new THREE.Color(0x2a0a4a); // Dark Purple
        const highColor = new THREE.Color(0x4a4a5a); // Greyish Purple
        const lowColor = new THREE.Color(0x1a1a2e); // Dark Blue/Black

        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const z = positionAttribute.getY(i); // Plane is laid out X, Y, but we rotate it later

            // Note: Since we rotate X by -PI/2, the Y of the geometry becomes Z in world space
            // And Z of geometry becomes Y (height) in world space
            // We pass -z to match the world coordinate system where +Z is towards the camera
            // but the rotated plane's +Y points to world -Z
            const height = this.getTerrainHeight(x, -z);

            positionAttribute.setZ(i, height);

            // Slope calculation for coloring
            // Simple approximation using height
            let color = baseColor.clone();

            if (height > 1.5) {
                // Higher areas are rockier
                color.lerp(highColor, (height - 1.5) / 2);
            } else if (height < -0.5) {
                // Lower areas might be dirtier
                color.lerp(lowColor, 0.5);
            }

            colors.push(color.r, color.g, color.b);
        }

        geometry.computeVertexNormals();
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    createSkyBackground() {
        // Create gradient sky using a large sphere
        const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vWorldPosition;
                
                // Simple noise function
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }

                float noise(vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
                }

                void main() {
                    vec3 direction = normalize(vWorldPosition);
                    float elevation = direction.y;
                    
                    // Improved gradient
                    vec3 horizonColor = vec3(0.1, 0.0, 0.2); // Dark purple
                    vec3 zenithColor = vec3(0.0, 0.0, 0.1); // Deep dark blue
                    vec3 sunsetColor = vec3(0.5, 0.0, 0.5); // Purple neon
                    
                    // Add time-based color variation
                    float dayTime = sin(time * 0.05); // Slow day cycle

                    // Mix sunset color near horizon
                    vec3 skyBase = mix(horizonColor, zenithColor, smoothstep(0.0, 0.5, elevation));
                    skyBase = mix(skyBase, sunsetColor, smoothstep(-0.1, 0.2, elevation) * (0.5 + 0.5 * dayTime));
                    
                    // Add procedural clouds (more like nebulae)
                    float cloudNoise = noise(direction.xz * 3.0 + time * 0.05);
                    cloudNoise += noise(direction.xz * 6.0 + time * 0.05) * 0.5;
                    
                    // Soften clouds and limit to upper sky
                    float cloudDensity = smoothstep(0.4, 0.8, cloudNoise) * smoothstep(0.0, 0.3, elevation);

                    vec3 skyColor = mix(skyBase, vec3(0.8, 0.0, 0.8), cloudDensity * 0.4); // Pinkish nebulae
                    
                    gl_FragColor = vec4(skyColor, 1.0);
                }
            `,
            uniforms: {
                time: { value: 0 }
            },
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        this.skyMaterial = skyMaterial;
    }

    createBackgroundElements() {
        // Create trees
        this.createTrees();

        // Create rocks
        this.createRocks();

        // Create floating orbs in the background
        const orbCount = 20;
        const orbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        
        for (let i = 0; i < orbCount; i++) {
            const orbMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
                emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.1),
                transparent: true,
                opacity: 0.6
            });

            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            // Place orbs relative to terrain height
            const x = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            const h = this.getTerrainHeight(x, z);

            orb.position.set(
                x,
                h + 2 + Math.random() * 8,
                z
            );

            orb.userData = {
                originalPosition: orb.position.clone(),
                floatSpeed: 0.5 + Math.random() * 1.5,
                floatOffset: Math.random() * Math.PI * 2
            };

            this.scene.add(orb);
            
            // Store reference for animation
            if (!this.backgroundOrbs) this.backgroundOrbs = [];
            this.backgroundOrbs.push(orb);
        }

        // Create distant mountains/hills using geometry
        this.createDistantHills();
    }

    createTrees() {
        const treeCount = 40;
        const treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 1.5, 8);
        const treeLeavesGeo = new THREE.ConeGeometry(1.5, 3, 8);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4d3319 });
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2d4c1e });

        for (let i = 0; i < treeCount; i++) {
            const x = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;

            // Don't place trees in the center area
            if (Math.sqrt(x*x + z*z) < 10) continue;

            const h = this.getTerrainHeight(x, z);

            const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
            const leaves = new THREE.Mesh(treeLeavesGeo, leavesMat);

            trunk.position.set(x, h + 0.75, z);
            trunk.castShadow = true;
            trunk.receiveShadow = true;

            leaves.position.set(0, 1.5, 0); // Relative to trunk
            leaves.castShadow = true;
            leaves.receiveShadow = true;

            trunk.add(leaves);

            // Random scaling
            const scale = 0.8 + Math.random() * 0.6;
            trunk.scale.set(scale, scale, scale);

            // Random rotation
            trunk.rotation.y = Math.random() * Math.PI;

            this.scene.add(trunk);
        }
    }

    createRocks() {
        const rockCount = 30;
        const rockGeo = new THREE.DodecahedronGeometry(0.5);
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.8
        });

        for (let i = 0; i < rockCount; i++) {
            const x = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;

             // Don't place rocks in the immediate center
            if (Math.sqrt(x*x + z*z) < 5) continue;

            const h = this.getTerrainHeight(x, z);

            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(x, h + 0.2, z);

            // Random scaling
            const scale = 0.5 + Math.random() * 1.5;
            rock.scale.set(scale, scale * 0.7, scale);

            // Random rotation
            rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            rock.castShadow = true;
            rock.receiveShadow = true;

            this.scene.add(rock);
        }
    }

    createDistantHills() {
        const hillCount = 12;
        const hillGeometry = new THREE.ConeGeometry(10, 8, 8);
        
        for (let i = 0; i < hillCount; i++) {
            const hillMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(0.3 + Math.random() * 0.2, 0.4, 0.3 + Math.random() * 0.2),
                transparent: true,
                opacity: 0.9 // Increased opacity for better look
            });

            const hill = new THREE.Mesh(hillGeometry, hillMaterial);

            // Place further out
            const angle = Math.random() * Math.PI * 2;
            const dist = 35 + Math.random() * 20;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const h = this.getTerrainHeight(x, z); // Base height

            hill.position.set(x, h - 2, z); // Sink it a bit
            
            hill.scale.set(
                1 + Math.random() * 2,
                0.5 + Math.random() * 1.5,
                1 + Math.random() * 2
            );

            hill.receiveShadow = true;
            this.scene.add(hill);
        }
    }

    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 25;
        this.controls.maxPolarAngle = Math.PI * 0.8;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    createUI() {
        // Create game UI
        const ui = document.createElement('div');
        ui.id = 'game-ui';
        ui.innerHTML = `
            <div class="ui-panel">
                <div class="status-message" id="status-message" role="status" aria-live="polite" style="color: #ff6b6b; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 10px;">READY?</div>
                <div class="score">Time Left: <span id="timer">60</span>s</div>
                <div class="score">Score: <span id="score">0</span></div>
                <div class="power-up-status" id="power-up-status" role="alert" style="display: none;">
                    ⚡ SPEED BOOST ACTIVE!
                </div>
                <div class="controls">
                    <button id="start-chase" aria-label="Start Game">🏃 START GAME</button>
                    <button id="mute-sound" aria-label="Toggle Sound" title="Toggle Sound" aria-pressed="false">🔊 Mute</button>
                </div>
                <div class="instructions">
                    🎯 <b>TAG / HOT POTATO</b><br>
                    🔥 If you are red (IT), TAP to tag the monster!<br>
                    🏃 If you are blue, RUN away to gain points!<br>
                    ⏱️ Don't hold the potato when time runs out!
                </div>
            </div>
        `;
        document.body.appendChild(ui);
    }

    async loadModels() {
        // Load monster with enhancements
        const loader = new GLTFLoader();
        try {
            const gltf = await loader.loadAsync('3D_Purple_Monster.glb');
            this.monster = gltf.scene;

            this.monster.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    if (node.material) {
                        node.material.envMapIntensity = 1.5;
                        node.material.needsUpdate = true;
                    }
                }
            });

            // Center and scale monster
            const box = new THREE.Box3().setFromObject(this.monster);
            const center = box.getCenter(new THREE.Vector3());
            this.monster.position.sub(center);

            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            this.monster.scale.multiplyScalar(scale);

            this.monster.position.set(4, 0, 0);
            this.monster.userData = {
                originalPosition: this.monster.position.clone(),
                velocity: new THREE.Vector3(),
                targetPosition: new THREE.Vector3(4, 0, 0),
                isChasing: false,
                frustration: 0,
                yOffset: (size.y * scale) / 2
            };
            
            this.scene.add(this.monster);
        } catch (error) {
            console.error('Error loading monster model:', error);
        }

        // Load bunny model
        try {
            const bunnyGltf = await loader.loadAsync('Woven_Bunny_Doll.glb'); 
            this.bunny = bunnyGltf.scene;

            this.bunny.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    if (node.material) {
                        if (node.material.clone && typeof node.material.envMapIntensity !== 'undefined') {
                            node.material = node.material.clone();
                            node.material.envMapIntensity = 1.5;
                        } else if (typeof node.material.envMapIntensity !== 'undefined') {
                            node.material.envMapIntensity = 1.5;
                        }
                        node.material.needsUpdate = true;
                    }
                }
            });

            // Center and scale bunny
            const bunnyBox = new THREE.Box3().setFromObject(this.bunny);
            const bunnyCenter = bunnyBox.getCenter(new THREE.Vector3());
            this.bunny.position.sub(bunnyCenter);

            const bunnySize = bunnyBox.getSize(new THREE.Vector3());
            const desiredHeight = 1.5;
            let bunnyScale = 1;
            if (bunnySize.y > 0) {
                bunnyScale = desiredHeight / bunnySize.y;
            }
            this.bunny.scale.set(bunnyScale, bunnyScale, bunnyScale);

            this.bunny.position.set(0, 0, 2);

            this.bunny.userData = {
                originalPosition: this.bunny.position.clone(),
                velocity: new THREE.Vector3(),
                targetPosition: new THREE.Vector3(0, 0, 2),
                yOffset: desiredHeight / 2
            };

            this.scene.add(this.bunny);
            console.log('Bunny model loaded and added to scene successfully.');
        } catch (error) {
            console.error('Error loading bunny model:', error);
        }
    }

    createTargetMarker() {
        const geometry = new THREE.RingGeometry(0.3, 0.5, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        this.targetMarker = new THREE.Mesh(geometry, material);
        this.targetMarker.rotation.x = -Math.PI / 2;
        this.targetMarker.visible = false;
        this.scene.add(this.targetMarker);
    }

    createLightCircles() {
        // Monster light circle (red/purple)
        const monsterCircleGeometry = new THREE.RingGeometry(1.5, 2.2, 32);
        const monsterCircleMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0080,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        this.monsterLightCircle = new THREE.Mesh(monsterCircleGeometry, monsterCircleMaterial);
        this.monsterLightCircle.rotation.x = -Math.PI / 2;
        this.scene.add(this.monsterLightCircle);

        // Bunny light circle (green/yellow)
        const bunnyCircleGeometry = new THREE.RingGeometry(0.8, 1.3, 32);
        const bunnyCircleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FF80,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide
        });
        this.bunnyLightCircle = new THREE.Mesh(bunnyCircleGeometry, bunnyCircleMaterial);
        this.bunnyLightCircle.rotation.x = -Math.PI / 2;
        this.scene.add(this.bunnyLightCircle);
    }

    async initSoundSystem() {
        try {
            // Initialize audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create sound effects using Web Audio API
            this.sounds = {
                chaseStart: this.createSound([440, 880, 1320], 0.5, 'sawtooth'),
                dodge: this.createSound([880, 1760, 2640], 0.3, 'sine'),
                combo: this.createSound([1320, 1760, 2200], 0.4, 'triangle'),
                powerUp: this.createSound([660, 880, 1100, 1320], 0.6, 'square'),
                background: this.createAmbientSound(),
                monster: this.createSound([220, 110, 165], 0.2, 'sawtooth'),
                sparkle: this.createSound([2640, 3520, 4400], 0.1, 'sine')
            };
            
            this.audioInitialized = true;
            console.log('Sound system initialized!');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    createSound(frequencies, volume = 0.3, waveType = 'sine') {
        return {
            play: (duration = 0.3) => {
                if (!this.audioInitialized) return;
                
                try {
                    const gainNode = this.audioContext.createGain();
                    gainNode.connect(this.audioContext.destination);
                    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

                    frequencies.forEach((freq, index) => {
                        const oscillator = this.audioContext.createOscillator();
                        oscillator.connect(gainNode);
                        oscillator.type = waveType;
                        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                        oscillator.start(this.audioContext.currentTime + index * 0.1);
                        oscillator.stop(this.audioContext.currentTime + duration);
                    });
                } catch (error) {
                    console.warn('Sound playback failed:', error);
                }
            }
        };
    }

    createAmbientSound() {
        return {
            start: () => {
                if (!this.audioInitialized) return;
                
                try {
                    const gainNode = this.audioContext.createGain();
                    gainNode.connect(this.audioContext.destination);
                    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);

                    // Create multiple oscillators for ambient texture
                    [80, 120, 160, 200].forEach((freq, index) => {
                        const oscillator = this.audioContext.createOscillator();
                        oscillator.connect(gainNode);
                        oscillator.type = 'sine';
                        oscillator.frequency.setValueAtTime(freq + Math.sin(Date.now() * 0.001) * 5, this.audioContext.currentTime);
                        oscillator.start();
                        
                        setTimeout(() => {
                            try {
                                oscillator.stop();
                            } catch (e) {}
                        }, 30000); // 30 seconds
                    });
                } catch (error) {
                    console.warn('Ambient sound failed:', error);
                }
            }
        };
    }

    createPowerUp() {
        const powerUpGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const powerUpMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.8
        });
        
        const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
        const x = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 12;
        const h = this.getTerrainHeight(x, z);

        powerUp.position.set(
            x,
            h + 1,
            z
        );
        
        powerUp.userData = {
            type: 'speed',
            collected: false,
            rotationSpeed: 0.1,
            bobSpeed: 0.05,
            originalY: powerUp.position.y
        };
        
        this.powerUps.push(powerUp);
        this.scene.add(powerUp);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (!powerUp.userData.collected) {
                this.scene.remove(powerUp);
                this.powerUps = this.powerUps.filter(p => p !== powerUp);
            }
        }, 10000);
    }

    createScreenShake(intensity = 0.1, duration = 0.3) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
        this.cameraOriginalPosition.copy(this.camera.position);
    }

    createMagicalParticles(position, count = 15, color = 0x00FFFF) {
        for (let i = 0; i < count; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.02, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 1
                })
            );
            
            particle.position.copy(position);
            particle.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                Math.random() * 2,
                (Math.random() - 0.5) * 3
            ));
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * 0.3 + 0.1,
                    (Math.random() - 0.5) * 0.3
                ),
                life: 1.0,
                gravity: -0.01
            };
            
            this.particles.push(particle);
            this.scene.add(particle);
        }
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        });

        // Game controls
        const startBtn = document.getElementById('start-chase');
        if(startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        document.getElementById('mute-sound').addEventListener('click', (e) => {
            if (this.audioContext) {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                    e.target.textContent = '🔊 Mute';
                    e.target.setAttribute('aria-pressed', 'false');
                } else {
                    this.audioContext.suspend();
                    e.target.textContent = '🔇 Unmute';
                    e.target.setAttribute('aria-pressed', 'true');
                }
            }
        });

        // Mouse tracking for interactions
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Click interaction for bunny movement
        window.addEventListener('pointerdown', (event) => {
            // Update mouse coordinates for raycaster
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);

            if (this.ground) {
                const intersects = this.raycaster.intersectObject(this.ground);

                if (intersects.length > 0) {
                    const point = intersects[0].point;

                    if (this.bunny) {
                        this.bunny.userData.targetPosition.copy(point);
                        this.bunny.userData.lastUserInteractionTime = this.clock.getElapsedTime();

                        // Show marker
                        if (this.targetMarker) {
                            this.targetMarker.position.copy(point);
                            this.targetMarker.position.y += 0.05;
                            this.targetMarker.visible = true;

                            if (this.targetMarkerTimeout) clearTimeout(this.targetMarkerTimeout);
                            this.targetMarkerTimeout = setTimeout(() => {
                                this.targetMarker.visible = false;
                            }, 1000);
                        }

                        this.createSparkleEffect(point);
                        console.log("User interaction at:", point);
                    }
                }
            }
        });
    }

    startGame() {
        this.gameState.hasPlayed = true;
        this.gameState.gameActive = true;
        this.gameState.score = 0;
        this.gameState.combo = 0;
        this.gameState.excitement = 0;
        this.gameState.timeRemaining = 60;
        this.gameState.isIt = false; // Monster starts as IT
        this.gameState.tagCooldown = 0;

        // Minimize UI during chase
        const uiPanel = document.querySelector('.ui-panel');
        if (uiPanel) {
            uiPanel.classList.add('minimized');
        }

        this.updateUI();
        
        if (this.monster) {
            this.monster.userData.isChasing = true; // Use this to enable movement logic
        }
        
        // Play chase start sound
        if (this.sounds.chaseStart) {
            this.sounds.chaseStart.play(1.0);
        }
        
        // Start ambient background sound
        if (this.sounds.background) {
            this.sounds.background.start();
        }
        
        // Create initial power-up
        this.createPowerUp();
        
        // Screen shake for drama
        this.createScreenShake(0.05, 0.5);
        
        // Disable auto-rotate during chase
        this.controls.autoRotate = false;
    }



    createSparkleEffect(position) {
        const sparkleCount = 10; // Changed from 20
        const sparkles = [];
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05),
                new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(Math.random(), 1, 0.8),
                    transparent: true,
                    opacity: 1
                })
            );
            
            sparkle.position.copy(position);
            sparkle.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ));
            
            sparkle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.2,
                    (Math.random() - 0.5) * 0.2
                ),
                life: 1.0
            };
            
            sparkles.push(sparkle);
            this.scene.add(sparkle);
        }
        
        // Animate sparkles
        const animateSparkles = () => {
            sparkles.forEach((sparkle, index) => {
                sparkle.position.add(sparkle.userData.velocity);
                sparkle.userData.life -= 0.04; // Changed from 0.02
                sparkle.material.opacity = sparkle.userData.life;
                
                if (sparkle.userData.life <= 0) {
                    this.scene.remove(sparkle);
                    sparkles.splice(index, 1);
                }
            });
            
            if (sparkles.length > 0) {
                requestAnimationFrame(animateSparkles);
            }
        };
        
        animateSparkles();
    }

    createSuccessFlash() {
        const flash = document.createElement('div');
        flash.className = 'success-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 300);
    }

    createFloatingScore(points) {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'floating-score';
        scoreElement.textContent = `+${points}`;
        scoreElement.style.left = Math.random() * (window.innerWidth - 100) + 'px';
        scoreElement.style.top = Math.random() * (window.innerHeight - 100) + 100 + 'px';
        
        document.body.appendChild(scoreElement);
        
        setTimeout(() => {
            if (document.body.contains(scoreElement)) {
                document.body.removeChild(scoreElement);
            }
        }, 2000);
    }

    createComboEffect() {
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-multiplier';
        comboElement.textContent = `${this.gameState.combo}x COMBO!`;
        
        document.body.appendChild(comboElement);
        
        setTimeout(() => {
            if (document.body.contains(comboElement)) {
                document.body.removeChild(comboElement);
            }
        }, 1000);
    }

    updateUI() {
        const scoreEl = document.getElementById('score');
        const timerEl = document.getElementById('timer');
        const statusEl = document.getElementById('status-message');
        const startBtn = document.getElementById('start-chase');

        if (scoreEl) scoreEl.textContent = this.gameState.score;
        if (timerEl) timerEl.textContent = Math.ceil(this.gameState.timeRemaining);
        
        if (statusEl) {
            if (!this.gameState.gameActive) {
                statusEl.textContent = "GAME OVER";
                statusEl.style.color = "#ffffff";
                if(startBtn) {
                    startBtn.style.display = 'block';
                    if (this.gameState.hasPlayed) {
                        startBtn.textContent = "🔄 PLAY AGAIN";
                        startBtn.setAttribute('aria-label', 'Play Again');
                    }
                }
            } else {
                if(startBtn) startBtn.style.display = 'none';
                if (this.gameState.isIt) {
                    statusEl.textContent = "🔥 YOU ARE IT! CATCH HIM!";
                    statusEl.style.color = "#ff4500";
                } else {
                    statusEl.textContent = "🏃 RUN! AVOID THE MONSTER!";
                    statusEl.style.color = "#4ecdc4";
                }
            }
        }

        // Show/hide power-up status
        const powerUpStatus = document.getElementById('power-up-status');
        if (this.gameState.powerUpActive) {
            powerUpStatus.style.display = 'block';
            powerUpStatus.style.animation = 'pulse 0.5s ease-in-out infinite alternate';
        } else {
            powerUpStatus.style.display = 'none';
        }
    }

    startGameLoop() {
        setInterval(() => {
            this.updateGameLogic();
        }, 16); // ~60 FPS
    }

    updateGameLogic() {
        const time = this.clock.getElapsedTime();
        const now = Date.now();

        // Game Timer Logic
        if (this.gameState.gameActive) {
            if (this.gameState.timeRemaining > 0) {
                this.gameState.timeRemaining -= 0.016; // approx 60fps
                if (this.gameState.timeRemaining < 0) this.gameState.timeRemaining = 0;

                // Score accumulates if you are NOT IT
                if (!this.gameState.isIt) {
                    this.gameState.score += 1;
                }
            } else {
                this.gameState.gameActive = false;
                this.createFloatingScore("GAME OVER!");
                // Show game over UI or reset
                setTimeout(() => {
                    const uiPanel = document.querySelector('.ui-panel');
                    if (uiPanel) uiPanel.classList.remove('minimized');
                    // Move focus to start button for accessibility
                    const startBtn = document.getElementById('start-chase');
                    if (startBtn) startBtn.focus();
                }, 2000);
            }
            this.updateUI();
        }

        // --- Visual Updates ---

        // Update SpotLight
        if (this.spotLight) {
            const targetPos = new THREE.Vector3();
            if (this.bunny && this.monster) {
                targetPos.addVectors(this.bunny.position, this.monster.position).multiplyScalar(0.5);
            } else if (this.monster) {
                targetPos.copy(this.monster.position);
            } else if (this.bunny) {
                targetPos.copy(this.bunny.position);
            }
            this.spotLight.target.position.lerp(targetPos, 0.05);

            // Change spotlight color based on who is it
            if (this.gameState.isIt) {
                this.spotLight.color.setHex(0xFF0000); // Red alert if Player is It
            } else {
                this.spotLight.color.setHex(0x00AAFF); // Calm blue if Safe
            }
        }

        // Update Light Circles
        if (this.monster && this.monsterLightCircle) {
            this.monsterLightCircle.position.copy(this.monster.position);
            this.monsterLightCircle.position.y = -0.1;
            this.monsterLightCircle.rotation.z -= 0.03;
            
            // If Monster is IT, it glows RED/ORANGE. If Safe, it glows Blue/Green?
            // Actually, let's stick to "IT" = RED.
            if (!this.gameState.isIt) { // Monster IS IT
                this.monsterLightCircle.material.color.setHex(0xFF4500); // OrangeRed
                this.monsterLightCircle.material.opacity = 0.6 + Math.sin(time * 10) * 0.2; // Pulse fast
            } else { // Monster is Safe
                this.monsterLightCircle.material.color.setHex(0x00FF80); // Greenish
                this.monsterLightCircle.material.opacity = 0.3;
            }
        }

        if (this.bunny && this.bunnyLightCircle) {
            this.bunnyLightCircle.position.copy(this.bunny.position);
            this.bunnyLightCircle.position.y = -0.1;
            this.bunnyLightCircle.rotation.z += 0.01;

            if (this.gameState.isIt) { // Bunny IS IT
                this.bunnyLightCircle.material.color.setHex(0xFF0000); // RED
                this.bunnyLightCircle.material.opacity = 0.6 + Math.sin(time * 10) * 0.2;
            } else {
                this.bunnyLightCircle.material.color.setHex(0x00AAFF); // Blue
                this.bunnyLightCircle.material.opacity = 0.3;
            }
        }

        // Update particles
        this.particles.forEach((particle, index) => {
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.y += particle.userData.gravity;
            particle.userData.life -= 0.02;
            particle.material.opacity = particle.userData.life;
            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(index, 1);
            }
        });

        // Update Powerups
        this.powerUps.forEach((powerUp, index) => {
            powerUp.rotation.y += powerUp.userData.rotationSpeed;
            powerUp.position.y = powerUp.userData.originalY + Math.sin(time * 3 + index) * 0.3;
            if (this.bunny && !powerUp.userData.collected) {
                const distance = powerUp.position.distanceTo(this.bunny.position);
                if (distance < 1) {
                    powerUp.userData.collected = true;
                    this.collectPowerUp(powerUp);
                    this.scene.remove(powerUp);
                    this.powerUps.splice(index, 1);
                }
            }
        });

        // --- Character Movement ---

        if (this.bunny && this.bunny.userData) {
            const timeSinceInteraction = time - (this.bunny.userData.lastUserInteractionTime || 0);
            const isUserControlled = timeSinceInteraction < 3.0;

            // Smoothly move bunny towards its target position
            this.bunny.position.x = THREE.MathUtils.lerp(this.bunny.position.x, this.bunny.userData.targetPosition.x, 0.04); // Faster response
            this.bunny.position.z = THREE.MathUtils.lerp(this.bunny.position.z, this.bunny.userData.targetPosition.z, 0.04);

            const terrainHeight = this.getTerrainHeight(this.bunny.position.x, this.bunny.position.z);
            const yOffset = this.bunny.userData.yOffset || 0.75;
            this.bunny.position.y = terrainHeight + yOffset + (Math.sin(time * 2.5) * 0.15);

            this.bunny.position.x = Math.max(-10, Math.min(10, this.bunny.position.x));
            this.bunny.position.z = Math.max(-10, Math.min(10, this.bunny.position.z));
        }

        if (this.monster) {
            const monsterTerrainHeight = this.getTerrainHeight(this.monster.position.x, this.monster.position.z);
            const monsterYOffset = this.monster.userData.yOffset || 1.0;
            this.monster.position.y = monsterTerrainHeight + monsterYOffset;
        }

        if (!this.gameState.gameActive || !this.bunny || !this.monster) return;

        // --- Collision / Tag Logic ---
        const dist = this.bunny.position.distanceTo(this.monster.position);
        if (dist < 1.5) {
            if (now > this.gameState.tagCooldown) {
                // TAG!
                this.gameState.isIt = !this.gameState.isIt; // Swap
                this.gameState.tagCooldown = now + 1000; // 1 second cooldown

                // Visual/Audio Feedback
                this.createScreenShake(0.2, 0.2);
                this.createMagicalParticles(this.bunny.position, 20, 0xFFFFFF);
                if (this.sounds.combo) this.sounds.combo.play(0.5); // Use combo sound for tag

                if (this.gameState.isIt) {
                    this.createFloatingScore("YOU ARE IT!");
                } else {
                    this.createFloatingScore("RUN!");
                }
                this.updateUI();
            }
        }

        // --- Monster AI ---
        const speedMultiplier = 1 + (this.gameState.excitement / 200);
        const baseSpeed = this.gameState.monsterSpeed * speedMultiplier;
        
        let targetPos = new THREE.Vector3();

        // Look ahead distance to compensate for lerp smoothing
        // Since we lerp with 0.1, we need to aim 10x further to achieve baseSpeed
        const lookAhead = baseSpeed * 10;

        // Debug logging
        // console.log(`Monster Speed: ${baseSpeed}, LookAhead: ${lookAhead}, Pos: ${this.monster.position.x.toFixed(2)}`);

        if (!this.gameState.isIt) {
            // Monster is IT -> CHASE Bunny
            const direction = new THREE.Vector3()
                .subVectors(this.bunny.position, this.monster.position)
                .normalize();
            
            targetPos.copy(this.monster.position).add(direction.multiplyScalar(lookAhead));
        } else {
            // Monster is SAFE -> FLEE from Bunny
            const direction = new THREE.Vector3()
                .subVectors(this.monster.position, this.bunny.position) // Away vector
                .normalize();
            
            targetPos.copy(this.monster.position).add(direction.multiplyScalar(lookAhead * 0.8)); // Flee slightly slower?
            
            // Try to stay near center if too far
            if (this.monster.position.length() > 12) {
                targetPos.lerp(new THREE.Vector3(0,0,0), 0.05);
            }
        }

        this.monster.userData.targetPosition.copy(targetPos); // Direct update, no double smoothing
        this.monster.position.lerp(this.monster.userData.targetPosition, 0.1); // Smooth movement

        this.monster.position.x = Math.max(-12, Math.min(12, this.monster.position.x));
        this.monster.position.z = Math.max(-12, Math.min(12, this.monster.position.z));
    }

    collectPowerUp(powerUp) {
        // Play power-up sound
        if (this.sounds.powerUp) {
            this.sounds.powerUp.play(0.8);
        }
        
        // Activate power-up effect
        this.gameState.powerUpActive = true;
        this.gameState.score += 50;
        
        // Create explosion effect
        this.createMagicalParticles(powerUp.position, 30, 0xFFD700);
        this.createScreenShake(0.1, 0.4);
        
        // Show power-up message
        this.createFloatingScore("POWER UP!");
        
        // Power-up lasts 5 seconds
        setTimeout(() => {
            this.gameState.powerUpActive = false;
        }, 5000);
        
        this.updateUI();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        // Handle screen shake
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= 0.016; // Assuming 60fps
            
            if (this.screenShake.duration > 0) {
                // Apply random shake offset
                const shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
                const shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
                const shakeZ = (Math.random() - 0.5) * this.screenShake.intensity;
                
                this.camera.position.copy(this.cameraOriginalPosition);
                this.camera.position.add(new THREE.Vector3(shakeX, shakeY, shakeZ));
            } else {
                // Restore original position
                this.camera.position.copy(this.cameraOriginalPosition);
            }
        }

        // ENHANCED DYNAMIC LIGHTING SYSTEM
        if (this.ambientLight && this.monsterHighlight && this.bunnyHighlight) {
            const excitementFactor = this.gameState.excitement / 100;
            
            // Animate ambient light subtly
            this.ambientLight.intensity = 0.6 + Math.sin(time * 0.5) * 0.1;
            
            // Update character highlight positions and intensities
            if (this.monster) {
                this.monsterHighlight.position.copy(this.monster.position);
                this.monsterHighlight.position.y += 2;
                this.monsterHighlight.intensity = 1.5 + Math.sin(time * 2.5) * (0.3 + excitementFactor * 0.7);
                // Pulse more intensely during chase
                if (this.gameState.isChasing) {
                    this.monsterHighlight.intensity *= 1.5;
                }
            }
            
            if (this.bunny) {
                this.bunnyHighlight.position.copy(this.bunny.position);
                this.bunnyHighlight.position.y += 1.5;
                this.bunnyHighlight.intensity = 1.0 + Math.sin(time * 1.8) * 0.2;
            }
            
            // Animate sun light for day/night cycle effect
            if (this.sunLight) {
                this.sunLight.intensity = 2.5 + Math.sin(time * 0.1) * 0.3;
            }
        }

        // Animate sky background
        if (this.skyMaterial) {
            this.skyMaterial.uniforms.time.value = time;
        }

        // Animate grass swaying
        if (this.grassField) {
            // Simple wind effect on grass
            const windStrength = 0.1 + Math.sin(time * 0.3) * 0.05;
            this.grassField.rotation.x = Math.sin(time * 0.5) * windStrength;
        }

        // Animate background orbs
        if (this.backgroundOrbs) {
            this.backgroundOrbs.forEach((orb, index) => {
                orb.position.y = orb.userData.originalPosition.y + 
                    Math.sin(time * orb.userData.floatSpeed + orb.userData.floatOffset) * 0.5;
                orb.rotation.y += 0.01;
                orb.material.opacity = 0.6 + Math.sin(time * 2 + index) * 0.2;
            });
        }
        
        // Dynamic camera movement during chase
        if (this.gameState.isChasing && this.bunny && this.monster) {
            const distance = this.bunny.position.distanceTo(this.monster.position);
            if (distance < 4) {
                // Camera follows the action more closely
                const midPoint = new THREE.Vector3()
                    .addVectors(this.bunny.position, this.monster.position)
                    .multiplyScalar(0.5);
                
                this.controls.target.lerp(midPoint, 0.02);
            }
        }
        
        // Update controls and render
        this.controls.update();
        this.composer.render();
    }
}

// Initialize the amazing app
window.addEventListener('load', () => {
    window.app = new AmazingApp();
});
