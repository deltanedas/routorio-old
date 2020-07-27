/*
	Copyright (c) DeltaNedas 2020

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

(() => {

if (this.global.routorioShaders) {
	return this.global.routorioShaders;
}

const Shader = Packages.arc.graphics.gl.Shader;

const newShader = (vert, frag, apply) => new JavaAdapter(Shader, {
		apply() {
			apply.call(this);
		}
	}, vert.join("\n"), frag.join("\n"));

const shaders = {
	magic: null
};

const loadShaders = () => {
	shaders.magic = newShader([
		"uniform mat4 u_projTrans;",

		"attribute vec4 a_position;",
		"attribute vec2 a_texCoord0;",
		"attribute vec4 a_color;",

		"varying vec4 v_color;",
		"varying vec2 v_texCoord;",

		"uniform vec2 u_viewportInverse;",

		"void main() {",
			"gl_Position = u_projTrans * a_position;",
			"v_texCoord = a_texCoord0;",
			"v_color = a_color;",
		"}"
	], [
		"#ifdef GL_ES",
			"precision highp float;",
			"precision highp int;",
		"#endif",

		"uniform sampler2D u_texture;",
		"uniform vec2 u_texsize;",
		"uniform float u_time;",
		"uniform float u_dp;",
		"uniform vec2 u_offset;",

		"varying vec4 v_color;",
		"varying vec2 v_texCoord;",

		"void main() {",
			"vec3 color = vec3(u_offset + v_texCoord, 0.25 + 0.5 * sin(u_time / 10));",

			"gl_FragColor = vec4(color, 1.0);",
		"}"
	], function magic() {
		this.setUniformf("u_dp", Scl.scl(1));
		this.setUniformf("u_time", Time.time() / Scl.scl(1));
		this.setUniformf("u_offset",
			Core.camera.position.x - Core.camera.width / 2,
			Core.camera.position.y - Core.camera.height / 2);
		this.setUniformf("u_texsize", Core.camera.width, Core.camera.height);
	});
};

/* Only compile the shaders once */
const mod = Vars.mods.locateMod("routorio");
const name = mod.meta.displayName();
if (Vars.ui && !name.includes("[]")) {
	// Mod was just installed
	name += "[]";
	loadShaders();
} else {
	Events.on(EventType.ClientLoadEvent, run(loadShaders));
}

this.global.routorioShaders = shaders;
module.exports = shaders;

})();
