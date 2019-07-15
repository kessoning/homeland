#version 300 es

precision highp float;
precision highp int;

uniform mat4 modelViewMatrix; // optional
uniform mat4 projectionMatrix; // optional

uniform float time;
uniform float u_time;
uniform float s_time;
uniform float fader;
uniform float alpha;

in vec3 position; 
in vec4 color;

in float noise;
in float move;
in float phase;
in vec2 noise_value;
in vec2 micronoise_value;
in float fadespeed;

out vec3 vPosition;
out vec4 vColor;

float pointsize = 5.0;

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d)

void main() {
    float x = position.x;
    float y = position.y;
    float z = position.z;

    float t = s_time + phase;
    
    if (move > 0.0) {
        x += sin(t * noise) * 1000.0;
        z += sin(t * noise * 0.5) * 1000.0;
    }

    if (move < 1.0) {
        vec3 n = vec3(noise_value.x, noise_value.y, time);
        y = cnoise3(n) * 200.0;
        vec3 mn = vec3(micronoise_value.x, micronoise_value.y, u_time);
        y += cnoise3(mn) * 20.0;
        pointsize = 3.0;
    }
    
    float d = (position.z / 500.0);
    d = clamp(d, 0.0, 1.0);
    float dd = 1.0 - d;
    float a = color.a * d;
    
    y += fader*fadespeed;
    vPosition = vec3(x, y, z);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);

    float distance = length(gl_Position);
    float attenuation = 500.0 / distance;
    float cls = clamp(pointsize * attenuation, 0.0, pointsize);

    gl_PointSize = cls;

    float att = clamp(attenuation/1000.0, 0.0, 1.0);
    float fov = 1.0 - att;
    float a_v = cls/pointsize;

    float alp = color.a*alpha;

    vec4 c = vec4(color.r * a_v, color.g * a_v, color.b * a_v, alp * a_v);
    if (a_v < 0.01) c = vec4(color.rgb, 0.0);
    vColor = vec4(c);
}