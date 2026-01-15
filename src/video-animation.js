import * as THREE from 'three';
import { Vector4 } from "three";
// import { debugGui } from "./debugGui";
import videoPanelVFrag from "./shaders/videoPanelFrag.glsl";
import videoPanelVert from "./shaders/videoPanelVert.glsl";
import { createVideoTexture, elementToLocalRect, elementToWorldRect, getElementPageCoords, pagePixelsToWorldUnit } from "./utils/utils";
import mp4 from "../assets/homepage-video.mp4";

const PANEL_START_ID = "video-panel-start";
const PANEL_END_ID = "video-panel-end";
const PANEL_END_PARENT_ID = "video-panel-end-parent";
const SIZE = 1;
const SUBDIVISIONS = 32;

export default class VideoPanelShader extends THREE.Group {
    animateProgress = { value: 0 };
    borderRadius = { value: 0.085 };
    // tintColour = { value: new THREE.Color(0.6, 0.6, 1.0) };
    tintColour = { value: new THREE.Color(0xee6325) };
    isPlaying = true;
    isMuted = true;


    constructor(camera) {
        super();

        this.camera = camera;

        const startWorldRect = elementToWorldRect(PANEL_START_ID, camera);
        this.position.copy(startWorldRect.position);

        const videoTexture = createVideoTexture(mp4);
        // Store reference to the video element for playback control
        this.videoElement = videoTexture.image;
        const startRectLocal = elementToLocalRect(PANEL_START_ID, this, camera);
        const endRectLocal = elementToLocalRect(PANEL_END_ID, this, camera);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                startRect: { value: VideoPanelShader.rectToVec4(startRectLocal) },
                endRect: { value: VideoPanelShader.rectToVec4(endRectLocal) },
                animateProgress: this.animateProgress,
                borderRadius: this.borderRadius,
                tintColour: this.tintColour,
                map: { value: videoTexture }
            },
            vertexShader: videoPanelVert,
            fragmentShader: videoPanelVFrag,
            transparent: true,
        });
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE, SUBDIVISIONS, SUBDIVISIONS), this.material);
        this.mesh.frustumCulled = false;
        this.add(this.mesh);

        this.calculateElementValues();

        window.addEventListener("scroll", this.onScroll);

        // if(import.meta.env.DEV_MODE) {
        //     this.initDebug();
        // }
    }

    calculateElementValues() {
        this.scrollPositionAnimStart = getElementPageCoords(PANEL_START_ID).y + window.scrollY - window.innerHeight * 0.5;
        this.scrollPositionAnimEnd = getElementPageCoords(PANEL_END_ID).y + window.scrollY - window.innerHeight * 0.5;
        this.scrollPositionAnimFollowEnd = getElementPageCoords(PANEL_END_PARENT_ID).y + window.scrollY - window.innerHeight * 0.5;
        this.followDistanceWorld = pagePixelsToWorldUnit(this.scrollPositionAnimFollowEnd - this.scrollPositionAnimEnd, this.camera);
    }

    onScroll = (e) => {
        this.animateProgress.value = THREE.MathUtils.inverseLerp(this.scrollPositionAnimStart, this.scrollPositionAnimEnd, window.scrollY);
        this.animateProgress.value = THREE.MathUtils.clamp(this.animateProgress.value, 0, 1);

        const distanceWorld = pagePixelsToWorldUnit(this.scrollPositionAnimFollowEnd - this.scrollPositionAnimEnd, this.camera);
        let positionFollowAmount = THREE.MathUtils.inverseLerp(this.scrollPositionAnimEnd, this.scrollPositionAnimFollowEnd, window.scrollY);
        positionFollowAmount = THREE.MathUtils.clamp(positionFollowAmount, 0, 1);

        this.mesh.position.y = -positionFollowAmount * distanceWorld;
    }

    // initDebug = () => {
    //     const folder = debugGui.addFolder("Video Panel Shader");
    //     folder.add(this.animateProgress, "value", 0, 1).name("Mask progress");
    //     folder.add(this.borderRadius, "value", 0, 1).name("Border radius");
    //     folder.addColor(this.tintColour, "value").name("Tint colour");
    // }

    /**
     * Converts a  height rect to a vec4 (for shader uniforms),
     * where x = x pos, y = y pos, w = width, z = height 
     * @param {{position: Vector3, width: number, height: number}} rect 
     */
    static rectToVec4(rect) {
        return new Vector4(
            rect.position.x,
            rect.position.y,
            rect.height,
            rect.width,
        );
    }

    resize = () => {
        this.calculateElementValues();

        const startRectLocal = elementToLocalRect(PANEL_START_ID, this, this.camera);
        const endRectLocal = elementToLocalRect(PANEL_END_ID, this, this.camera);

        this.material.uniforms.startRect.value = VideoPanelShader.rectToVec4(startRectLocal);
        this.material.uniforms.endRect.value = VideoPanelShader.rectToVec4(endRectLocal);

        this.onScroll();
    }

    update = () => { }

    /**
     * Toggle play/pause state of the video
     * @returns {boolean} New playing state
     */
    togglePlayPause = () => {
        if (!this.videoElement) return this.isPlaying;
        
        if (this.isPlaying) {
            this.videoElement.pause();
            this.isPlaying = false;
        } else {
            this.videoElement.play();
            this.isPlaying = true;
        }
        
        return this.isPlaying;
    }

    /**
     * Set muted state of the video
     * @param {boolean} muted - Whether to mute the video
     */
    setMuted = (muted) => {
        if (!this.videoElement) return;
        
        this.videoElement.muted = muted;
        this.isMuted = muted;
    }

    /**
     * Get current playing state
     * @returns {boolean} Whether video is playing
     */
    getIsPlaying = () => {
        return this.isPlaying;
    }

    /**
     * Get current muted state
     * @returns {boolean} Whether video is muted
     */
    getIsMuted = () => {
        return this.isMuted;
    }
}