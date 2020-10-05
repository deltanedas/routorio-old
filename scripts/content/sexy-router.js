const routorio = this.global.routorio;

const sexy = extendContent(UnitType, "sexy-router", {
	init() {
		this.super$init();
		routorio.research(this, "router-chainer");
	},

	researchRequirements: () => ItemStack.with(
		Items.copper, 1200,
		Items.silicon, 2000)
});
sexy.constructor = () => extend(MechUnit, {});

module.exports = sexy;
