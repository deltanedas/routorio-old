const sexy = extendContent(UnitType, "sexy-router", {});

sexy.constructor = () => extend(MechUnit, {});

// Sexy router just uses MechUnit, no need for extra class id

module.exports = sexy;
