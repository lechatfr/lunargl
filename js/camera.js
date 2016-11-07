var objCamera = {
    camera: null,
    axz: 0,
    ay: Math.PI/6,
    da: [],
    va: 0.01,
    actions: {},
    keysActions: {
        "ArrowUp": 'up',
        "ArrowDown": 'down',
        "ArrowLeft": 'left',
        "ArrowRight": 'right'
    },
    updatePosition: function () {
        var targetup = 0,
            target = objLunar.lunar;
        if (target == null) {
            targetup = 500;
            target = scene;
        }
        if (this.camera != null) {
            if (this.actions.up) this.ay += this.va;
            if (this.actions.right) this.axz -= this.va;
            if (this.actions.down) this.ay -= this.va;
            if (this.actions.left) this.axz += this.va;
            
            var ry = target.rotation.y;
            
            var pos = {
                x: target.position.x + Math.cos(this.axz) * 100,
                y: target.position.y + Math.tan(this.ay) * 100 + targetup,
                z: target.position.z + Math.sin(this.axz) * 100,
            };
            this.camera.position.set(pos.x, pos.y, pos.z);
            this.camera.lookAt(target.position);
        }
    },
    init: function (camera) {
        this.camera = camera;
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 0;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    },
};
