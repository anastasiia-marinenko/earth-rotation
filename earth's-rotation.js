function animate_3D_solar_system() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearAlpha(0);
    const rendererElement = renderer.domElement;

    rendererElement.style.display = 'block';
    rendererElement.style.margin = 'auto';

    document.body.appendChild(rendererElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const ellipseCurve = new THREE.EllipseCurve(
        0, 15,
        9 * 3.9, 6 * 6,
        0, Math.PI * 2,
        false,
        2 * Math.PI / 3
    );

    const ellipsePath = new THREE.Path(ellipseCurve.getPoints(100));
    const ellipseGeometry = ellipsePath.createPointsGeometry(100);
    const ellipseMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const ellipseMesh = new THREE.Line(ellipseGeometry, ellipseMaterial);

    ellipseMesh.rotation.x = 3 * Math.PI / 2;
    ellipseMesh.rotation.y = Math.PI * 6;
    ellipseMesh.position.z = -10;
    ellipseMesh.position.y += 50;
    scene.add(ellipseMesh);

    const sunGeometry = new THREE.SphereGeometry(7, 32, 32);
    const sunTexture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Map_of_the_full_sun.jpg/1280px-Map_of_the_full_sun.jpg');
    const sunMaterial = new THREE.MeshStandardMaterial({ map: sunTexture });
    sunMaterial.color.multiplyScalar(2.5);

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(-9, 55, 0);
    scene.add(sun);

    const sunLight = new THREE.PointLight(0xFFE599, 5, 100);
    sun.add(sunLight);

    const sunGlow = new THREE.Mesh(
        new THREE.SphereGeometry(8, 32, 32),
        new THREE.MeshBasicMaterial({
            color: 0xFFE400,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        })
    );
    sunGlow.position.copy(sun.position);
    scene.add(sunGlow);

    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.y += 50;
    scene.add(earthOrbit);

    const earthGeometry = new THREE.SphereGeometry(3, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('https://live.staticflickr.com/2521/3884071286_edb50f8137_b.jpg');
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);

    const semiMinorAxis_a = 9;
    const semiMinorAxis_b = 6;
    earth.position.y = semiMinorAxis_b * Math.cos(Math.PI / 3) * 2.5;
    earth.position.x = semiMinorAxis_a * 2.5;
    earth.position.z = semiMinorAxis_b * Math.sin(Math.PI) * 2.5;
    earth.name = 'earth';

    scene.add(earth);
    earthOrbit.add(earth);

    camera.position.set(0, 70, 50);
    camera.lookAt(0, 50, 0);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let animationId = null;
    let isRotating = false;

    function onClick(event) {
        event.preventDefault();

        const canvasBounds = renderer.domElement.getBoundingClientRect();

        mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
        mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(earth);

        if (intersects.length > 0 && !isRotating) {
            animateEarth();
        }
    }
    rendererElement.addEventListener('click', onClick, false);

    function animateEarth() {
        animationId = requestAnimationFrame(animateEarth);
        earthOrbit.rotation.y += 0.01;
        earth.rotation.y += 0.02;
        renderer.render(scene, camera);
        isRotating = true;
    }

    function animate() {
        animationId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

    function onResize() {
        const scale = window.devicePixelRatio;
        const width = window.innerWidth / scale;
        const height = window.innerHeight / scale;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.setPixelRatio(scale);
    }

    window.addEventListener('resize', onResize);
    onResize();

    rendererElement.addEventListener('dblclick', function () {
        stopAnimation();
    });

    function stopAnimation() {
        cancelAnimationFrame(animationId);
        animationId = null;
        isRotating = false;
    }
}