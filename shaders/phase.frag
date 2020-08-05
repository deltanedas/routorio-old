#define HIGHP

uniform sampler2D u_texture;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

const float speed = 0.016;

void main() {
	vec2 c = v_texCoords;
	vec2 v = vec2(1.0/u_resolution.x, 1.0/u_resolution.y);
	vec2 coords = c / v;

	float wave = sin(coords.x + coords.y + u_time * speed) * 0.6 + 1.8;
	vec3 colour = texture2D(u_texture, c).rgb * wave;
	gl_FragColor = vec4(colour.rgb, 1.0);
}
