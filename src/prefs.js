'use strict';

const { Adw, Gio, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
// const DesktopIconsUtil = imports.desktopIconsUtil;

function init() {
}

function createBoolean(settings, nfo) {
    const row = new Adw.ActionRow({ title: nfo.title });
    const widget = new Gtk.Switch({
        active: settings.get_boolean(nfo.name),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        nfo.name,
        widget,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    row.add_suffix(widget);
    row.activatable_widget = widget;

    return (row);
}

function folderChooser(window, settings, callbak) {
    let dialog = new Gtk.FileChooserDialog({
        title: 'Select Nexcloud Folder',
        transient_for: window,
        modal: true,
    });
    dialog.set_action(Gtk.FileChooserAction.SELECT_FOLDER);
    dialog.set_create_folders(true);
    dialog.add_button('Cancel', Gtk.ResponseType.CANCEL);
    dialog.add_button('Select', Gtk.ResponseType.ACCEPT);
    dialog.connect('close', () => {
        dialog.response(Gtk.ResponseType.CANCEL);
    });
    dialog.connect('response', (actor, response) => {
        if (response === Gtk.ResponseType.ACCEPT) {
            settings.set_string('path', dialog.get_file().get_path());
            callbak();
        }
        dialog.destroy();
    });
    dialog.show();
}

function updatePath(settings, row) {
    const path = settings.get_string('path');
    if (path) {
        row.set_subtitle(settings.get_string('path'));
    }
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.nextcloud-folder');
    log(settings);

    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    group.add(createBoolean(settings, {
        title: 'Use dark icon',
        name: 'dark'
    }));
    group.add(createBoolean(settings, {
        title: 'Use custom Nextcloud path',
        name: 'custom-path'
    }));

    const row = new Adw.ActionRow({ title: "Custom Folder Path" });
    const button = new Gtk.Button({ iconName: 'document-open-symbolic' });
    updatePath(settings, row);

    button.connect('clicked', () => {
        folderChooser(window, settings, () => {
            updatePath(settings, row);
        });
    });
    row.add_suffix(button);
    row.activatable_widget = button;
    group.add(row);

    window.add(page);
}
