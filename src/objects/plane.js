import { DoubleSide, GridHelper, Group, Mesh, MeshLambertMaterial, PlaneGeometry } from "three";
import { Vec3, Plane, Body, Material } from "cannon-es";

export default class Ground extends Group {
    constructor(props) {
        super(props);
        const geometry = new PlaneGeometry(100, 100);
        const material = new MeshLambertMaterial({ side: DoubleSide, color: 0xFFFFFF, visible: false });
        const planeMesh = new Mesh(geometry, material);
        planeMesh.receiveShadow = true;

        const grid = new GridHelper(100, 100);
        grid.rotateX(-Math.PI/2);
        grid.geometry.translate(0, -0.01, 0);

        this.add(grid);
        this.add(planeMesh);

        this.groundBody = new Body({ mass: 0, shape: new Plane(), type: Body.STATIC, material: new Material() });
		this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    }

    update() {
        this.position.copy(this.groundBody.position);
		this.quaternion.copy(this.groundBody.quaternion);
    }
}
