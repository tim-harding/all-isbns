#version 300 es
precision highp float;

uniform uint u_country_index;
uniform highp usampler2D u_tex;
uniform float u_brightness;
in vec2 uv;
out vec4 outColor;

uint hash( uint x ) {
    x += ( x << 10u );
    x ^= ( x >>  6u );
    x += ( x <<  3u );
    x ^= ( x >> 11u );
    x += ( x << 15u );
    return x;
}

float floatConstruct( uint m ) {
    const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
    const uint ieeeOne      = 0x3F800000u; // 1.0 in IEEE binary32

    m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
    m |= ieeeOne;                          // Add fractional part to 1.0

    float  f = uintBitsToFloat( m );       // Range [1:2]
    return f - 1.0;                        // Range [0:1]
}

float rng(uint x) {
  return floatConstruct(hash(x));
}

void main() {
  uvec4 a = texture(u_tex, uv);
  float x = float(a.r == u_country_index) * u_brightness;
  outColor = vec4(x, x, x, 1.0);
}
