// Copyright (C) 2011 R M Yorston
// Licence: GPLv2+

const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const St = imports.gi.St;
const Shell = imports.gi.Shell;

const Main = imports.ui.main;

function MyBox(label) {
    this._init(label);
}

MyBox.prototype = {
    _init: function(label) {
        this.actor = new Shell.GenericContainer();
        this._label = label;
        this.actor.add_actor(label);
        this._width = 0;

        this.actor.connect('get-preferred-width', Lang.bind(this, this._getPreferredWidth));
        this.actor.connect('get-preferred-height', Lang.bind(this, this._getPreferredHeight));
        this.actor.connect('allocate', Lang.bind(this, this._allocate));
    },

    _getPreferredWidth: function(actor, forHeight, alloc) {
        let [minWidth, natWidth] = this._label.get_preferred_width(forHeight);

        alloc.min_size = minWidth;

        let delta = Math.abs(this._width - natWidth);
        if ( this._width == 0 || delta*100/this._width > 10 ) {
            alloc.natural_size = this._width = natWidth+4;
        }
        else if ( natWidth > this._width ) {
            alloc.natural_size = this._width = natWidth;
        }
        else {
            alloc.natural_size = this._width;
        }
    },

    _getPreferredHeight: function(actor, forWidth, alloc) {
        let [minHeight, natHeight] = this._label.get_preferred_height(forWidth);
        alloc.min_size = minHeight;
        alloc.natural_size = natHeight;
    },

    _allocate: function(actor, box, flags) {
        let availWidth = box.x2 - box.x1;
        let availHeight = box.y2 - box.y1;

        let [minChildWidth, minChildHeight, natChildWidth, natChildHeight] =
            this._label.get_preferred_size();

        let childWidth = Math.min(natChildWidth, availWidth);
        let childHeight = Math.min(natChildHeight, availHeight);

        let childBox = new Clutter.ActorBox();
        childBox.x1 = 0;
        childBox.y1 = 0;
        childBox.x2 = childBox.x1 + childWidth;
        childBox.y2 = childBox.y1 + childHeight;
        this._label.allocate(childBox, flags);
    }
};

function main() {
    let dateMenu = Main.panel._dateMenu;
    Main.panel._centerBox.remove_actor(dateMenu.actor);

    let label = dateMenu._clock;
    dateMenu.actor.remove_actor(label);
    let box = new MyBox(label);
    dateMenu.actor.set_child(box.actor);

    let children = Main.panel._rightBox.get_children();
    Main.panel._rightBox.insert_actor(dateMenu.actor, children.length-1);
}
