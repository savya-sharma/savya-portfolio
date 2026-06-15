varying vec2 vUv;
varying float vElevation;
uniform float uColorChange;

void main() {
    vec4 c1 = vec4(0.9569, 0.3686, 0.1686, 1.0); //rgb(239, 76, 21) orange
    vec4 c2 = vec4(1.0, 1.0, 1.0, 1.0);   // white

    vec4 c3 = vec4(0.19, 0.38, 0.93, 1.0); // blue
    vec4 c4 = vec4(1.0, 1.0, 1.0, 1.0);    // white

    float v = smoothstep(-.14, .14, vElevation);
    vec4 color1 = mix(c1, c2, v);  //v is a blend factor.
    vec4 color2 = mix(c3, c4, v);

    vec4 final = mix(color1, color2, uColorChange);

    gl_FragColor = final;
}

