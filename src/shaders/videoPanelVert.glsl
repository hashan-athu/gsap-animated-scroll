#define PI 3.14159265358979

#include "./common.glsl"

uniform float animateProgress;
uniform vec4 startRect;
uniform vec4 endRect;

varying vec2 vUv;

// Takes VideoPanelShader rect (see VideoPanelShader.rectToVec4) and creates a position based on percentage a
vec2 getRectPos(vec4 rect, vec2 uv) {
    vec2 pos;
    pos.x = mix(rect.x, rect.x + rect.w, uv.x);
    pos.y = mix(rect.y - rect.z, rect.y, uv.y);
    return pos;
}

void main() {
    vec3 pos = position;

    float rotateStepEdgeCurve = 1.0 - sin(animateProgress * PI) * 2.0;    // multiply by 3 so that when animateProgress = 1, step edge contains more of the uv
    float startEndCurve = smoothstep(0.2, 1.0, animateProgress);
    float rotateCurve = (smoothstep(0.1, 0.4, animateProgress) - smoothstep(0.6, 0.9, animateProgress)) * 0.4;
    float translateCurve = smoothstep(0.0, 0.2, animateProgress) - smoothstep(0.2, 0.8, animateProgress);

    vec2 videoPanelStartPos = getRectPos(startRect, uv);
    vec2 videoPanelEndPos = getRectPos(endRect, uv);

    float rotateMask = smoothstep(rotateStepEdgeCurve, 1.0, uv.x);
    rotateMask *= smoothstep(rotateStepEdgeCurve, 1.0, uv.y);

    float translateMask = smoothstep(0.6, 1.0, uv.x);
    translateMask *= smoothstep(0.5, 1.0, uv.y);

    pos.xy = mix(videoPanelStartPos, videoPanelEndPos, startEndCurve);
    pos.xy = rotate(pos.xy, rotateCurve * rotateMask);
    pos.x *= 1.0 + 0.3 * translateCurve * translateMask;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    vUv = uv;
}