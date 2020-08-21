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
	outputsItems: () => false
});

// 1 routoid/s
asm.craftTime = 60;

Vars.netClient.addPacketHandler("assemble-routoid", pos => {
	const matched = pos.match(/\d+,\d+/);
	if (!matched) return;

	const tile = Vars.world.tile(matched.x, matched.y);
	if (!tile || tile.block() != asm) return;

	tile.bc().spawn();
});

asm.entityType = () => {
	const ent = extendContent(PayloadAcceptor.PayloadAcceptorBuild, asm, {
		updateTile() {
			if (this.consValid() && !this.payload) {
				this.progress += this.edelta();
			}

			if (this.progress >= asm.craftTime) {
				this.progress = 0;
				this.payload = extend(Payload, routoid);
				this.payload.init("router");
				this.payVector.setZero();
				this.consume();
			}

			this.moveOutPayload();
		},

		spawn() {
			if (Vars.ui) {
				Tmp.v1.trns(this.rotdeg(), 12);
				Fx.smeltsmoke.at(this.x + Tmp.v1.x, this.y + Tmp.v1.y);
			}

			if (!Vars.net.client()) {
				print("Yay build");
			}
			this.payload = null;
		},

		dumpPayload() {
			this.spawn();
/*			if (Vars.net.client) {
				this.spawn();
			} else {
				Call.clientPacketReliable("assemble-routoid",
					this.tile.x + "," + this.tile.y);
			} */
		},

		acceptPayload: (s, p) => false
	});
	ent.progress = 0;
	return ent;
};

module.exports = asm;
