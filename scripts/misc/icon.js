// praise the one true cat god
try {
	// typeof(Fonts.addIcon) throws an error so h
	Fonts.addIcon;

	Events.on(ClientLoadEvent, () => {
		Fonts.addIcon("router", "routorio-white-router");
		Fonts.addIcon("anuke", "god");
	});
} catch (e) {}
