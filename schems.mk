PICTOSCHEM := pictoschem

sprites := $(shell find sprites/blocks -type f)
schems := $(sprites:sprites/blocks/%.png=schems/%.msch)

all: $(schems)

schems/%.msch: sprites/blocks/%.png
	@mkdir -p `dirname $@`
	$(PICTOSCHEM) -o $@ -i $^

clean:
	rm -rf schems
