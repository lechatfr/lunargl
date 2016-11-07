var objText = {
    textMesh1: null,
    group: null,
    done: false,
    height: 20,
    size: 70,
    hover: 30,
    curveSegments: 4,
    bevelThickness: 2,
    bevelSize: 1.5,
    bevelSegments: 3,
    bevelEnabled: true,
    updateposition: function () {
        if (this.group !== null) {
            this.group.position.x = objLunar.lunar.position.x;
            this.group.position.y = objLunar.lunar.position.y + 30;
            this.group.position.z = objLunar.lunar.position.z;
            this.group.lookAt(objCamera.camera.position);
        }
    },
    createText: function (text) {
        var oText = this;
        var material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x333333),
            emissive: new THREE.Color(0x333333),
            //side: THREE.DoubleSide,
            shading: THREE.FlatShading
        });
        var loader = new THREE.FontLoader();
        loader.load('fonts/helvetiker_regular.typeface.json', function (response) {
            this.font = response;
            var textGeo = new THREE.TextGeometry(text, {
                font: oText.font,
                size: oText.size,
                height: oText.height,
                curveSegments: oText.curveSegments,
                bevelThickness: oText.bevelThickness,
                bevelSize: oText.bevelSize,
                bevelEnabled: oText.bevelEnabled,
                material: 0,
                extrudeMaterial: 1
            });
            textGeo.computeBoundingBox();
            textGeo.computeVertexNormals();
            oText.textMesh1 = new THREE.Mesh(textGeo, material);
            oText.group.add(oText.textMesh1);
        });

    },
    writeText: function (font, info, color) {
        var theText = info;
        var geometry = new THREE.TextGeometry(theText, {
            font: font,
            size: 10,
            height: 5,
            curveSegments: 2
        });
        geometry.computeBoundingBox();
        var oColor = (color) ? new THREE.Color(0x006600) : new THREE.Color(0x660000);
        var centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        var material = new THREE.MeshPhongMaterial({
            color: oColor,
            emissive: oColor,
            //side: THREE.DoubleSide,
            shading: THREE.FlatShading
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = centerOffset;
        mesh.position.z = -2.5;

        this.group = new THREE.Group();
        this.group.position.y = objLunar.lunar.position.y + 30;
        this.group.add(mesh);
        scene.add(this.group);
    },
    init: function (info, color) {
        if (!this.done) {
            this.done = true;
            var loader = new THREE.FontLoader();
            loader.load('fonts/helvetiker_regular.typeface.json', function (font) {

                objText.writeText(font, info, color);

            });
        }
    }
}
