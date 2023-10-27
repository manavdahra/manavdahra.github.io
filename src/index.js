import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	AmbientLight,
	Color,
	Clock,
	Vector3,
	PCFSoftShadowMap,
} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import CannonDebugger from 'cannon-es-debugger';
import * as CANNON from 'cannon-es';

import Snake from './objects/snake';
import Ground from './objects/plane';
import './style.css';

class Game {
	constructor(props) {
		this.canvasContainer = props.canvasContainer;
		this.debug = props.debug || false;

		this.scene = new Scene();
		this.scene.background = new Color('#1f2127');
		this.clock = new Clock();
		this.delta = 0;

		this.camera = new PerspectiveCamera(75, this.canvasContainer.clientWidth / this.canvasContainer.clientHeight, 1, 1000);
		this.offset = new Vector3();
		this.lookAt = new Vector3();

		this.initCannon();
		this.addRenderers();
		this.setupScene();

		document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
		document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
		window.addEventListener('resize', () => this.onWindowResize());
	}

	initCannon() {
		const world = new CANNON.World();
		world.gravity.set(0, -9.81, 0);
		world.broadphase = new CANNON.NaiveBroadphase();
		world.solver.iterations = 10;
		this.world = world;
		this.cannonDebugger = new CannonDebugger(this.scene, this.world);
	}

	setupScene() {
		this.addPlane();
		this.addSnake();
		this.addLights();
	}

	addRenderers() {
		this.stats = new Stats();
		this.stats.showPanel(0);
		this.stats.domElement.style.cssText = 'position: absolute; right: 20px; opacity: 0.9; z-index: 999';
		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		this.renderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);
		this.canvasContainer.appendChild(this.stats.dom);
		this.canvasContainer.appendChild(this.renderer.domElement);
	}

	addLights() {
		this.scene.add(new AmbientLight(0xAEAEA0, 0.1));
	}

	addSnake() {
		this.snake = new Snake({ thickness: 0.5, length: 5 });
		this.snake.parts.forEach(({ body }) => {
			this.world.addBody(body);
			this.world.addContactMaterial(new CANNON.ContactMaterial(body.material, this.plane.groundBody.material, { friction: 0.02 }));
		});
		this.snake.contraints.forEach(con => {
			this.world.addConstraint(con);
		})
		this.scene.add(this.snake);
	}

	addPlane() {
		this.plane = new Ground();
		this.scene.add(this.plane);
		this.world.addBody(this.plane.groundBody);
	}

	onWindowResize() {
		this.camera.aspect = this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);

		this.render();
	}

	run() {
		requestAnimationFrame(() => this.run());
		this.delta = this.clock.getDelta();
		this.updateCamera();

		this.updatePhysics();
		this.render();

		this.stats.update();
	}

	onKeyDown(e) {
		this.snake.setState(e.code);
	}

	onKeyUp(e) {
		this.snake.unsetState(e.code);
	}

	idealOffset(head) {
		const offset = new Vector3(0, 5, 8);
		offset.applyQuaternion(head.object.quaternion);
		offset.add(head.object.position);
		return offset;
	}

	idealLookAt(head) {
		const lookAt = new Vector3(0, 0, -10);
		lookAt.applyQuaternion(head.object.quaternion);
		lookAt.add(head.object.position);
		return lookAt;
	}

	updateCamera() {
		const head = this.snake.getHead();
		
		const idealOffset = this.idealOffset(head);
		const idealLookAt = this.idealLookAt(head);
		
		this.offset = this.offset.lerp(idealOffset, this.delta*4);
		this.lookAt = this.lookAt.lerp(idealLookAt, this.delta*4);

		this.camera.lookAt(this.lookAt);
		this.camera.position.copy(this.offset);
	}

	updatePhysics() {
		this.world.fixedStep();

		this.snake.update(this.delta);
		this.plane.update(this.delta);
		if (this.debug) {
			this.cannonDebugger.update();
		}
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}
}

const canvasContainer = document.getElementById('intro-canvas');
const game = new Game({ canvasContainer, debug: false });
game.run();

window.onClickNavBarItem = (element) => {
	const elements = document.getElementsByClassName('active');
	for (let element of elements) { element.classList.remove('active'); }
	element.classList.add('active');
}
