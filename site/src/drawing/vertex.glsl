#version 300 es

in vec2 a_uv;
uniform vec2 u_vp_tl;
uniform vec2 u_vp_sz;

out vec2 uv;

void main() {
    uv = a_uv;
    vec2 pos = ((a_uv * u_vp_sz + u_vp_tl) * 2.0 - 1.0) * vec2(1, -1);
    gl_Position = vec4(pos, 0, 1);
}
