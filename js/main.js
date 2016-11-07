$(document).ready(function () {
    // - Init -
    initGraphics();
    createObjects();
    tick();
});

// Detects webgl
if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
    document.getElementById('container').innerHTML = "";
}
/***************************************************************************************************/
/**** Global variables *****************************************************************************/
/***************************************************************************************************/
var DISABLE_DEACTIVATION = 4;
var HELPERS = false;
var ControlModeEasy = false;
var simulationPause = false;
// Graphics variables
var container, stats, speedometer;
var camera, controls, scene, renderer;
var clock = new THREE.Clock();
var materialDynamic, materialStatic, materialInteractive;
// Physics variables
var collisionConfiguration;
var dispatcher;
var broadphase;
var solver;
var softBodySolver;
var physicsWorld;
var gravityConstant = -9.82;
var syncList = [];
var time = 0;
var objectTimePeriod = 3;
var timeNextSpawn = time + objectTimePeriod;
var maxNumObjects = 30;


/***************************************************************************************************/
/**** events ***************************************************************************************/
/***************************************************************************************************/

window.addEventListener('resize', function () {
    objCamera.camera.aspect = window.innerWidth / window.innerHeight;
    objCamera.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
window.addEventListener('mouseover', function () {
    objCamera.bcameraupdate = true;
}, false);
window.addEventListener('mouseout', function () {
    objCamera.bcameraupdate = false;
}, false);
window.addEventListener('keydown', function (event) {

    //console.log(event.code);

    if (objCamera.keysActions[event.code]) {
        objCamera.actions[objCamera.keysActions[event.code]] = true;
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    if (objLunar.keysActions[event.code]) {
        objLunar.actions[objLunar.keysActions[event.code]] = true;
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
});
window.addEventListener('keyup', function (event) {

    if (objCamera.keysActions[event.code]) {
        objCamera.actions[objCamera.keysActions[event.code]] = false;
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    if (objLunar.keysActions[event.code]) {
        objLunar.actions[objLunar.keysActions[event.code]] = false;
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
});

/***************************************************************************************************/
/**** inits ****************************************************************************************/
/***************************************************************************************************/
function initGraphics() {
    //dom
    container = document.getElementById('container');
    speedometer = document.getElementById('speedometer');

    // scene
    scene = new Physijs.Scene({
        reportsize: 50,
        fixedTimeStep: 1 / 60
    });
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // camera
    objCamera.init(new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000));

    var ambientLight = new THREE.AmbientLight(0x666666);
    scene.add(ambientLight);

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(200, 500, 200);
    light.castShadow = true;
    var dLight = 1000;
    var sLight = dLight * 0.25;
    light.shadow.camera.left = -sLight;
    light.shadow.camera.right = sLight;
    light.shadow.camera.top = sLight;
    light.shadow.camera.bottom = -sLight;
    light.shadow.camera.near = dLight / 30;
    light.shadow.camera.far = dLight;
    light.shadow.mapSize.x = 1024 * 2;
    light.shadow.mapSize.y = 1024 * 2;
    scene.add(light);


    if (HELPERS) {
        /// Group Helper
        groupHelper = new THREE.Group();
        scene.add(groupHelper);

        // AxisHelper
        var helper = new THREE.AxisHelper(100);
        helper.position.set(0, 0, 0);
        groupHelper.add(helper);

        /// backgroup grids
        var helper = new THREE.GridHelper(100, 10);
        //helper.rotation.x = Math.PI / 2;
        groupHelper.add(helper);

        // dirLight
        var helper = new THREE.PointLightHelper(light, 5);
        groupHelper.add(helper);
    }

    materialDynamic = new THREE.MeshPhongMaterial({
        color: 0xfca400
    });
    materialStatic = new THREE.MeshPhongMaterial({
        color: 0x999999
    });
    materialInteractive = new THREE.MeshPhongMaterial({
        color: 0x990000
    });

    // stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.right = '0px';
    container.appendChild(stats.domElement);

}

function initPhysics() {
    
    scene.setGravity(new THREE.Vector3(0, gravityConstant, 0));

}

/***************************************************************************************************/
/**** loop *****************************************************************************************/
/***************************************************************************************************/

function tick() {
    requestAnimationFrame(tick);

    var dt = clock.getDelta();

    objCamera.updatePosition();
    objText.updateposition();
    // run physics for physi.js
    if (!simulationPause) {
        objLunar.updatePosition(dt);
        scene.simulate();
    }

    renderer.render(scene, objCamera.camera);
    stats.update();
}

/***************************************************************************************************/
/**** function *************************************************************************************/
/***************************************************************************************************/
function createObjects() {

    objTerrain.init();
    objLunar.init();

}
