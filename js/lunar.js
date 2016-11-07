var objLunar = {
    lunar: new THREE.Object3D(),
    dummy: new THREE.Object3D(),
    speedometer: document.getElementById('speedometer'),
    objectSize: 5,
    tick: 0,

    engineForce: 0,
    addEngineForce: 0.01,
    maxEngineForce: 1,
    vectorFactorEngineForce: 1.5,
    actions: {},
    keysActions: {
        "Space": 'acceleration',
        "Numpad0": 'acceleration',
        "Numpad8": 'zmore',
        "Numpad5": 'zless',
        "Numpad4": 'xmore',
        "Numpad6": 'xless',
        "Numpad7": 'ymore',
        "Numpad9": 'yless'
    },
    uniforms: {
        amplitude: {
            value: 0.0
        },
        explode: {
            vts: 0.0
        }
    },
    particleSystem: null,
    particleOptions: {
        position: new THREE.Vector3(0, 0, 0),
        positionRandomness: 0,
        velocity: new THREE.Vector3(0, -1, 0),
        velocityRandomness: 1,
        color: 0xaa88ff,
        colorRandomness: .2,
        turbulence: 0,
        lifetime: 1,
        size: 0.5,
        sizeRandomness: 5
    },
    particleSpawnerOptions: {
        spawnRate: 15000,
        horizontalSpeed: 0,
        verticalSpeed: 0,
        timeScale: 1
    },
    updatePosition: function (deltaTime) {
        // doc physi.js
        //        var mesh = this.lunar;
        //        // Change the object's position
        //        mesh.position.set(0, 0, 0);
        //        mesh.__dirtyPosition = true;
        //
        //        // Change the object's rotation
        //        mesh.rotation.set(0, 90, 180);
        //        mesh.__dirtyRotation = true;
        //
        //        // You may also want to cancel the object's velocity
        //        mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
        //        mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));

        //calcul puissance moteur 
        if (this.actions.acceleration) {
            this.engineForce = (this.engineForce + this.addEngineForce < this.maxEngineForce) ? this.engineForce + this.addEngineForce : this.maxEngineForce;
        } else {
            this.engineForce = 0;
        }

        //update particule
        if (this.actions.acceleration) {
            this.particleOptions.lifetime = 2 + (2 * this.engineForce / this.maxEngineForce);
            this.particleOptions.size = 0.5 + (4.5 * this.engineForce / this.maxEngineForce);
        } else {
            this.particleOptions.lifetime = 2;
            this.particleOptions.size = 0.5;
        }
        this.updateParticles(deltaTime);

        //modification vitesse lineaire
        var p = this.lunar.position;
        var r = this.lunar.rotation;
        this.dummy.rotation.set(r.x, r.y, r.z);

        var f = new THREE.Vector3(0, this.engineForce * this.vectorFactorEngineForce, 0);
        this.dummy.localToWorld(f);

        //var fvts = new Ammo.btVector3(f.x, f.y, f.z);
        var fvts = new THREE.Vector3(f.x, f.y, f.z);
        var bvts = this.lunar.getLinearVelocity();
        bvts.add(fvts);
        this.lunar.setLinearVelocity(bvts);

        // vitesse
        var vts = new THREE.Vector3(bvts.x, bvts.y, bvts.z);
        this.speedometer.innerHTML = Math.abs(vts.length()).toFixed(1) + ' m/s';

        //modification vitesse angulaire
        var f = new THREE.Vector3(0, 0, 0);
        if (this.actions.xmore) {
            f.setX(0.1);
        }
        if (this.actions.xless) {
            f.setX(-0.1);
        }
        if (this.actions.zmore) {
            f.setZ(0.1);
        }
        if (this.actions.zless) {
            f.setZ(-0.1);
        }
        if (this.actions.ymore) {
            f.setY(0.1);
        }
        if (this.actions.yless) {
            f.setY(-0.1);
        }
        this.dummy.localToWorld(f);

        //var fvts = new Ammo.btVector3(f.x, f.y, f.z);
        var fvts = new THREE.Vector3(f.x, f.y, f.z);
        var bvts = this.lunar.getAngularVelocity();
        bvts.add(fvts);
        //(ControlModeEasy) ? bvts.setValue(f.x * 10, f.y * 10, f.z * 10): bvts.op_add(fvts);
        this.lunar.setAngularVelocity(bvts);

        if (this.actions.acceleration && HELPERS) {


            var material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(0xff0000),
                emissive: new THREE.Color(0xff0000),
                //side: THREE.DoubleSide,
                shading: THREE.FlatShading
            });
            var geometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 20, 6, 1);
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(p.x, p.y, p.z);
            mesh.rotation.set(r.x, r.y, r.z);
            scene.add(mesh);

        }

        // explosion
        this.uniforms.amplitude.value += (this.uniforms.amplitude.value < 5) ? this.uniforms.explode.vts : 0;
        if (this.uniforms.amplitude.value >= 5) simulationPause = true;


    },
    updateParticles: function (deltaTime) {
        var delta = deltaTime * this.particleSpawnerOptions.timeScale;
        //particles
        this.tick += delta;
        if (this.tick < 0) this.tick = 0;
        if (delta > 0) {
            this.particleOptions.position.x = Math.sin(this.tick * this.particleSpawnerOptions.horizontalSpeed) * 20;
            this.particleOptions.position.y = Math.sin(this.tick * this.particleSpawnerOptions.verticalSpeed) * 10;
            this.particleOptions.position.z = Math.sin(this.tick * this.particleSpawnerOptions.horizontalSpeed + this.particleSpawnerOptions.verticalSpeed) * 5;
            for (var x = 0; x < this.particleSpawnerOptions.spawnRate * delta; x++) {
                this.particleSystem.spawnParticle(this.particleOptions);
            }
        }
        this.particleSystem.update(this.tick);
    },
    createLunarGraphicsAndPhysics: function () {
        var alt = 500;
        if (objTerrain.terrainMaxHeight != 0) alt = objTerrain.terrainMaxHeight;

        //lunar mesh
        var mass = this.objectSize * 1000;
        var friction = 0.5; // high friction
        var restitution = 0.8; // low restitution

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent
        });

        var material = Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x666666),
                emissive: new THREE.Color(0x666666),
                side: THREE.DoubleSide,
                shading: THREE.FlatShading
            }),
            friction,
            restitution
        );
        var materialx = Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: new THREE.Color(0xff3333),
                emissive: new THREE.Color(0xff3333),
                side: THREE.DoubleSide,
                shading: THREE.FlatShading
            }),
            friction,
            restitution
        );
        var materialz = Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x3333ff),
                emissive: new THREE.Color(0x3333ff),
                side: THREE.DoubleSide,
                shading: THREE.FlatShading
            }),
            friction,
            restitution
        );
        // - corps
        var geometry = new THREE.BoxGeometry(this.objectSize, this.objectSize * 2 / 3, this.objectSize, 1, 1, 1);
        geometry = this.explodeLunarGeometrie(geometry);
        var group = new Physijs.BoxMesh(geometry, shaderMaterial, mass);
        group.receiveShadow = true;
        group.castShadow = true;
        group.position.set(0, 0, 0);

        var geometry = new THREE.OctahedronGeometry(this.objectSize * 2 / 3, 1);
        geometry = this.explodeLunarGeometrie(geometry);
        var mesh = new Physijs.SphereMesh(geometry, shaderMaterial);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(0, this.objectSize * 0.75 - this.objectSize * 0.2, 0);
        mesh.scale.y = 0.8;
        group.add(mesh);

        var geometry = new THREE.CylinderGeometry(this.objectSize / 10, this.objectSize * 0.6, this.objectSize * 0.2, 16, 1);
        geometry = this.explodeLunarGeometrie(geometry);
        var mesh = new Physijs.ConeMesh(geometry, shaderMaterial);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(0, -this.objectSize * 0.4, 0);
        group.add(mesh);

        // - jambes
        var xzp = this.objectSize * 0.8;
        var yp = this.objectSize * 0;
        var xzr = 0.4;
        var geometry = new THREE.CylinderGeometry(this.objectSize / 20, this.objectSize / 20, this.objectSize * 1.7, 6, 1);
        geometry = this.explodeLunarGeometrie(geometry);
        var mesh = new Physijs.CylinderMesh(geometry, materialx);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(xzp, -yp, 0);
        mesh.rotation.z = xzr;
        group.add(mesh);
        var mesh = new Physijs.CylinderMesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(-xzp, -yp, 0);
        mesh.rotation.z = -xzr;
        group.add(mesh);
        var mesh = new Physijs.CylinderMesh(geometry, materialz);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(0, -yp, xzp);
        mesh.rotation.x = -xzr;
        group.add(mesh);
        var mesh = new Physijs.CylinderMesh(geometry, materialz);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(0, -yp, -xzp);
        mesh.rotation.x = xzr;
        group.add(mesh);

        var yp = this.objectSize * 0.2;
        var xzyr = Math.PI / 2;
        var geometry = new THREE.CylinderGeometry(this.objectSize / 20, this.objectSize / 20, this.objectSize * 1.7, 6, 1);
        geometry = this.explodeLunarGeometrie(geometry);
        var mesh = new Physijs.CylinderMesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(0, -yp, 0);
        mesh.rotation.z = xzyr;
        group.add(mesh);
        var mesh = new Physijs.CylinderMesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(0, -yp, 0);
        mesh.rotation.x = -xzyr;
        group.add(mesh);

        // - pieds
        var xzp = this.objectSize * 1.15;
        var yp = this.objectSize * 0.8;
        var geometry = new THREE.CylinderBufferGeometry(this.objectSize / 7, this.objectSize / 7, this.objectSize * 0.05, 12, 1);
        var mesh = new Physijs.CylinderMesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(xzp, -yp, 0);
        group.add(mesh);
        var mesh = new Physijs.CylinderMesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(-xzp, -yp, 0);
        group.add(mesh);
        var mesh = new Physijs.CylinderMesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(0, -yp, xzp);
        group.add(mesh);
        var mesh = new Physijs.CylinderMesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(0, -yp, -xzp);
        group.add(mesh);


        // The GPU Particle system extends THREE.Object3D, and so you can use it
        // as you would any other scene graph component.	Particle positions will be
        // relative to the position of the particle system, but you will probably only need one
        // system for your whole scene
        this.particleSystem = new THREE.GPUParticleSystem({
            maxParticles: 25000,
        });
        group.add(this.particleSystem);

        this.lunar = group;

        if (HELPERS) {
            this.lunar.add(new THREE.BoxHelper(group));
            this.lunar.add(new THREE.AxisHelper(10));
        }

        this.lunar.position.set(0, alt + 10, 0);

        scene.add(this.lunar);
        scene.add(this.dummy);

    },
    explodeLunarGeometrie: function (geometry) {

        var tessellateModifier = new THREE.TessellateModifier(8);
        for (var i = 0; i < 6; i++) {
            tessellateModifier.modify(geometry);
        }
        var explodeModifier = new THREE.ExplodeModifier();
        explodeModifier.modify(geometry);
        var numFaces = geometry.faces.length;

        geometry = new THREE.BufferGeometry().fromGeometry(geometry);

        var colors = new Float32Array(numFaces * 3 * 3);
        var displacement = new Float32Array(numFaces * 3 * 3);

        var color = new THREE.Color(0x999999);
        for (var f = 0; f < numFaces; f++) {
            var index = 9 * f;
            var d = 10 * (0.5 - Math.random());
            for (var i = 0; i < 3; i++) {
                colors[index + (3 * i)] = color.r;
                colors[index + (3 * i) + 1] = color.g;
                colors[index + (3 * i) + 2] = color.b;
                displacement[index + (3 * i)] = d;
                displacement[index + (3 * i) + 1] = d;
                displacement[index + (3 * i) + 2] = d;
            }
        }

        geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('displacement', new THREE.BufferAttribute(displacement, 3));

        return geometry;
    },
    createLunarCollision: function () {
        var oLunar = this;
        this.lunar.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
            // doc physi.js
            // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
            if (objTerrain.terrainMesh === other_object) {
                console.log("vitesse d'impact : "+relative_velocity.length());
                if (relative_velocity.length() > 2) {
                    oLunar.uniforms.explode.vts = 0.1;
                    objText.init("Perdu.", 0);
                } else {
                    objText.init("Bravo.", 1);
                    simulationPause = true;
                }
            }
            if (objTerrain.landingMesh === other_object) {
                console.log("vitesse d'impact : "+relative_velocity.length());
                if (relative_velocity.length() > 10) {
                    oLunar.uniforms.explode.vts = 0.1;
                    objText.init("Perdu.", 0);
                } else {
                    objText.init("Bravo.", 1);
                    simulationPause = true;
                }
            }

        });
    },
    init: function () {

        this.createLunarGraphicsAndPhysics();
        this.createLunarCollision();

    },
};
