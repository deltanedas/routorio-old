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

const combatRouter = extendContent(ItemTurret, "combat-router", {
	load() {
		this.super$load();
		this.facade = Core.atlas.find("routorio-totally-4-distributors");
	},

	draw(tile) {
		Draw.rect(tile.team == Vars.player.team ? this.baseRegion : this.facade, tile.drawx(), tile.drawy());
	},

	drawLayer(tile) {
		if (tile.team == Vars.player.team) {
			this.super$drawLayer(tile);
		}
	}
});

module.exports = combatRouter;
