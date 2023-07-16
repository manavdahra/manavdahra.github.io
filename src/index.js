import { 
	Scene, 
	PerspectiveCamera, 
	WebGLRenderer, 
	PlaneGeometry, 
	Mesh, 
	DoubleSide, 
	MeshLambertMaterial,
	AmbientLight,
	Group,
	Color,
	GridHelper,
 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

class Game {
	constructor(props) {
		this.canvasContainer = props.canvasContainer;
		this.scene = new Scene();
		this.scene.background = new Color('#1f2127');
		
		this.addRenderers();
		this.setupScene();

		this.camera = new PerspectiveCamera( 75, this.canvasContainer.clientWidth / this.canvasContainer.clientHeight, 0.1, 1000 );
		this.camera.position.set(5, 5, 5);
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );

		window.addEventListener( 'resize', () => this.onWindowResize() );
	}

	setupScene() {
		this.addLights();
		this.addPlane();
	}

	addRenderers() {
		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setSize( this.canvasContainer.clientWidth, this.canvasContainer.clientHeight );
		this.canvasContainer.appendChild( this.renderer.domElement );
	}

	addLights() {
		const light = new AmbientLight( 0xAEAEA0, 100 );
		this.scene.add( light );
	}
	
	addPlane() {
		const plane = new Group();
		const grid = new GridHelper( 20, 20 );

		const geometry = new PlaneGeometry( 20, 20, 20, 20 );
		geometry.rotateX(-Math.PI/2);
	
		const material = new MeshLambertMaterial( { side: DoubleSide } );
		const planeObject = new Mesh( geometry, material );
		
		plane.add( grid );
		plane.add( planeObject );
		
		this.scene.add( plane );
	}

	onWindowResize() {
		this.camera.aspect = this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( this.canvasContainer.clientWidth, this.canvasContainer.clientHeight );

		this.render();
	}
	
	run() {
		requestAnimationFrame( () => this.run() );
		
		this.onWindowResize();
		
		this.controls.update();
	
		this.render();
	}

	render() {
		this.renderer.render( this.scene, this.camera );
	}
}

const canvasContainer = document.getElementById( 'intro-canvas' );
const game = new Game({ canvasContainer });
game.run();

window.onClickNavBarItem = (element) => {
	const elements = document.getElementsByClassName( 'active' );
	for (let element of elements) { element.classList.remove( 'active' ); }
	element.classList.add( 'active' );
}
