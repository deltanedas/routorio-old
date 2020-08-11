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

var holo;

const HoloI = {
	_(builder, target, name) {
		this.target = builder.var(target);
		this.name = builder.var(name);
	},

	run(vm) {
		const target = vm.building(this.target);
		if (!(target && target.block == holo)) {
			return;
		}

		const name = vm.obj(this.name);
		if (!name) return;

		target.texture(name);
	}
};

const HoloStatement = {
	new: words => {
		const st = extend(LStatement, HoloStatement);
		st.read(words);
		return st;
	},

	read(words) {
		if (words.length < 2) throw "Invalid argument length";

		this.target = words[1];
		this.texture = words[2];
	},

	build(h) {
		if (h instanceof Table) {
			return this.buildt(h);
		}

		const inst = extend(LExecutor.LInstruction, HoloI);
		print("Init inst " + inst)
		print("Was " + inst.target);
		inst._(h, this.target, this.texture);
		return inst;
	},

	buildt(table) {
		this.field(table, this.target, text => {this.building = text});
		table.add(" -> ");
		this.field(table, this.texture, text => {this.texture = text});
	},

	write(builder) {
		builder.append("holorouter ");
		builder.append(this.target);
		builder.append(" ");
		builder.append(this.texture);
	},

	name: () => "Holorouter",
	category: () => LCategory.operations
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("holorouter", extend(Func, {
	get: HoloStatement.new
}));

LogicIO.allStatements.add(extend(Prov, {
	get: () => HoloStatement.new([
		"holorouter",
		"@0",
		'"god"'
	])
}));

holo = extendContent(Router, "holorouter", {
	load() {
		this.super$load();

		var texture, field;

		this.dialog = extendContent(BaseDialog, "$select-hologram", {
			pick(ent) {
				this.ent = ent;
				this.text = ent.config();
				this.show();
			}
		});

		const t = this.dialog.cont;
		t.defaults().center();
		this.dialog.ent = null;

		const preview = new TextureRegionDrawable(this.get("router"));
		t.image(preview).size(128).fillY();
		t.row();

		field = t.field("router", text => {
			texture = text;
			preview.region = this.get(text);
		}).growX().pad(32).get();
		t.row();

		this.dialog.addCloseButton();
		this.dialog.buttons.button("$accept", Icon.save, () => {
			this.dialog.ent.texture(texture);
			this.dialog.hide();
		});
	},

	get(name) {
		if (this.textureCache[name]) {
			return this.textureCache[name];
		}

		const reg = Core.atlas.find(name);
		this.textureCache[name] = reg;
		return reg;
	}
});

holo.opacity = 0.75;
holo.textureCache = {};
holo.dialog = null;

holo.config(java.lang.String, (ent, str) => {
	ent.texture(str);
});

holo.entityType = () => {
	const ent = extendContent(Router.RouterBuild, holo, {
		/* Drawing */

		draw() {
			this.super$draw();
			if (this.power.status > 0.01) {
				this.drawHolo();
			}
		},

		drawHolo() {
			// Subtle phasing in and out
			const phase = (Math.sin(Time.time() / 50) / 5) + 0.8;
			Draw.alpha(phase * this.power.status * holo.opacity);
			Draw.rect(this.region, this.x, this.y + this.offset);
		},

		/* Configuration */

		config() {
			return this.name;
		},

		buildConfiguration(t) {
			t.button(Icon.pencil, () => {
				holo.dialog.pick(this);
			});
		},

		texture(name) {
			this.name = name;
			this.region = holo.get(name);
			this.offset = (this.region.height / 8) + 6;
		},

		/* I/O */

		read(read, version) {
			this.super$read(read, version);
			this.texture(read.str());
		},

		write(write) {
			this.super$write(write);
			write.str(this.name);
		}
	});

	ent.texture("router");

	return ent;
};

module.exports = holo;
