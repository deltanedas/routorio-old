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

/* "vulcan" instruction */
// TODO: Overhaul by setting 4 bits for every side, or flipping each bit

var spock;

const vars = ["output", "source", "item", "side"];

const VulcanI = {
	_(builder, key, to, from) {
		this.key = key.substr(1);
		this.to = builder.var(to);
		this.from = builder.var(from);
	},

	run(vm) {
		const from = vm.building(this.from);
		if (!(from && from.block == spock)) {
			return;
		}

		if (this.key == "output") {
			from.vars.output = vm.num(this.to);
			return;
		}

		const val = from.vars[this.key];
		if (val == undefined) return;

		vm[typeof(val) == "number" ? "setnum" : "setobj"](this.to, val);
	}
};

const VulcanStatement = {
	new: words => {
		const st = extend(LStatement, Object.create(VulcanStatement));
		st.read(words);
		return st;
	},

	read(words) {
		this.key = words[1];
		this.to = words[2];
		this.from = words[3];
	},

	build(h) {
		if (h instanceof Table) {
			return this.buildt(h);
		}

		const inst = extend(LExecutor.LInstruction, Object.create(VulcanI));
		inst._(h, this.key, this.to, this.from);
		return inst;
	},

	buildt(table) {
		const keyf = this.field(table, this.key, text => {
			this.key = text;
		}).width(150).padRight(0).left().get();

		const b = new Button(Styles.logict);
		b.image(Icon.pencilSmall);

		b.clicked(() => this.showSelectTable(b, (t, hide) => {
			const list = new Table();
			for (var i of vars) {
				const name = "@" + i;
				list.button(i == "output" ? "[accent]" + name : name, () => {
					this.key = name;
					keyf.text = name;
					hide.run();
				}).size(240, 40).row();
			}

			t.add(list).width(240).left();
		}));
		table.add(b).size(40).padLeft(-1).color(table.color);

		// takes 2 columns so that it doesnt do a weird ui thing
		table.label(() => this.key == "@output" ? "=" : "->").left().marginLeft(10);
		this.row(table);

		this.field(table, this.to, text => {this.to = text});

		table.add(" in ");
		this.field(table, this.from, text => {this.from = text});
	},

	write(builder) {
		builder.append("vulcan ");
		builder.append(this.key + "");
		builder.append(" ");
		builder.append(this.to + "");
		builder.append(" ");
		builder.append(this.from + "");
	},

	name: () => "Vulcan Router",
	color: () => Pal.logicBlocks
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("vulcan", func(VulcanStatement.new));

LogicIO.allStatements.add(prov(() => VulcanStatement.new([
	"vulcan",
	"@output",
	"side",
	"router1"
])));

spock = extendContent(Router, "vulcan-router", {});

spock.buildType = () => extendContent(Router.RouterBuild, spock, {
	getTileTarget(item, from, set) {
		const dir = this._vars.output;
		if (dir == -1) return null;
		const tile = this.tile.nearby(Mathf.mod(dir, 4));
		if (!tile || !tile.build) return null;
		this._vars.output = -1;
		return tile.build.acceptItem(this, item) ? tile.build : null;
	},

	handleItem(source, item) {
		this.super$handleItem(source, item);
		this._vars.source = source;
		this._vars.item = item;
		this._vars.side = source.tile.relativeTo(this.tile);
	},

	acceptItem(source, item) {
		return this.power.status >= 1
			&& this.team == source.team
			&& this.items.total() == 0;
	},

	getVars() {return this._vars},
	setVars(set) {this._vars = set},

	_vars: {
		output: -1,
		side: -1,
		source: null,
		item: null
	}
});

module.exports = spock;
