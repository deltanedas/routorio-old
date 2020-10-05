const routorio = this.global.routorio;

const beryllium = extendContent(Item, "beryllium", {
	init() {
		this.super$init();
		routorio.research(this, "ubuntium-router");
	},

	researchRequirements: () => ItemStack.with(
		Items.silicon, 3000,
		Items.graphite, 7000,
		Items.titanium, 4500),

	color: Color.valueOf("#c3d6c7")
});

module.exports = {
	beryllium: beryllium
};
