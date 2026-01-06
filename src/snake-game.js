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
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';

import Stats from 'three/examples/jsm/libs/stats.module';

import CannonDebugger from 'cannon-es-debugger';
import * as CANNON from 'cannon-es';

import Snake from './objects/snake';
import Ground from './objects/plane';

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

		// Detect device type
		this.isMobile = this.detectMobileDevice();
		this.touchStartX = 0;
		this.touchStartY = 0;
		this.touchEndX = 0;
		this.touchEndY = 0;

		this.initCannon();
		this.addRenderers();
		this.setupScene();
		this.updateOverlayMessage();

		if (this.isMobile) {
			// Mobile touch controls
			this.canvasContainer.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
			this.canvasContainer.addEventListener('touchmove', (e) => this.onTouchMove(e), false);
			this.canvasContainer.addEventListener('touchend', (e) => this.onTouchEnd(e), false);
		} else {
			// Desktop keyboard controls
			window.addEventListener("keydown", function(e) {
				if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
					e.preventDefault();
				}
			}, false);
			document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
			document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
		}
		window.addEventListener('resize', (e) => this.onWindowResize(), false);
	}

	detectMobileDevice() {
		// Check for touch support and common mobile user agents
		const hasTouchScreen = ('ontouchstart' in window) || 
			(navigator.maxTouchPoints > 0) || 
			(navigator.msMaxTouchPoints > 0);
		
		const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
		const isMobileUserAgent = mobileRegex.test(navigator.userAgent);
		
		// Also check screen width as an additional indicator
		const isSmallScreen = window.innerWidth <= 768;
		
		return (hasTouchScreen && isMobileUserAgent) || (hasTouchScreen && isSmallScreen);
	}

	updateOverlayMessage() {
		const overlay = document.querySelector('.game-overlay');
		if (!overlay) return;

		if (this.isMobile) {
			// Update message for mobile devices
			overlay.innerHTML = `
				<h3>3D Snake Demo</h3>
				Tap and hold to move, swipe left/right to turn
			`;
		} else {
			// Keep original message for desktop
			overlay.innerHTML = `
				<h3>3D Snake Demo</h3>
				Use arrow keys 
				<img class="icon arrow-left">
				<img class="icon arrow-up">
				<img class="icon arrow-right">
				to control the snake
			`;
		}
	}

	onTouchStart(e) {
		e.preventDefault();
		const touch = e.touches[0];
		this.touchStartX = touch.clientX;
		this.touchStartY = touch.clientY;
		
		// Start moving on touch
		this.snake.setState('ArrowUp');
	}

	onTouchMove(e) {
		e.preventDefault();
		if (e.touches.length === 0) return;
		
		const touch = e.touches[0];
		this.touchEndX = touch.clientX;
		this.touchEndY = touch.clientY;
		
		const deltaX = this.touchEndX - this.touchStartX;
		const deltaY = this.touchEndY - this.touchStartY;
		
		// Determine direction based on swipe
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			// Horizontal swipe
			if (deltaX > 40) {
				// Swipe right
				this.snake.setState('ArrowRight');
			} else if (deltaX < -40) {
				// Swipe left
				this.snake.setState('ArrowLeft');
			} else {
				// Reset if no significant swipe
				this.snake.unsetState('ArrowLeft');
				this.snake.unsetState('ArrowRight');
			}
		}
	}

	onTouchEnd(e) {
		e.preventDefault();
		
		// Reset rotation when touch ends
		this.snake.unsetState('ArrowLeft');
		this.snake.unsetState('ArrowRight');
		
		// Keep moving forward
		// Snake will keep moving until user stops touching
		// If you want to stop on touch end, uncomment the line below:
		this.snake.unsetState('ArrowUp');
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

		this.labelRenderer = new CSS2DRenderer();
		this.labelRenderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);
		this.labelRenderer.domElement.classList.add("game-css");
		this.canvasContainer.appendChild(this.labelRenderer.domElement);

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
		});
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
		this.labelRenderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);

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

		this.offset = this.offset.lerp(idealOffset, this.delta * 4);
		this.lookAt = this.lookAt.lerp(idealLookAt, this.delta * 4);

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
		this.labelRenderer.render(this.scene, this.camera);
	}
}

export default Game;

// Usage example:
// const canvasContainer = document.getElementById('intro-canvas');
// canvasContainer.focus();
// const game = new Game({ canvasContainer, debug: false });
// game.run();
