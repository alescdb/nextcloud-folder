EXTENSION_NAME = nextcloud-folder@cosinus.org

.PHONY: package
package: clean
	zip -j $(EXTENSION_NAME).zip src/*

.PHONY: install
install:
	glib-compile-schemas schemas/
	mkdir -p $(HOME)/.local/share/gnome-shell/extensions/$(EXTENSION_NAME)
	cp -av src/* $(HOME)/.local/share/gnome-shell/extensions/$(EXTENSION_NAME)
	cp -av schemas $(HOME)/.local/share/gnome-shell/extensions/$(EXTENSION_NAME)/

.PHONY: clean
clean:
	rm -f *.zip