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

const routoid = require("routorio/lib/routoid");

const asm = extendContent(PayloadAcceptor, "routoid-assembler", {
	setStats() {
		this.super$setStats();
		this.stats.add(BlockStat.productionTime, this.craftTime / 60, StatUnit.seconds);
	},

	outputsItems: () => false,
	// 4 routoids/s
	craftTime: 15
});

// No breed = vanilla router
asm.breeds = [null, "alien", "surge",
	"phase", "electric", "solar", "arc",
	"fusion", "inverted", "ubuntium",
	"sexy", "clear"];

asm.buildType = () => extendContent(PayloadAcceptor.PayloadAcceptorBuild, asm, {
	updateTile() {
		if (this.consValid() && !this.payload) {
			this.progress += this.edelta();
		}

		if (this.progress >= asm.craftTime) {
			this.progress = 0;
			this.payload = extend(Payload, Object.create(routoid));
			this.payload.init(asm.breeds[Math.round(Mathf.random(asm.breeds.length))]);
			this.payVector.setZero();
			this.consume();
		}

		this.moveOutPayload();
	},

	draw() {
		Draw.rect(asm.region, this.x, this.y);
		Draw.rect(asm.outRegion, this.x, this.y, this.rotation * 90);
		this.drawPayload();
		Draw.rect(asm.topRegion, this.x, this.y);
	},

	dumpPayload() {},

	acceptPayload: (s, p) => false,

	progress: 0
});

module.exports = asm;
