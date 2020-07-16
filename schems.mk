MSCH := pictoschem

# Exclude block portions, unit legs, etc

dist := clear-router colossus double-router explosive-router \
	incinerouter inverted-router op-router titanium-double-router
power := arc-router electric-router moderouter solar-router surge-router
prod := ubuntium-router

blocks := $(dist:%=distribution/%) $(power:%=power/%) $(prod:%=production/%) \
	units/reverout-factory units/router-house

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
