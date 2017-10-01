var board = document.querySelector(".board");
var Stickers = (function () {
    function Stickers() {
    }
    Stickers.remove = function (id) {
        Stickers.array.splice(id, 1);
        for (var i = 0; i < Stickers.array.length; i++) {
            Stickers.array[i].id = i;
        }
        Stickers.drawAll();
        Stickers.save();
    };
    Stickers.drawAll = function () {
        board.innerHTML = "";
        for (var _i = 0, _a = Stickers.array; _i < _a.length; _i++) {
            var sticker = _a[_i];
            sticker.draw();
        }
    };
    Stickers.convertAll = function () {
        Stickers.convertedArray = [];
        for (var _i = 0, _a = Stickers.array; _i < _a.length; _i++) {
            var sticker = _a[_i];
            Stickers.convertedArray.push(sticker.convert());
        }
    };
    Stickers.reConvertAll = function () {
        Stickers.array = [];
        for (var _i = 0, _a = Stickers.convertedArray; _i < _a.length; _i++) {
            var sticker = _a[_i];
            new Sticker(sticker.x, sticker.y, sticker.id, sticker.text);
        }
        Stickers.drawAll();
    };
    Stickers.move = function (id, x, y) {
        Stickers.array[id].move(x, y);
    };
    Stickers.save = function () {
        Stickers.convertAll();
        localStorage.setItem("stickers", JSON.stringify(Stickers.convertedArray));
    };
    Stickers.load = function () {
        Stickers.reConvertAll();
    };
    Stickers.changeText = function (id) {
        Stickers.array[id].text = document.querySelector("[data-id=\"" + id + "\"]").parentElement.querySelector("textarea").value;
        Stickers.save();
    };
    Stickers.array = [];
    Stickers.convertedArray = JSON.parse(localStorage.getItem("stickers")) || [];
    return Stickers;
}());
var Sticker = (function () {
    function Sticker(x, y, id, text) {
        this.x = x > 0 ? x : 0;
        this.y = y > 0 ? y : 0;
        this.id = id ? id : Stickers.array.length;
        this.text = text ? text : "";
        Stickers.array.push(this);
        this.draw();
        this.element = document.querySelector("[data-id=\"" + this.id + "\"]").parentElement;
    }
    Sticker.prototype.draw = function () {
        board.innerHTML += "<div class=\"sticker\" style=\"left: " + this.x + "px; top: " + this.y + "px;\"><div data-id=\"" + this.id + "\" class=\"sticker-head\"></div><div class=\"sticker-body\"><textarea onkeydown=\"Stickers.changeText(" + this.id + ")\">" + this.text + "</textarea></div></div>";
    };
    Sticker.prototype.move = function (x, y) {
        this.element = document.querySelector("[data-id=\"" + this.id + "\"]").parentElement;
        this.x = x;
        this.y = y;
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
    };
    Sticker.prototype.convert = function () {
        return {
            x: this.x,
            y: this.y,
            id: this.id,
            text: this.text
        };
    };
    return Sticker;
}());
var Mouse = (function () {
    function Mouse() {
        var _this = this;
        this.isDown = false;
        this.id = null;
        board.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            _this.onContextMenu(e);
            return false;
        }, false);
        board.addEventListener("mousedown", function (e) {
            _this.onDown(e);
        }, false);
        board.addEventListener("mousemove", function (e) {
            e.preventDefault();
            _this.onMove(e);
            return false;
        }, false);
        board.addEventListener("mouseup", function (e) {
            e.preventDefault();
            _this.onUp(e);
            return false;
        }, false);
    }
    Mouse.prototype.onContextMenu = function (e) {
        if (e.target.className === "board") {
            new Sticker(e.clientX - 100, e.clientY - 100);
        }
        else if (e.target.className === "sticker-head") {
            Stickers.remove(e.target.dataset.id);
        }
    };
    Mouse.prototype.onDown = function (e) {
        if (e.target.className === "sticker-head") {
            this.oldX = e.offsetX;
            this.oldY = e.offsetY;
            this.isDown = true;
            this.id = e.target.dataset.id;
        }
    };
    Mouse.prototype.onMove = function (e) {
        if (this.isDown && this.id) {
            Stickers.move(this.id, e.clientX - this.oldX, e.clientY - this.oldY);
        }
    };
    Mouse.prototype.onUp = function (e) {
        this.isDown = false;
        this.id = null;
        Stickers.save();
    };
    return Mouse;
}());
new Mouse();
Stickers.load();
