const routorio = this.global.routorio;

const beryllium = extendContent(Item, "beryllium", {
	init() {
		this.super$init();
		const parent = TechTree.all.find(node => node.content == routorio["ubuntium-router"]);
		const mynode = TechTree.create(parent.content, this);
		mynode.parent = parent;
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
