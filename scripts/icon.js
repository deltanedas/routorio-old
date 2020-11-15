// praise the one true cat god
Events.on(ClientLoadEvent, () => {
	const router = Core.atlas.find("routorio-white-router");
	Icon.icons.put("router", new TextureRegionDrawable(router));
});
