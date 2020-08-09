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

const connected = require("routorio/lib/connected");

const liquid = new Liquid("routorio-liquid-router");

const fusion = extendContent(LiquidBlock, "fusion-router", connected.new("block", {
	load() {
		this.super$load();
		this.loadConnect();
		this.topRegion = Core.atlas.find(this.name + "-top");
	}
}));

const building = connected.new("building", {
	draw() {
		if (this.liquids.total() > 0.001) {
			this.drawLiquid();
		}
		this.drawEdges();
		this.drawCorners();
		Draw.rect(this.topRegion, this.x, this.y);
	},

	drawLiquid() {
		Draw.color(liquid.color);
		Draw.alpha(this.liquids.total() / fusion.liquidCapacity);
		Fill.rect(this.x, this.y, 32, 32);
		Draw.reset();
	},

	generateIcons() {
		return [Core.atlas.find(this.name)];
	},

	acceptLiquid(source, type, amount) {
		return type.id == liquid.id;
	}
}, fusion);

fusion.entityType = () => {
	const ent = extendContent(LiquidBlock.LiquidBlockEntity, fusion, building);
	ent.blendBits = 0;
	return ent;
};

module.exports = fusion;
