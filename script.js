// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(sunLight);

// Stars background
function addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1 });
    
    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Planet creation helper
function createPlanet(radius, color, position, emissive = false) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: emissive ? color : 0x000000,
        emissiveIntensity: emissive ? 0.7 : 0,
        shininess: 25
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = position;
    return planet;
}

// Create Sun with yellow color and emissive property
const sun = createPlanet(5, 0xffff00, 0, true);
scene.add(sun);

const planets = {
    mercury: {
        obj: createPlanet(0.8, 0x8c8c8c, 8), // Gray
        speed: 1,
        distance: 8
    },
    venus: {
        obj: createPlanet(1.2, 0xffd700, 12), // Golden yellow
        speed: 1,
        distance: 12
    },
    earth: {
        obj: createPlanet(1.5, 0x0077be, 16), // Blue
        speed: 1,
        distance: 16
    },
    mars: {
        obj: createPlanet(1.1, 0xff4500, 20), // Red-orange
        speed: 1,
        distance: 20
    },
    jupiter: {
        obj: createPlanet(3, 0xf4a460, 28), // Sandy brown
        speed: 1,
        distance: 28
    },
    saturn: {
        obj: createPlanet(2.5, 0xdeb887, 34), // Burlywood
        speed: 1,
        distance: 34
    },
    uranus: {
        obj: createPlanet(2, 0x40e0d0, 40), // Turquoise
        speed: 1,
        distance: 40
    },
    neptune: {
        obj: createPlanet(1.8, 0x4169e1, 46), // Royal blue
        speed: 1,
        distance: 46
    }
};

// Add planets to scene
Object.values(planets).forEach(planet => scene.add(planet.obj));

// Camera position
camera.position.z = 50;

// Camera Controls
const cameraPositions = {
    default: { x: 0, y: 0, z: 50 },
    top: { x: 0, y: 50, z: 0 },
    bottom: { x: 0, y: -50, z: 0 },
    left: { x: -50, y: 0, z: 0 },
    right: { x: 50, y: 0, z: 0 },
    front: { x: 0, y: 0, z: 50 },
    back: { x: 0, y: 0, z: -50 }
};

function setCameraPosition(position, duration = 1000) {
    const startPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };
    
    const startTime = Date.now();
    
    function updateCamera() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        camera.position.x = startPosition.x + (position.x - startPosition.x) * easeProgress;
        camera.position.y = startPosition.y + (position.y - startPosition.y) * easeProgress;
        camera.position.z = startPosition.z + (position.z - startPosition.z) * easeProgress;
        
        camera.lookAt(scene.position);
        
        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        }
    }
    
    updateCamera();
}

// Keyboard controls for camera views
window.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 't': // Top view
            setCameraPosition(cameraPositions.top);
            break;
        case 'b': // Bottom view
            setCameraPosition(cameraPositions.bottom);
            break;
        case 'l': // Left view
            setCameraPosition(cameraPositions.left);
            break;
        case 'r': // Right view
            setCameraPosition(cameraPositions.right);
            break;
        case 'f': // Front view
            setCameraPosition(cameraPositions.front);
            break;
        case 'k': // Back view
            setCameraPosition(cameraPositions.back);
            break;
        case 'd': // Default view
            setCameraPosition(cameraPositions.default);
            break;
    }
});

// Add double-click handler for resetting to default view
renderer.domElement.addEventListener('dblclick', () => {
    setCameraPosition(cameraPositions.default);
});

// Animation control
let isPlaying = true;

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    if (isPlaying) {
        // Rotate sun
        sun.rotation.y += 0.004;
        
        // Update planets
        Object.entries(planets).forEach(([name, planet]) => {
            const time = Date.now() * 0.001;
            planet.obj.rotation.y += 0.02 * planet.speed;
            planet.obj.position.x = Math.cos(time * 0.5 * planet.speed) * planet.distance;
            planet.obj.position.z = Math.sin(time * 0.5 * planet.speed) * planet.distance;
        });
    }
    
    renderer.render(scene, camera);
}

// Event Listeners
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Speed control
Object.keys(planets).forEach(planetName => {
    const slider = document.getElementById(planetName);
    const speedValue = slider.nextElementSibling;
    
    slider.addEventListener('input', (e) => {
        planets[planetName].speed = parseFloat(e.target.value);
        speedValue.textContent = e.target.value + 'x';
    });
});

// Play/Pause button
const togglePlayBtn = document.getElementById('togglePlay');
togglePlayBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    togglePlayBtn.textContent = isPlaying ? 'Pause' : 'Play';
});

// Theme toggle
const toggleThemeBtn = document.getElementById('toggleTheme');
toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});

// Tooltip functionality
const tooltip = document.getElementById('tooltip');
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        const planetName = Object.entries(planets).find(([_, planet]) => 
            planet.obj === object
        )?.[0];
        
        if (planetName) {
            tooltip.style.display = 'block';
            tooltip.style.left = event.clientX + 10 + 'px';
            tooltip.style.top = event.clientY + 10 + 'px';
            tooltip.textContent = planetName.charAt(0).toUpperCase() + planetName.slice(1);
        } else {
            tooltip.style.display = 'none';
        }
    } else {
        tooltip.style.display = 'none';
    }
});

// Camera controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };

    const rotationSpeed = 0.005;
    targetRotationX += deltaMove.x * rotationSpeed;
    targetRotationY += deltaMove.y * rotationSpeed;

    // Smooth camera movement
    rotationAngleX += (targetRotationX - rotationAngleX) * 0.1;
    rotationAngleY += (targetRotationY - rotationAngleY) * 0.1;

    // Calculate camera position using spherical coordinates
    const radius = camera.position.length();
    camera.position.x = radius * Math.sin(rotationAngleX) * Math.cos(rotationAngleY);
    camera.position.y = radius * Math.sin(rotationAngleY);
    camera.position.z = radius * Math.cos(rotationAngleX) * Math.cos(rotationAngleY);
    
    camera.lookAt(scene.position);

    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

// Zoom control
renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const minZoom = 20;
    const maxZoom = 100;
    
    camera.position.z = Math.max(minZoom, 
        Math.min(maxZoom, 
            camera.position.z + (e.deltaY * zoomSpeed)
        )
    );
});

// Initialize stars and start animation
addStars();
animate();
