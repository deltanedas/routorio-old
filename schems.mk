MSCH := pictoschem
SCHEMATICS := $(XDG_DATA_HOME)/Mindustry/schematics
# Android, Termux
PACKAGE := io.anuke.mindustry.be
ifeq ($(shell uname -o),Android)
	SCHEMATICS := /sdcard/Android/data/$(PACKAGE)/files/schematics
endif

# Exclude block portions, unit legs, etc

dist := clear-router colossus double-router explosive-router \
	incinerouter inverted-router op-router titanium-double-router \
	alien-router rainbow-router
power := arc-router electric-router moderouter solar-router surge-router \
	phase-router fusion-router
prod := ubuntium-router routerfruit
logic := vulcan-router

blocks := $(dist:%=distribution/%) $(power:%=power/%)\
	$(prod:%=production/%) $(logic:%=logic/%) \
	units/router-chainer

units := reverout routerpede sexy-router

schems := $(blocks:%=blocks/%) $(units:%=units/%)
schems := $(schems:%=schems/%.msch)

all: $(schems)

schems/%.msch: sprites/%.png
	@mkdir -p `dirname $@`
	@printf "MSCH\t%s\n" $@
	@$(MSCH) -o $@ -i $^

clean:
	rm -rf schems

install: all
	cp -rf $(schems) $(SCHEMATICS)/
