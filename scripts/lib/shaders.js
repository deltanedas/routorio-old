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

if (this.global.routorio.shaders) {
	module.exports = this.global.routorio.shaders;
	return;
}

const Shader = Packages.arc.graphics.gl.Shader;

const shaders = {
	phase: null
};

const add = (name, apply) => {
	shaders[name] = new JavaAdapter(Shader, {
		apply() {
			apply.call(this);
		}
	}, readString("shaders/" + name + ".vert"),
		readString("shaders/" + name + ".frag"));
};

const load = () => {
	add("phase", function() {
		this.setUniformf("u_campos",
			Core.camera.position.x - Core.camera.width / 2,
			Core.camera.position.y - Core.camera.height / 2);
		this.setUniformf("u_resolution", Core.camera.width, Core.camera.height);
		this.setUniformf("u_time", Time.time());
	});
};

if (Vars.ui.hudGroup) {
	load();
} else {
	Events.on(ClientLoadEvent, load);
}

module.exports = shaders;
this.global.routorio.shaders = shaders;

})();
