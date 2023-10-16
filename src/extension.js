/* extension.js
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

import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Button } from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const NextcloudFolderIndicator = GObject.registerClass(
    {
        _TimeoutId: null,
        _FirstTimeoutId: null,
        _updateProcess_sourceId: null,
        _updateProcess_stream: null,
        _updateProcess_pid: null,
        _updateList: [],
    },
    class NextcloudFolderIndicator extends Button {
        _openFolder() {
            const path = this._getPath();
            const uri = GLib.filename_to_uri(path, null);
            const file = Gio.File.new_for_uri(uri);

            if (file.query_exists(null)) {
                Gio.AppInfo.launch_default_for_uri_async(uri, null, null, null);
            } else {
                Main.notify("Can't find : " + path);
            }
        }

        _getIcon() {
            if (this._settings.get_boolean('dark')) {
                return Gio.icon_new_for_string(this._extension.path + "/nextcloud-dark.svg");
            }
            return Gio.icon_new_for_string(this._extension.path + "/nextcloud-light.svg");
        }

        _getPath() {
            if (this._settings.get_boolean('custom-path')) {
                const path = this._settings.get_string('path');
                if (path) {
                    return path;
                }
            }
            return GLib.build_filenamev([GLib.get_home_dir(), 'Nextcloud']);
        }

        _init(extension) {
            super._init(0.0, _('Nextcloud Folder'));
            this._extension = extension;
            this._settings = extension.getSettings();

            const button = new St.Bin({
                reactive: true,
            });
            const icon = new St.Icon({
                gicon: this._getIcon(),
                style_class: 'nextcloud-icon'
            });

            this._settings.connect('changed::dark', () => {
                icon.gicon = this._getIcon();
            });

            button.set_child(icon);
            this.add_child(button);

            button.connect('button-press-event', () => {
                this._openFolder()
            });
        }
    });

export default class NextcloudFolderExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._uuid = metadata.uuid;
    }

    enable() {
        this._indicator = new NextcloudFolderIndicator(this);
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

// function init(meta) {
//     return new NextcloudFolderExtension(meta.uuid);
// }
