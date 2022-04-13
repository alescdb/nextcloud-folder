'use strict';

const { Adw, Gio, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() {
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

function createIconGroup(group, settings) {
    const row = new Adw.ActionRow({ title: 'Use dark icon' });
    const widget = new Gtk.Switch({
        active: settings.get_boolean('dark'),
        valign: Gtk.Align.CENTER,
    });
    settings.bind('dark', widget, 'active', Gio.SettingsBindFlags.DEFAULT);

    row.add_suffix(widget);
    row.activatable_widget = widget;

    group.add(row);
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.nextcloud-folder');
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    createIconGroup(group, settings);

    ////////////////////////////////////////////////////
    // Custom Folder
    ////////////////////////////////////////////////////

    let row = new Adw.ActionRow({ title: 'Use custom path' });
    let custom = new Gtk.Switch({
        active: settings.get_boolean('custom-path'),
        valign: Gtk.Align.CENTER,
    });
    settings.bind('custom-path', custom, 'active', Gio.SettingsBindFlags.DEFAULT);

    row.add_suffix(custom);
    row.activatable_widget = custom;
    group.add(row);

    ////////////////////////////////////////////////////
    // Custom Path
    ////////////////////////////////////////////////////

    const folder = new Adw.ActionRow({ title: "Folder path" });
    const button = new Gtk.Button({ iconName: 'document-open-symbolic' });
    updatePath(settings, folder);

    button.connect('clicked', () => {
        folderChooser(window, settings, () => {
            updatePath(settings, folder);
        });
    });
    folder.add_suffix(button);
    folder.activatable_widget = button;

    folder.visible = settings.get_boolean('custom-path');
    custom.connect("state-set", () => {
        folder.visible = !custom.get_state();
    });
    group.add(folder);

    window.add(page);
}