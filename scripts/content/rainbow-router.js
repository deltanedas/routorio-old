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

const rainbow = extendContent(Router, "rainbow-router", {
	load() {
		this.super$load();
		this.region = Core.atlas.find("router");
		this.drawable = new TextureRegionDrawable(this.region);
	},

	minimapColor(tile) {
		return tile.build.get() != -1 ? this.colours[tile.build.get()].rgba : this.super$minimapColor(tile);
	},

	colours: Vars.playerColors
});

rainbow.config(java.lang.Integer, (build, colour) => {
	if (colour == -1 || rainbow.colours[colour]) {
		build.load(colour);
	}
});

var scrollPos = 0;

rainbow.buildType = () => extendContent(Router.RouterBuild, rainbow, {
	draw() {
		Draw.rect(rainbow.region, this.x, this.y);
		if (this.colour != -1) {
			Draw.color(rainbow.colours[this.colour]);
			Draw.alpha(0.75);
			Fill.rect(this.x, this.y, Vars.tilesize, Vars.tilesize);
			Draw.color();
		}
	},

	buildConfiguration(table) {
		const pane = table.pane(t => {
			t.background(rainbow.drawable);

			// Like m.w.blocks.ItemSelection but for colours
			for (var i in rainbow.colours) {
				this.button(t, i);

				if (i % 4 == 3) {
					t.row();
				}
			}
		}).maxHeight(Scl.scl(40 * 5)).get();

		// Only add scroll stuff if it's needed
		if (rainbow.colours.length > 20) {
			pane.setScrollingDisabled(true, false);
			pane.scrollYForce = scrollPos;
			pane.update(() => {
				scrollPos = pane.scrollY;
			});
			pane.setOverscroll(false, false);
		}
	},

	button(t, i) {
		const button = t.button(Tex.whiteui.tint(rainbow.colours[i]), Styles.clearToggleTransi, 24, () => {
			this.configure(new java.lang.Integer(this.colour == i ? -1 : i));
			Vars.control.input.frag.config.hideConfig();
		}).size(40).get();
		button.update(() => {
			button.checked = this.colour == i;
		});
	},

	acceptItem(source, item) {
		return this.super$acceptItem(source, item)
			// Block if rainbow has a different colour than this one
			&& (source.block != rainbow || source.get() == this.colour);
	},

	read(read, version) {
		this.super$read(read, version);
		this.colour = read.b();
	},

	write(write) {
		this.super$write(write);
		write.b(this.colour);
	},

	load(colour) {
		this.colour = colour;
		if (Vars.ui) {
			Vars.renderer.minimap.update(this.tile);
		}
	},

	get() {
		return this.colour;
	},

	config() {
		return new java.lang.Integer(this.colour);
	},

	colour: -1
});

module.exports = rainbow;
