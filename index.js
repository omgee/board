var board = document.querySelector(".board");
var Stickers = (function () {
    function Stickers() {
    }
    Stickers.create = function (x, y, color, id, text) {
        Stickers.array.push(new Sticker(x, y, color, id, text));
        Stickers.save();
    };
    Stickers.get = function (id) {
        for (var _i = 0, _a = Stickers.array; _i < _a.length; _i++) {
            var sticker = _a[_i];
            if (sticker.id === id)
                return sticker;
        }
    };
    Stickers.last = function () {
        var tmp = 0;
        for (var _i = 0, _a = Stickers.array; _i < _a.length; _i++) {
            var sticker = _a[_i];
            if (sticker.id > tmp)
                tmp = sticker.id;
        }
        return tmp;
    };
    Stickers.remove = function (id) {
        Stickers.get(id).remove();
        Stickers.array.splice(Stickers.array.indexOf(Stickers.get(id)), 1);
        Stickers.save();
    };
    Stickers.save = function () {
        var tmpArray = [];
        for (var _i = 0, _a = Stickers.array; _i < _a.length; _i++) {
            var sticker = _a[_i];
            tmpArray.push({
                x: sticker.x,
                y: sticker.y,
                color: sticker.color,
                id: sticker.id,
                text: sticker.text
            });
        }
        localStorage.setItem("stickers", JSON.stringify(tmpArray));
    };
    Stickers.load = function () {
        var tmpArray = JSON.parse(localStorage.getItem("stickers"));
        for (var _i = 0, tmpArray_1 = tmpArray; _i < tmpArray_1.length; _i++) {
            var sticker = tmpArray_1[_i];
            Stickers.create(sticker.x, sticker.y, sticker.color, sticker.id, sticker.text);
        }
    };
    Stickers.array = [];
    return Stickers;
}());
var Sticker = (function () {
    function Sticker(x, y, color, id, text) {
        this.x = x > 0 ? x : 0;
        this.y = y > 0 ? y : 0;
        this.id = id ? id : Stickers.last() + 1;
        this.text = text ? text : "";
        this.color = color ? color : "#FFEB3B";
        this.create();
    }
    Sticker.prototype.create = function () {
        var sticker = document.createElement("div");
        var sticker_head = document.createElement("div");
        var sticker_body = document.createElement("div");
        var sticker_body_textarea = document.createElement("textarea");
        sticker.draggable = true;
        sticker.className = "sticker";
        sticker_head.className = "sticker-head";
        sticker_body.className = "sticker-body";
        sticker.style.left = this.x + "px";
        sticker.style.top = this.y + "px";
        sticker_body_textarea.value = this.text;
        sticker_body_textarea.spellcheck = false;
        sticker.dataset.id = "" + this.id;
        sticker_head.dataset.id = "" + this.id;
        sticker_body.dataset.id = "" + this.id;
        sticker_body_textarea.dataset.id = "" + this.id;
        sticker_body.appendChild(sticker_body_textarea);
        sticker.appendChild(sticker_head);
        sticker.appendChild(sticker_body);
        sticker.style.background = this.color;
        this.element = sticker;
        board.appendChild(sticker);
        sticker.style.animation = "show .3s cubic-bezier(.25, .8, .25, 1)";
        new MouseListener(this, sticker_body_textarea);
        new KeyboardListener(this, sticker_body_textarea);
    };
    Sticker.prototype.remove = function () {
        var _this = this;
        this.element.style.transform = "scale(0)";
        setTimeout(function () {
            _this.element.remove();
        }, 300);
    };
    Sticker.prototype.move = function (x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
        Stickers.save();
    };
    return Sticker;
}());
var KeyboardListener = (function () {
    function KeyboardListener(sticker, textarea) {
        var _this = this;
        this.sticker = sticker;
        this.element = sticker.element;
        this.textarea = textarea;
        this.textarea.addEventListener("keyup", function () {
            _this.keyUp();
        }, false);
    }
    KeyboardListener.prototype.keyUp = function () {
        this.sticker.text = this.textarea.value;
        Stickers.save();
    };
    return KeyboardListener;
}());
var MouseListener = (function () {
    function MouseListener(sticker, sticker_body_textarea) {
        var _this = this;
        this.sticker = sticker;
        this.element = sticker.element;
        this.textarea = sticker_body_textarea;
        this.element.addEventListener("dragstart", function (e) {
            _this.dragStart(e);
        }, false);
        this.element.addEventListener("drag", function (e) {
            _this.drag(e);
        }, false);
        this.element.addEventListener("dragend", function (e) {
            _this.dragEnd(e);
        }, false);
        this.textarea.addEventListener("mousedown", function () {
            _this.textarea.readOnly = true;
        }, false);
        this.textarea.addEventListener("mouseup", function () {
            _this.textarea.readOnly = false;
            _this.textarea.blur();
            _this.textarea.focus();
        }, false);
    }
    MouseListener.prototype.dragStart = function (e) {
        this.x = e.offsetX;
        this.y = e.offsetY;
        var crt = this.element.cloneNode(true);
        e.dataTransfer.setDragImage(crt, 0, 0);
    };
    MouseListener.prototype.drag = function (e) {
        if (e.clientX == 0 && e.clientY == 0)
            return;
        this.sticker.move(e.clientX - this.x, e.clientY - this.y);
    };
    MouseListener.prototype.dragEnd = function (e) {
        var _a = [e.clientX - this.x, e.clientY - this.y], x = _a[0], y = _a[1];
        if (x < 0)
            x = 5;
        if (y < 0)
            y = 5;
        if (x + 200 > board.clientWidth)
            x = board.clientWidth - 205;
        if (y + 200 > board.clientHeight)
            y = board.clientHeight - 205;
        this.sticker.move(x, y);
    };
    MouseListener.mouseup = function (e) {
        if (e.button === 2) {
            e.preventDefault();
            Color.hide();
            var target = e.target;
            if (target.className === "board" || target.className === "sticker-colors" || target.className === "sticker-yellow") {
                Stickers.create(e.clientX - 100, e.clientY - 100);
            }
            else if (target.className === "sticker-green") {
                Stickers.create(e.clientX - 100, e.clientY - 100, "#8BC34A");
            }
            else if (target.className === "sticker-red") {
                Stickers.create(e.clientX - 100, e.clientY - 100, "#F44336");
            }
            else if (target.className === "sticker-blue") {
                Stickers.create(e.clientX - 100, e.clientY - 100, "#03A9F4");
            }
            else {
                Stickers.remove(parseInt(target.dataset.id));
            }
        }
    };
    MouseListener.context = function (e) {
        e.preventDefault();
        var target = e.target;
        if (target.className === "board")
            Color.show(e.clientX - 57, e.clientY - 57);
    };
    return MouseListener;
}());
var Color = (function () {
    function Color() {
    }
    Color.init = function () {
        var stickerColors = document.createElement("div");
        var stickerYellow = document.createElement("div");
        var stickerGreen = document.createElement("div");
        var stickerRed = document.createElement("div");
        var stickerBlue = document.createElement("div");
        stickerColors.className = "sticker-colors";
        stickerYellow.className = "sticker-yellow";
        stickerGreen.className = "sticker-green";
        stickerRed.className = "sticker-red";
        stickerBlue.className = "sticker-blue";
        stickerColors.appendChild(stickerYellow);
        stickerColors.appendChild(stickerGreen);
        stickerColors.appendChild(stickerRed);
        stickerColors.appendChild(stickerBlue);
        Color.element = stickerColors;
        document.body.appendChild(Color.element);
    };
    Color.show = function (x, y) {
        Color.element.style.transform = "translate(" + x + "px, " + y + "px)";
        Color.element.style.display = "flex";
        Color.element.style.animation = "showColorPicker .3s cubic-bezier(.25, .8, .25, 1)";
    };
    Color.hide = function () {
        Color.element.style.display = "none";
    };
    return Color;
}());
Color.init();
board.addEventListener("contextmenu", MouseListener.context, false);
board.addEventListener("mouseup", MouseListener.mouseup, false);
Color.element.addEventListener("mouseup", MouseListener.mouseup, false);
Stickers.load();
