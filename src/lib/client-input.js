var EventEmitter = require('events').EventEmitter;
var debug = false;

// pointer lock stuff
function requestPointerLock(el) {
    return el.requestPointerLock || el.webkitRequestPointerLock || el.mozRequestPointerLock || el.msRequestPointerLock || el.oRequestPointerLock || null;
}

function pointerlockelement() {
    var doc = document;
    return 0 || doc.pointerLockElement || doc.mozPointerLockElement || doc.webkitPointerLockElement || doc.msPointerLockElement || doc.oPointerLockElement || null;
}

var onpointerlockchange = function() {
    if (!pointerlockelement()) {
        // released
        if (currentState == 'playing') {
            self.transition('start');
        }
    }
    if (debug) {
        console.log('lock change');
    }
};

var onpointerlockerror = function() {
    if (debug) console.log('lock error');
};

var mouseCallback = function() {};

var codeMap = {
    // control
    17: 'alt',
    // shift
    16: 'select',
    // W
    87: 'forward',
    // S
    83: 'backward',
    // A
    65: 'left',
    // D
    68: 'right',
    // space
    32: 'jump',
    // F
    70: 'fly'
};


var states = {
    start: {
        to: function() {
            if (debug) {
                console.log('entering start state');
            }
        },
        from: function() {
            if (debug) {
                console.log('leaving start state');
            }
        },
        mouseup: function(event) {
            // Only if event target is the canvas
            if (event.target.tagName == 'CANVAS') {
                this.transition('playing');
                return false;
            }
        },
        change: function(event) {
            switch (event.target.id) {
                case 'drawDistance':
                    this.emitter.emit('drawDistance', event.target.value);
                    break;
                case 'avatar':
                    this.emitter.emit('avatar', event.target.value);
                    break;
            }
        }
    },
    playing: {
        to: function() {
            var self = this;
            if (debug) {
                console.log('entering playing state');
            }
            var el = document.body;
            var locker = requestPointerLock(el);
            locker.call(el);
        },
        from: function() {
            if (debug) {
                console.log('leaving playing state');
            }
            // stop moving
            for (var i in controlStates) {
                controlStates[i] = false;
            }
            if (pointerlockelement()) {
                document.exitPointerLock();
            }
        },
        mousedown: function(event) {
            if (event.which == 3 || controlStates.alt) {
                controlStates.firealt = true;
                this.emitter.emit('firealt.down');
            } else if (event.which == 1) {
                controlStates.fire = true;
                this.emitter.emit('fire.down');
            }
        }, 
        mouseup: function(event) {
            if (event.which == 3 || controlStates.alt) {
                controlStates.firealt = false;
                this.emitter.emit('firealt.up');
            } else if (event.which == 1) {
                controlStates.fire = false;
                this.emitter.emit('fire.up');
            }
        },
        mousemove: function(ev) {
            mouseCallback(
                ev.movementX,
                ev.movementY
            );
        },
        keydown: function(event) {
            // E
            if (event.which == 69) {
                this.transition('materials');
                return;
            }
            // M
            if (event.which == 77) {
                this.transition('map');
                return;
            }
            if (debug) console.log(event);
            var code = event.which;
            var key;
            if (code in codeMap) {
                key = codeMap[code];
                if (key in controlStates) {
                    controlStates[key] = 1;
                }
                return false;
            }
        },
        keyup: function(event) {
            var code = event.which;
            var key;
            if (code == 13) {
                this.transition('chat');
                return false;
            }
            if (code == 27) {
                // escape
                this.transition('start');
                return;
            }
            if (code == 82) {
                // R
                this.emitter.emit('view');
                return;
            }
            if (code == 16) {
                // Shift
                this.emitter.emit('shift');
                return;
            }
            if (code in codeMap) {
                key = codeMap[code];
                if (key in controlStates) {
                    controlStates[key] = 0;
                }
                // try to prevent ctrl+W from bubbling up
                return false;
            }
        }
    },
    // end playing state
    materials: {
        to: function() {
            if (debug) {
                console.log('entering materials state');
            }
        },
        from: function() {
            if (debug) {
                console.log('leaving materials state');
            }
        },
        keydown: function(event) {
            if (debug) {
                console.log(event);
            }
            // Would love for this to exist only in client.js, but need to re-work event handler bind hierarchy
            var adjustment = 0;
            var perRow = 6;
            switch (event.which) {
                // E
                case 69:
                    this.transition('playing');
                    break;

                // escape should transition back to start
                case 27:
                    this.transition('start');
                    break;

                case 87:
                // W
                case 38:
                    // up
                    adjustment = -perRow;
                    break;

                // S and down
                case 83:
                case 40:
                    adjustment = perRow;
                    break;

                // A and left
                case 65:
                case 37:
                    // left
                    adjustment = -1;
                    break;

                // D and right
                case 68:
                case 39:
                    adjustment = 1;
                    break;

                default:
                break;
            }
            if (adjustment != 0) {
                var matches = document.querySelectorAll('#textureContainer div');
                var from = 0;
                for (var i = 0; i < matches.length; i++) {
                    if (matches[i].className == 'selected') {
                        from = i;
                    }
                    matches[i].className = '';
                }
                matches[from + adjustment].className = 'selected';
                this.emitter.emit('currentMaterial', Number(matches[from + adjustment].getAttribute('data-texturevalue')));
            }
        },
        mousedown: function(event) {
            var $div = $(event.target).closest('div');
            var matches = document.querySelectorAll('#textureContainer div');
            var from = 0;
            for (var i = 0; i < matches.length; i++) {
                matches[i].className = '';
            }
            $div.addClass('selected');
            this.emitter.emit('currentMaterial', Number($div.data('texturevalue')));
        }
    },
    chat: {
        to: function() {
            if (debug) {
                console.log('entering chat state');
            }
            document.getElementById('chat').className = 'active';
            document.getElementById('cmd').focus();
        },
        from: function() {
            if (debug) {
                console.log('leaving chat state');
            }
            document.getElementById('chat').className = '';
            document.getElementById('cmd').value = '';
        },
        keyup: function(event) {
            if (event.which == 13) {
                var el = document.getElementById('cmd');
                if (document.activeElement === el) {
                    //unbind mouse would be nice
                    this.emitter.emit('chat', el.value);
                    el.value = '';
                    el.blur();
                    this.transition('playing');
                    return false;
                }
            }
            // if press escape, go back to playing
            if (event.which == 27) {
                // escape
                this.transition('playing');
                return false;
            }
        }
    },
    disconnected: {
        to: function() {
        },
        from: function() {
        }
    }
};

