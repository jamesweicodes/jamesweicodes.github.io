(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function initBackground() {
        const container = document.getElementById('bg-canvas');
        if (!container || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(2, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        const innerGeo = new THREE.IcosahedronGeometry(1.4, 2);
        const innerMat = new THREE.MeshPhongMaterial({
            color: 0x020617,
            emissive: 0x011322,
            specular: 0x22d3ee,
            shininess: 100,
            flatShading: true
        });
        const innerSphere = new THREE.Mesh(innerGeo, innerMat);
        scene.add(innerSphere);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        camera.position.z = 5;
        camera.position.x = window.innerWidth > 768 ? -2.5 : 0;

        const originalVertices = [];
        const positionAttribute = geometry.getAttribute('position');
        for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positionAttribute, i);
            originalVertices.push(vertex);
        }

        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;

            const positions = geometry.getAttribute('position');
            for (let i = 0; i < positions.count; i++) {
                const p = originalVertices[i];
                const wave1 = 0.15 * Math.sin(p.x * 2 + time);
                const wave2 = 0.15 * Math.sin(p.y * 3 + time * 1.5);
                const wave3 = 0.15 * Math.sin(p.z * 2 + time * 0.5);
                positions.setXYZ(i, p.x + wave1, p.y + wave2, p.z + wave3);
            }
            positions.needsUpdate = true;

            sphere.rotation.y += 0.001;
            innerSphere.rotation.x -= 0.002;
            innerSphere.rotation.y -= 0.002;

            renderer.render(scene, camera);
        }
        animate();

        document.addEventListener('mousemove', (e) => {
            const targetY = -(e.clientY / window.innerHeight) * 2 + 1;
            const targetX = (e.clientX / window.innerWidth) * 2 - 1;
            sphere.rotation.x += targetY * 0.005;
            sphere.rotation.y += targetX * 0.005;
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.position.x = window.innerWidth > 768 ? -2.5 : 0;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(initBackground));
    } else {
        requestAnimationFrame(initBackground);
    }
})();
