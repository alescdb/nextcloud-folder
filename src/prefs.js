/* prefs.js
 *
 * MIT License
 * 
 * Copyright (c) 2022 Alex
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import Gio from "gi://Gio";
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js"


export default class NextcloudFolderPreferences extends ExtensionPreferences {
    folderChooser(window, settings) {
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

    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const builder = new Gtk.Builder();
        builder.set_translation_domain(this.metadata.uuid);
        builder.add_from_file(this.dir.get_path() + '/ui/prefs.ui');
        const page = builder.get_object('prefs');
        window.add(page);

        const group = builder.get_object('group-path');
        settings.bind('dark', builder.get_object('dark'), 'active', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('custom-path', builder.get_object('custom-path'), 'active', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('custom-path', group, 'visible', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('path', group, 'subtitle', Gio.SettingsBindFlags.DEFAULT);

        builder.get_object('button-path').connect('clicked', () => {
            this.folderChooser(window, settings);
        });
    }
}