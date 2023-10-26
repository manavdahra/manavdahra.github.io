import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	AmbientLight,
	Color,
	DirectionalLight,
	Clock,
	Vector3,
	PCFSoftShadowMap,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
		this.cameraOffset = new Vector3(0, 5, 7);
		this.delta = 0;

		this.initCannon();
		this.addRenderers();
		this.setupScene();

		this.camera = new PerspectiveCamera(75, this.canvasContainer.clientWidth / this.canvasContainer.clientHeight, 1, 35);
		if (this.debug) {
			this.camera.position.copy(this.cameraOffset);
			this.controls = new OrbitControls( this.camera, this.renderer.domElement );
			this.controls.target.set(0, 0, 0);
		}

		document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
		window.addEventListener('resize', () => this.onWindowResize());
	}

	initCannon() {
		const world = new CANNON.World();
		world.gravity.set(0, -10, 0);
		world.broadphase = new CANNON.NaiveBroadphase();
		world.solver.iterations = 10;
		this.world = world;
		this.cannonDebugger = new CannonDebugger(this.scene, this.world);
	}

	setupScene() {
		this.addLights();
		this.addPlane();
		this.addSnake();
	}

	addRenderers() {
		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		this.renderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);
		this.canvasContainer.appendChild(this.renderer.domElement);
	}

	addLights() {
		const light = new DirectionalLight(0x989285, 3);
		light.position.set(100, 100, 0);
		light.castShadow = true;
		this.light = light;

		this.scene.add(new AmbientLight(0xAEAEA0, 0.1));
		this.scene.add(light);
	}

	addSnake() {
		this.snake = new Snake({ thickness: 0.5, length: 1 });
		this.snake.parts.forEach(({ body }) => {
			this.world.addBody(body);
			this.world.addContactMaterial(new CANNON.ContactMaterial(body.material, this.plane.groundBody.material, { friction: 0 }));
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
		
		if (this.debug) {
			this.controls.update();
		}

		this.updatePhysics();
		this.render();
	}

	onKeyDown(e) {
		this.snake.setState(e.code);
	}

	updateCamera() {
		const snakeWorldPosition = new Vector3();
		const head = this.snake.getHead();
		head.object.getWorldPosition(snakeWorldPosition);
		
		if (!this.debug) {
			this.camera.lookAt(snakeWorldPosition);
			this.camera.position.copy(snakeWorldPosition).add(this.cameraOffset);
		}
	}

	updatePhysics() {
		this.world.fixedStep();

		this.snake.update(this.delta);
		this.plane.update(this.delta);
		this.cannonDebugger.update();
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}
}

const canvasContainer = document.getElementById('intro-canvas');
const game = new Game({ canvasContainer });
game.run();

window.onClickNavBarItem = (element) => {
	const elements = document.getElementsByClassName('active');
	for (let element of elements) { element.classList.remove('active'); }
	element.classList.add('active');
}
