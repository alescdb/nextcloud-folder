'use strict';

const { Adw, Gio, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() {
}

function folderChooser(window, settings) {
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
        }
        dialog.destroy();
    });
    dialog.show();
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.nextcloud-folder');
    const builder = new Gtk.Builder();
    builder.set_translation_domain(Me.metadata.uuid);
    builder.add_from_file(Me.path + '/ui/prefs.ui');
    const page = builder.get_object('prefs');
    window.add(page);

    const group = builder.get_object('group-path');
    settings.bind('dark', builder.get_object('dark'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('custom-path', builder.get_object('custom-path'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('custom-path', group, 'visible', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('path', group, 'subtitle', Gio.SettingsBindFlags.DEFAULT);

    builder.get_object('button-path').connect('clicked', () => {
        folderChooser(window, settings);
    });
}