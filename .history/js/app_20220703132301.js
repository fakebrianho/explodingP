import * as THREE from 'three'
import fragment from './shader/fragment.glsl'
import vertex from './shader/vertexParticles.glsl'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TimelineMax } from 'gsap'
import t from '../image1.jpg'
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
		this.renderer.outputEncoding = THREE.sRGBEncoding

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
	}
	addPos() {
		this.renderScene = new RenderPass(this.scene, this.camera)
		this.bloomPass = new UnrealBloomPass(new Vector2)
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
				resolution: { type: 'v4', value: new THREE.Vector4() },
				distortion: { type: 'f', value: 0 },
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
			480 * 1.5,
			820 * 1.5,
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
		this.renderer.render(this.scene, this.camera)
	}
}

new Sketch({
	dom: document.getElementById('container'),
})
