const offset = 1.6 * Vars.tilesize;

const dist = (2 * offset^2)^0.5

const rotors = [
	1, 1,
	1, -1,
	-1, -1,
	-1, 1
];

const reverout = extendContent(UnitType, "reverout", {
	load() {
		this.weapon.region = Core.atlas.find("clear");
		this.region = Core.atlas.find(this.name);
		this.rotor = Core.atlas.find("router");
	}
});
reverout.constructor = prov(() => extend(FlyingUnit, {
	drawOver() {
		const r = this.rotation;
		const sin = Mathf.sin(r) * dist;
		const cos = Mathf.cos(r) * dist;
		var x, y;
		for (var i = 0; i < 8; i += 2) {
			x = rotors[i] * offset;
			y = rotors[i + 1] * offset;
			Draw.rect(reverout.rotor,
				this.x + Angles.trnsx(r, x, y),
				this.y + Angles.trnsy(r, x, y),
				r + Time.time() * 20);
		}
	}
}));
