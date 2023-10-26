import { Group, BoxGeometry, MeshLambertMaterial, Mesh, Vector3, DoubleSide } from "three";
import { DistanceConstraint, Vec3, Box, Body, Material, Quaternion } from "cannon-es";

export default class Snake extends Group {
    constructor(props) {
        super(props);
        const { thickness, length } = props;
        const spacing = 0.1;
        this.pressed = 0;
        this.angle = 0;
        this.yAxis = new Vec3(0, 1, 0);
        this.direction = new Quaternion(0, 1, 0, 0);
        this.thickness = thickness;
        this.force = new Vec3(0, 0, -5);
        this.parts = [];
        this.contraints = [];
        for (let index = 0; index < length; index++) {
            const position = new Vector3(0, 1, index * thickness * (1 + spacing));
            const part = this.addCube(position);
            this.add(part.object);
            // this.add(camera);
            this.parts.push(part);
        }

        for (let index = 0; index < this.parts.length-1; index++) {
            const curr = this.parts[index];
            const next = this.parts[index+1];
            
            this.contraints.push(
                new DistanceConstraint(curr.body, next.body, thickness + spacing)
            );
        }
    }

    addCube(position) {
        const geometry = new BoxGeometry(this.thickness, this.thickness, this.thickness);
        const material = new MeshLambertMaterial({ side: DoubleSide, color: 0xAAff00, visible: false });
        const object = new Mesh(geometry, material);
        object.position.set(position.x, position.y, position.z);
        object.castShadow = true;
        const bodyPos = new Vec3(position.x, position.y, position.z);
        const shape = new Box(new Vec3(this.thickness/2, this.thickness/2, this.thickness/2));
		const body = new Body({ mass: 1, linearDamping: 0.1, angularDamping: 1.0, position: bodyPos, material: new Material() });
        body.angularVelocity.setZero();
		body.addShape(shape);
        return { object, body };
    }

    setState(pressed) {
        this.pressed = pressed;
        setTimeout(() => {
            this.pressed = '';
        }, 1000);
    }

    getHead() {
        return this.parts[0];
    }

    update(delta) {
        let angle = 0.0;
        if (this.pressed == 'ArrowLeft') {
            angle = delta * Math.PI/2;
        }
        if (this.pressed == 'ArrowRight') {
            angle = -delta * Math.PI/2;
        }
        this.direction.setFromAxisAngle(this.yAxis, angle);
        const head = this.getHead();
        head.body.quaternion = this.direction.mult(head.body.quaternion);
        let velocity = head.body.quaternion.vmult(this.force);
        head.body.velocity.x = velocity.x;
        head.body.velocity.z = velocity.z;
        this.parts.forEach(({ object, body }) => {
			object.position.copy(body.position);
			object.quaternion.copy(body.quaternion);
		});
    }
}