var controlStates = {
    select: false,
    alt: false,
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    fly: false,
    fire: false,
    firealt: false
};

var currentState = '';

var gamepad;

// Really want to proxy events, so that way I can convert controller events to mouse events and send them to the player/camera
// movement handler.
var InputHandler = function(keyboardElement, mouseLockElement) {
    this.keyboardElement = keyboardElement;
    this.mouseLockElement = mouseLockElement;
    this.state = controlStates;
    this.emitter = new EventEmitter();

    // Fix up states data structure with functions bound to this
    for (var state in states) {
        for (var method in states[state]) {
            states[state]['_' + method] = states[state][method].bind(this);
        }
    }
    console.log(states);
};

InputHandler.prototype.mouseDeltaCallback = function(callback) {
    mouseCallback = callback;
};

InputHandler.prototype.transition = function(newState) {
    var current;
    if (currentState) {
        // we might be starting at the null state
        current = states[currentState];
        if ('_from' in current) {
            current['from']();
        }
        // Unbind current event handlers
        for (var method in current) {
            if (method.substr(0, 4) == '_key' || method == '_change') {
                this.keyboardElement.removeEventListener(method.substr(1), current[method]);

            } else if (method.substr(0, 6) == '_mouse') {
                this.mouseLockElement.removeEventListener(method.substr(1), current[method]);
            }
        }
        this.emitter.emit('from.' + currentState);
    }
    if (newState in states) {
        currentState = newState;
        current = states[currentState];
        if ('_to' in current) {
            current['_to']();
        }
        // Bind new event handlers
        for (var method in current) {
            if (method.substr(0, 4) == '_key' || method == '_change') {
                this.keyboardElement.addEventListener(method.substr(1), current[method]);

            } else if (method.substr(0, 6) == '_mouse') {
                this.mouseLockElement.addEventListener(method.substr(1), current[method]);
            }
        }
        this.emitter.emit('to.' + newState);
    }
};

function buttonPressed(b) {
    if (typeof b == "object") {
        return b.pressed;
    }
    return b == 1;
}

var fired = false;

InputHandler.prototype.tick = function() {
    var gamepad = navigator.getGamepads()[0];
    if (!gamepad) {
        return;
    }

    // HANDLE MOVEMENT
    var threshold = 0.15;
    if (gamepad.axes[0] > threshold) {
        controlStates.left = 0;
        controlStates.right = Math.abs(gamepad.axes[0]);
    } else if (gamepad.axes[0] < -threshold) {
        controlStates.left = Math.abs(gamepad.axes[0]);
        controlStates.right = 0;
    } else {
        controlStates.left = controlStates.right = 0;
    }

    if (gamepad.axes[1] > threshold) {
        controlStates.backward = Math.abs(gamepad.axes[1]);
        controlStates.forward = 0;
    } else if (gamepad.axes[1] < -threshold) {
        controlStates.backward = 0;
        controlStates.forward = Math.abs(gamepad.axes[1]);
    } else {
        controlStates.backward = controlStates.forward = 0;
    }

    // HANDLE LOOKING
    threshold = 0.15;
    var speed = 4;
    var lookHorizontal = gamepad.axes[2];
    var lookVertical = gamepad.axes[3];
    var deltaX = 0;
    var deltaY = 0;

    if (lookHorizontal > threshold) {
        deltaX = Math.floor(speed * lookHorizontal);
    } else if (lookHorizontal < -threshold) {
        deltaX = Math.floor(speed * lookHorizontal);
    }

    if (lookVertical > threshold) {
        deltaY = Math.floor(speed * lookVertical);
    } else if (gamepad.axes[3] < -threshold) {
        deltaY = Math.floor(speed * lookVertical);
    }
    if (deltaX || deltaY) {
        mouseCallback(deltaX, deltaY);
    }

    if (buttonPressed(gamepad.buttons[0]) || buttonPressed(gamepad.buttons[7])) {
        controlStates.jump = true;
    } else {
        controlStates.jump = false;
    }
    if (buttonPressed(gamepad.buttons[1]) || buttonPressed(gamepad.buttons[6])) {
        controlStates.fly = true;
    } else {
        controlStates.fly = false;
    }

    // 4 - left shoulder
    // 6 left trigger
    // fire triggers too quickly ... track state changes
    // TODO: update this to emit fire.down and fire.up, same for firealt
    if (buttonPressed(gamepad.buttons[5])) {
        // right shoulder
        if (!fired) {
            this.emitter.emit('fire');
            fired = true;
        }
    } else if (buttonPressed(gamepad.buttons[4])) {
        // right trigger
        if (!fired) {
            this.emitter.emit('firealt');
            fired = true;
        }
    } else {
        fired = false;
    }
};

InputHandler.prototype.on = function(name, callback) {
    this.emitter.on(name, callback);
};

if (!module) {
    module = {};
}

module.exports = InputHandler;