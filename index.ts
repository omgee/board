const board = document.querySelector(`.board`);

interface ConvertedSticker {
    x: number;
    y: number;
    id: number;
    text: string;
}

class Stickers {
    static array: Array<Sticker> = [];
    static convertedArray: Array<ConvertedSticker> = JSON.parse(localStorage.getItem(`stickers`)) || [];

    static remove(id: number): void {
        Stickers.array.splice(id, 1);
        for (let i = 0; i < Stickers.array.length; i++) {
            Stickers.array[i].id = i;
        }
        Stickers.drawAll();
        Stickers.save();
    }

    static drawAll(): void {
        board.innerHTML = ``;
        for (let sticker of Stickers.array) {
            sticker.draw();
        }
    }

    static convertAll(): void {
        Stickers.convertedArray = [];
        for (let sticker of Stickers.array) {
            Stickers.convertedArray.push(sticker.convert());
        }
    }

    static reConvertAll(): void {
        Stickers.array = [];
        for (let sticker of Stickers.convertedArray) {
            new Sticker(sticker.x, sticker.y, sticker.id, sticker.text);
        }
        Stickers.drawAll();
    }

    static move(id: number, x: number, y: number) {
        Stickers.array[id].move(x, y);
    }

    static save() {
        Stickers.convertAll();
        localStorage.setItem(`stickers`, JSON.stringify(Stickers.convertedArray));
    }

    static load() {
        Stickers.reConvertAll();
    }

    static changeText(id: number) {
        Stickers.array[id].text = document.querySelector(`[data-id="${id}"]`).parentElement.querySelector(`textarea`).value;
        Stickers.save();
    }
}

class Sticker {
    x: number;
    y: number;
    id: number;
    text: string;
    element: HTMLElement;

    constructor(x: number, y: number, id?:number, text?: string) {
        this.x = x > 0 ? x : 0;
        this.y = y > 0 ? y : 0;
        this.id = id ? id : Stickers.array.length;
        this.text = text ? text : ``;

        Stickers.array.push(this);

        this.draw();
        this.element = <HTMLElement> document.querySelector(`[data-id="${this.id}"]`).parentElement;
    }

    draw() {
        board.innerHTML += `<div class="sticker" style="left: ${this.x}px; top: ${this.y}px;"><div data-id="${this.id}" class="sticker-head"></div><div class="sticker-body"><textarea onkeydown="Stickers.changeText(${this.id})">${this.text}</textarea></div></div>`;
    }

    move(x: number, y: number): void {
        this.element = <HTMLElement> document.querySelector(`[data-id="${this.id}"]`).parentElement;
        this.x = x;
        this.y = y;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    convert() {
        return {
            x: this.x,
            y: this.y,
            id: this.id,
            text: this.text
        }
    }
}

class Mouse {
    isDown: boolean = false;
    id: number = null;
    oldX: number;
    oldY: number;

    constructor() {
        board.addEventListener(`contextmenu`, (e: PointerEvent) => {
            e.preventDefault();
            this.onContextMenu(e);
            return false;
        }, false);

        board.addEventListener(`mousedown`, (e: PointerEvent) => {
            this.onDown(e);
        }, false);

        board.addEventListener(`mousemove`, (e: PointerEvent) => {
            e.preventDefault();
            this.onMove(e);
            return false;
        }, false);

        board.addEventListener(`mouseup`, (e: PointerEvent) => {
            e.preventDefault();
            this.onUp(e);
            return false;
        }, false);
    }

    onContextMenu(e: PointerEvent) {
        if (e.target.className === `board`) {
            new Sticker(e.clientX - 100, e.clientY - 100);
        }
        else if (e.target.className === `sticker-head`) {
            Stickers.remove(e.target.dataset.id);
        }
    }

    onDown(e: PointerEvent): void {
        if (e.target.className === `sticker-head`) {
            this.oldX = e.offsetX;
            this.oldY = e.offsetY;
            this.isDown = true;
            this.id = e.target.dataset.id;
        }
    }

    onMove(e: PointerEvent): void {
        if (this.isDown && this.id) {
            Stickers.move(this.id, e.clientX - this.oldX, e.clientY - this.oldY);
        }
    }

    onUp(e: PointerEvent): void {
        this.isDown = false;
        this.id = null;
        Stickers.save();
    }
}

new Mouse();
Stickers.load();