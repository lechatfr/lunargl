var objTerrain = {
    // Heightfield parameters
    heightData: [],
    terrainMesh: null,
    landingMesh: null,
    terrainWidthExtents: 2000, //z axe
    terrainDepthExtents: 2000, //x axe
    terrainWidth: 256,
    terrainDepth: 256,
    generateHeight: function () {
        var size = this.terrainWidth * this.terrainDepth,
            data = new Uint8Array(size),
            perlin = new ImprovedNoise(),
            quality = 1,
            z = Math.random() * 100;

        this.terrainMinHeight = data[0];
        this.terrainMaxHeight = data[0];

        for (var j = 0; j < 4; j++) {
            for (var i = 0; i < size; i++) {
                var x = i % this.terrainWidth,
                    y = ~~(i / this.terrainWidth);
                data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 2.25);
            }
            quality *= 5;
        }
        return data;
    },
    getHeightAt: function (x, z) {

        var xa = Math.round(this.terrainDepth * (x + this.terrainDepthExtents/2) / this.terrainDepthExtents);
        var za = Math.round(this.terrainWidth * (z + this.terrainWidthExtents/2) / this.terrainWidthExtents) * this.terrainWidth;
        var coord = xa + za;
        var y = objTerrain.heightData[coord];
        return y;
    },
    createTerrainGraphicsAndPhysics: function () {

        // Ground
        var NoiseGen = new SimplexNoise;

        var ground_geometry = new THREE.PlaneGeometry(this.terrainWidthExtents, this.terrainDepthExtents, this.terrainWidth - 1, this.terrainDepth - 1);
        for (var i = 0; i < ground_geometry.vertices.length; i++) {
            var vertex = ground_geometry.vertices[i];
            //vertex.z = NoiseGen.noise( vertex.x / 10, vertex.y / 10 ) * 2;
            vertex.z = objTerrain.heightData[i];
        }
        ground_geometry.computeFaceNormals();
        ground_geometry.computeVertexNormals();

        var texture = new THREE.TextureLoader().load("textures/water.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);
        // Materials
        var groundMaterial = new THREE.MeshPhongMaterial({
            color: 0xE8D87F,
            map: texture
        });
        var groundPhysiMaterial = Physijs.createMaterial(
            groundMaterial,
            0.5, // high friction
            0.5 // low restitution
        );

        this.terrainMesh = new Physijs.HeightfieldMesh(
            ground_geometry,
            groundPhysiMaterial,
            0, // mass
            this.terrainWidth - 1,
            this.terrainDepth - 1
        );
        this.terrainMesh.receiveShadow = true;
        this.terrainMesh.castShadow = true;
        this.terrainMesh.rotation.x = Math.PI / -2;
        scene.add(this.terrainMesh);

        // particles
        var geometry = new THREE.Geometry();
        for (var i = 0; i < 100000; i++) {
            var vertex = new THREE.Vector3();
            vertex.x = THREE.Math.randFloatSpread(this.terrainWidthExtents);
            vertex.y = THREE.Math.randFloatSpread(10000);
            vertex.z = THREE.Math.randFloatSpread(this.terrainDepthExtents);
            geometry.vertices.push(vertex);
        }
        var particles = new THREE.Points(geometry, new THREE.PointsMaterial({
            color: 0x888888
        }));
        particles.position.set(0, 5000, 0);
        particles.material.fog = false;
        scene.add(particles);

        // landing pad
        var material = Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x333333),
                emissive: new THREE.Color(0x333333),
                //side: THREE.DoubleSide,
                shading: THREE.FlatShading
            }),
            0.5, // high friction
            0.5 // low restitution
        );
        var px, pz;
        px = Math.round(Math.random() * 200) - 100;
        pz = Math.round(Math.random() * 200) - 100;
        var alt = this.getHeightAt(px, pz) + objLunar.objectSize * 1.5;
        var sizefactor = 10;
        var geometry = new THREE.BoxGeometry(objLunar.objectSize * sizefactor, alt, objLunar.objectSize * sizefactor, 1, 1, 1);
        this.landingMesh = new Physijs.BoxMesh(geometry, material, 0);
        this.landingMesh.receiveShadow = true;
        this.landingMesh.castShadow = true;
        this.landingMesh.position.set(px, alt / 2, pz);
        scene.add(this.landingMesh);

    },
    init: function () {
        this.heightData = this.generateHeight();
        //graphics
        this.createTerrainGraphicsAndPhysics();
    },
};
