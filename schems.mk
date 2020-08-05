MSCH := pictoschem
SCHEMATICS := $(XDG_DATA_HOME)/Mindustry/schematics
# Android, Termux
ifeq ($(shell uname -o),Android)
	SCHEMATICS := /sdcard/Android/data/io.anuke.mindustry/files/schematics
endif

# Exclude block portions, unit legs, etc

dist := clear-router colossus double-router explosive-router \
	incinerouter inverted-router op-router titanium-double-router \
	alien-router
power := arc-router electric-router moderouter solar-router surge-router \
	phase-router
prod := ubuntium-router

blocks := $(dist:%=distribution/%) $(power:%=power/%) $(prod:%=production/%) \
	units/reverout-factory units/router-house units/router-chainer-icon

units := reverout routerpede

schems := $(blocks:%=blocks/%) $(units:%=units/%) \
	mechs/sexy-router
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
