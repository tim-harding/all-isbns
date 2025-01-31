#version 300 es
precision highp float;

uniform sampler2D u_tex;
uniform vec4 u_color;
in vec2 uv;
out vec4 outColor;
 
void main() {
  outColor = texture(u_tex, uv) * u_color;
}
