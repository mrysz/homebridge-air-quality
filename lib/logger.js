"use strict";

module.exports = {
    handler: null,

    log: function (level, string) {
        this.handler[level]("[" + new Date().toISOString() + "] " + string);
    }
};
