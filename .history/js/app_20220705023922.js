import * as THREE from 'three'
import fragment from './shader/fragment.glsl'
import vertex from './shader/vertexParticles.glsl'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import t from '../image2.jpeg'
import t2 from '../image2.jpg'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Vector2 } from 'three'

export default class Sketch {
	constructor(options) {
		this.scene = new THREE.Scene()

		this.container = options.dom
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer = new THREE.WebGLRenderer()
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(this.width, this.height)
		this.renderer.setClearColor(0x000000, 1)
		// this.renderer.outputEncoding = THREE.sRGBEncoding

		this.container.appendChild(this.renderer.domElement)

		this.camera = new THREE.PerspectiveCamera(
			70,
			window.innerWidth / window.innerHeight,
			0.001,
			5000
		)

		// var frustumSize = 10;
		// var aspect = window.innerWidth / window.innerHeight;
		// this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
		this.camera.position.set(0, 0, 1500)
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0

		this.isPlaying = true
		this.addPost()

		this.addObjects()
		this.resize()
		this.render()
		this.setupResize()
		// this.settings()
		this.video = document.getElementById('video1')
		this.video.addEventListener('ended', () => {
			gsap.to('#video1', {
				duration: 0.1,
				opacity: 0,
			})
			gsap.to(this.material.uniforms.dist, {
				duration: 2,
				value: 3,
				ease: 'power2.inOut',
			})
			gsap.to(this.bloomPass, {
				duration: 2,
				strength: 9,
				ease: 'power2.in',
			})

			gsap.to(this.material.uniforms.dist, {
				duration: 2,
				value: 0,
				delay: 2,
				ease: 'power2.inOut',
			})
			gsap.to(this.material.uniforms.progress, {
				duration: 1,
				delay: 1.5,
				value: 1,
			})
			gsap.to(this.bloomPass, {
				duration: 2,
				strength: 0,
				delay: 2,
				ease: 'power2.out',
			})
		})
	}
	addPost() {
		this.renderScene = new RenderPass(this.scene, this.camera)
		this.bloomPass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			0.1,
			0.2,
			0.65
		)
		this.composer = new EffectComposer(this.renderer)
		this.composer.addPass(this.renderScene)
		this.composer.addPass(this.bloomPass)
		// SharedArrayBuffer;
	}
	settings() {
		let that = this
		this.settings = {
			progress: 0,
		}
		this.gui = new dat.GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height
		this.camera.updateProjectionMatrix()
		this.composer.setSize(this.width, this.height)
	}

	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable',
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: { type: 'f', value: 0 },
				t: {
					type: 't',
					value: new THREE.TextureLoader().load(t),
				},
				progress: {
					type: 'f',
					value: 0,
				},
				t2: {
					type: 't',
					value: new THREE.TextureLoader().load(t2),
				},
				resolution: { type: 'v4', value: new THREE.Vector4() },
				dist: { type: 'f', value: 0 },
				uvRate1: {
					value: new THREE.Vector2(1, 1),
				},
			},
			// wireframe: true,
			// transparent: true,
			vertexShader: vertex,
			fragmentShader: fragment,
		})

		this.geometry = new THREE.PlaneBufferGeometry(
			480 * 1.747,
			820 * 1.747,
			480,
			820
		)

		this.plane = new THREE.Points(this.geometry, this.material)
		this.scene.add(this.plane)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if (!this.isPlaying) {
			this.render()
			this.isPlaying = true
		}
	}

	render() {
		if (!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time
		requestAnimationFrame(this.render.bind(this))
		// this.renderer.render(this.scene, this.camera)
		this.composer.render()
	}
}

new Sketch({
	dom: document.getElementById('container'),
})
