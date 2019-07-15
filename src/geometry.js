const THREE = require('three');

export default class Geometry {

    constructor(e, vert, frag) {
        this.geometry = new THREE.BufferGeometry();

        this.geometry.addAttribute('position', new THREE.Float32BufferAttribute(e.data.p, 3).setDynamic(true));
        this.geometry.addAttribute('color', new THREE.Float32BufferAttribute(e.data.c, 4).setDynamic(true));
        this.geometry.addAttribute('noise', new THREE.Float32BufferAttribute(e.data.n, 1).setDynamic(true));
        this.geometry.addAttribute('angle', new THREE.Float32BufferAttribute(e.data.a, 3).setDynamic(true));
        this.geometry.addAttribute('move', new THREE.Float32BufferAttribute(e.data.m, 1).setDynamic(true));
        this.geometry.addAttribute('phase', new THREE.Float32BufferAttribute(e.data.i, 1).setDynamic(true));
        this.geometry.addAttribute('noise_value', new THREE.Float32BufferAttribute(e.data.nx, 2).setDynamic(true));
        this.geometry.addAttribute('micronoise_value', new THREE.Float32BufferAttribute(e.data.mnx, 2).setDynamic(true));
        this.geometry.addAttribute('fadespeed', new THREE.Float32BufferAttribute(e.data.f, 1).setDynamic(true));

        this.material = new THREE.RawShaderMaterial({
            uniforms: {
                "time": {
                    type: "f",
                    value: 0.0
                },
                "u_time": {
                    type: "f",
                    value: 0.0
                },
                "s_time": {
                    type: "f",
                    value: 0.0
                },
                "radius": {
                    type: "f",
                    value: 150.0
                },
                "rad_m": {
                    type: "f",
                    value: 150.0
                },
                "move_val": {
                    type: "f",
                    value: 0.0
                },
                "fader": {
                    type: "f",
                    value: 0.0
                },
                "alpha": {
                    type: "f",
                    value: 0.0
                }
            },
            vertexShader: vert,
            fragmentShader: frag,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            vertexColors: true,
        });

        this.ParticleSystem = new THREE.Points(this.geometry, this.material);
        this.ParticleSystem.rotateY(-Math.PI / 2);
        this.ParticleSystem.position.y = -50;
    }

    update(f, a, m, p, r) {
        this.ParticleSystem.material.uniforms.fader.value = f;
        this.ParticleSystem.material.uniforms.alpha.value = a;
        this.ParticleSystem.material.uniforms.move_val.value = m;
        this.ParticleSystem.material.uniforms.time.value = p * 0.00001;
        this.ParticleSystem.material.uniforms.rad_m.value = r;
        this.ParticleSystem.material.uniforms.u_time.value = p * 0.0001;
        this.ParticleSystem.material.uniforms.s_time.value = p;
        this.ParticleSystem.material.needsUpdate = true;
        this.ParticleSystem.material.elementsNeedUpdate = true;
    }
}