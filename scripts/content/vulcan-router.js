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

const spock = extendContent(Router, "vulcan-router", {
});

spock.maxInstructionScale = 8;
spock.memory = 16;

spock.config(java.lang.String, (entity, code) => {
	entity.setScript(code, null);
});

spock.entityType = () => {
	const ent = extendContent(Router.RouterEntity, spock, {
		getTileTarget(item, from, set) {
			const dir = this.runScript(item, from) % 4
			Log.info("Dir @", dir);
			const tile = this.tile.getNearby(dir);
			return tile ? tile.bc() : null;
		},

		acceptItem(item, source) {
			return this.power.status >= 1
				&& this.code
				&& this.team == source.team()
				&& this.items.total() == 0;
		},

		runScript(item, source) {
			const vars = this.vm.vars;
			const i = this.startIdx;

			vars[i++].value = item;
			vars[i++].value = source.block();
			vars[i++].value = source.relativeTo(this.tile);

			while (this.vm.initialized()) {
				this.vm.runOnce();
			}

			const dir = vars[i];
			Log.info("Script says @", dir);
			return dir;
		},

		setScript(code, cons) {
			this.code = code;
			try {
				const asm = LAssembler.assemble(code);

				/* Placeholders, set in runScript */
				this.startIdx = asm.putConst("@item", null).index;
				asm.putConst("@source", null);
				asm.put("@output");

				/* Load old variables */
				for (var i in this.vm.vars) {
					var v = this.vm.vars[i];
					if (!v.constant) {
						var dest = asm.getVar(v.name);
						if (dest && !dest.constant) {
							dest.value = v.isobj ? v.objval : v.numval;
						}
					}
				}

				if (cons) cons(asm);

				asm.putConst("@this", this);
				this.vm.load(asm);
			} catch (e) {
				Log.err("Failed to load vulcan router code: @", e);
				this.vm.load();
			}
		},


		buildConfiguration(table) {
			table.button(Icon.pencil, Styles.clearTransi, () => {
				Vars.ui.logic.show(this.code, this.configure);
			});
		},

		config() {
			return this.code;
		},

		write(write) {
			this.super$write(write);

			write.str(this.code);

			/* Save variables */
			// Only write non constant variables excluding output side.
			const count = Structs.count(this.vm.vars, v => !v.constant) - 1;
			write.i(count);

			for (var i in this.vm.vars) {
				var v = this.vm.vars[i];
				if (v.constant || v.name == "@output") continue;

				write.str(v.name);
				TypeIO.writeObject(write, v.obj ? v.objval : v.numval);
			}

			/* Save memory */
			write.i(this.vm.memory.length);
			for (var i in this.vm.memory) {
				write.d(this.vm.memory[i]);
			}
		},

		read(read) {
			this.super$read(read);

			const code = read.str();

			/* Read variables */
			const varcount = read.i();
			const names = [], values = [];
			for (var i = 0; i < varcount; i++) {
				names.push(read.str());
				values.push(TypeIO.readObject(read));
			}
			this.setScript(code, asm => {
				for (var i = 0; i < varcount; i++) {
					var dest = asm.getVar(names[i]);
					if (dest && !dest.constant) {
						dest.value = values[i];
					}
				}
			});

			/* Read memory */
			const memcount = read.i();
			const memory = [];
			for (var i = 0; i < memcount; i++) {
				memcount[i] = read.d();
			}
			this.vm.memory = memory;
		}
	});

	// Start of our reserved variables
	ent.startIdx = -1;
	ent.code = null;
	ent.vm = new LExecutor();

	/* Initialise memory */
	const memory = [];
	for (var i = 0; i < spock.memory; i++) {
		memory[i] = 0;
	}
	ent.vm.memory = memory;

	return ent;
};

module.exports = spock;
