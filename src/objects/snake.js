import { Group, BoxGeometry, MeshLambertMaterial, Mesh, Vector3, DoubleSide, DodecahedronGeometry, PointLight, ConeGeometry } from "three";
import { DistanceConstraint, Vec3, Box, Body, Material, Quaternion } from "cannon-es";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

export default class Snake extends Group {
    constructor(props) {
        super(props);
        const { thickness, length } = props;
        this.spacing = 0.1;
        this.move = false;
        this.angle = 0;
        this.length = length;
        this.yAxis = new Vec3(0, 1, 0);
        this.direction = new Quaternion(0, 1, 0, 0);
        this.thickness = thickness;
        this.velocity = new Vec3(0, 0, -10);
        this.parts = [];
        this.contraints = [];
        
        this.buildBody();
        this.addLabel();
    }

    buildBody() {
        for (let index = 0; index < this.length; index++) {
            const position = new Vector3(0, 1, index * this.thickness * (1 + this.spacing));
            const part = this.addCube(index, position);
            this.add(part.object);
            this.parts.push(part);
        }

        for (let index = 0; index < this.parts.length - 1; index++) {
            const curr = this.parts[index];
            const next = this.parts[index + 1];

            this.contraints.push(
                new DistanceConstraint(next.body, curr.body, this.thickness + this.spacing * 2)
            );
        }
    }

    addLabel() {
        const labelDiv = document.createElement("div");
        labelDiv.className = "snake-label";
        this.label = new CSS2DObject(labelDiv);
        this.label.center.set(0.5, 2.5);
        this.parts[0].object.add(this.label);
    }

    addCube(index, position) {
        const group = new Group();
        if (index == 0) {
            const geometry = new DodecahedronGeometry(this.thickness);
            geometry.scale(1, 1, 1.1);
            const material = new MeshLambertMaterial({ side: DoubleSide, color: 0xAAff00, visible: true });
            const object = new Mesh(geometry, material);

            const light = new PointLight(0x989285, 6);
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.position.add(new Vector3(0, 2, 0));
            group.add(light);
            group.add(object);
        } else {
            const tailObject = new Group();
            const geometry = new BoxGeometry(this.thickness, this.thickness, this.thickness);
            const material = new MeshLambertMaterial({ side: DoubleSide, color: 0xAAff00, visible: true });
            const box = new Mesh(geometry, material);
            tailObject.add(box);
            if (index == this.length - 1) {
                const geometry = new ConeGeometry(this.thickness * 0.5, 1.25, 8);
                geometry.rotateX(Math.PI / 2);
                const material = new MeshLambertMaterial({ side: DoubleSide, color: 0xAAff00, visible: true });
                const cone = new Mesh(geometry, material);
                cone.position.set(box.position.x, box.position.y, box.position.z + this.thickness + this.spacing);
                tailObject.add(cone);
            }
            group.add(tailObject);
        }

        group.position.set(position.x, position.y, position.z);
        group.castShadow = true;
        const bodyPos = new Vec3(position.x, position.y, position.z);
        const shape = new Box(new Vec3(this.thickness / 2, this.thickness / 2, this.thickness / 2));
        const body = new Body({ mass: 1, linearDamping: 0.1, angularDamping: 1.0, position: bodyPos, material: new Material() });
        body.angularVelocity.setZero();
        body.addShape(shape);
        return { object: group, body };
    }

    setState(pressed) {
        switch (pressed) {
            case 'ArrowLeft':
                this.angle = Math.PI / 2;
                break;
            case 'ArrowRight':
                this.angle = -Math.PI / 2;
                break;
            case 'ArrowUp':
                this.move = true;
                break;
            case 'ArrowDown':
                break;
            default:
        }
    }

    unsetState(unpressed) {
        switch (unpressed) {
            case 'ArrowLeft':
            case 'ArrowRight':
                this.angle = 0;
                break;
            case 'ArrowUp':
                this.move = false;
                break;
            case 'ArrowDown':
                break;
            default:
        }
    }

    getHead() {
        return this.parts[0];
    }

    getTail() {
        return this.parts[this.parts.length - 1];
    }

    update(delta) {
        this.direction.setFromAxisAngle(this.yAxis, this.angle * delta);
        if (this.move) {
            const head = this.getHead();
            const tail = this.getTail();
            const rotation = this.direction.mult(head.body.quaternion);
            head.body.quaternion = rotation;
            tail.body.quaternion = rotation;
            let velocity = head.body.quaternion.vmult(this.velocity);
            head.body.velocity.x = velocity.x;
            head.body.velocity.z = velocity.z;
        }
        this.parts.forEach(({ object, body }) => {
            object.position.copy(body.position, delta);
            object.quaternion.copy(body.quaternion, delta);
        });

        this.updateLabel();
    }

    updateLabel() {
        this.label.element.textContent = `Speed: ${this.getHead().body.velocity.length().toFixed(2)} m/s`;;
    }
}