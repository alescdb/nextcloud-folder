EXTENSION_NAME = nextcloud-folder@cosinus.org

.PHONY: package
package: clean
	cd src &&	zip -r ../$(EXTENSION_NAME).zip .

.PHONY: install
install:
	glib-compile-schemas src/schemas/
	mkdir -p $(HOME)/.local/share/gnome-shell/extensions/$(EXTENSION_NAME)
	cp -av src/* $(HOME)/.local/share/gnome-shell/extensions/$(EXTENSION_NAME)

.PHONY: clean
clean:
	rm -f *.zip