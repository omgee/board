const board = document.querySelector(`.board`);

class Stickers {
    static array: Array<Sticker> = [];

    static create(x: number, y: number, id?: number, text?: string): void {
        Stickers.array.push(new Sticker(x, y, id, text));

        Stickers.save();
    }

    static get(id: number): Sticker {
        for (let sticker of Stickers.array) {
            if (sticker.id === id) return sticker;
        }
    }

    static remove(id: number): void {
        Stickers.get(id).remove();
        Stickers.array.splice(Stickers.array.indexOf(Stickers.get(id)), 1);

        Stickers.save();
    }

    static save() {
        let tmpArray = [];
        for (let sticker of Stickers.array) {
            tmpArray.push({
                x: sticker.x,
                y: sticker.y,
                id: sticker.id,
                text: sticker.text
            });
        }
        localStorage.setItem(`stickers`, JSON.stringify(tmpArray));
    }

    static load() {
        let tmpArray = JSON.parse(localStorage.getItem(`stickers`));
        for (let sticker of tmpArray) {
            Stickers.create(sticker.x, sticker.y, sticker.id, sticker.text);
        }
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

        this.create();

    }

    create() {
        const sticker: HTMLElement = document.createElement(`div`);
        const sticker_head: HTMLElement = document.createElement(`div`);
        const sticker_body: HTMLElement = document.createElement(`div`);
        const sticker_body_textarea: HTMLTextAreaElement = <HTMLTextAreaElement> document.createElement(`textarea`);

        sticker.draggable = true;

        sticker.className = `sticker`;
        sticker_head.className = `sticker-head`;
        sticker_body.className = `sticker-body`;

        sticker.style.top = `${this.y}px`;
        sticker.style.left = `${this.x}px`;

        sticker_body_textarea.value = this.text;
        console.log(Stickers.array);

        sticker_head.dataset.id = `${this.id}`;

        sticker_body.appendChild(sticker_body_textarea);
        sticker.appendChild(sticker_head);
        sticker.appendChild(sticker_body);

        this.element = sticker;

        board.appendChild(sticker);

        new MouseListener(this);
        new KeyboardListener(this, sticker_body_textarea);
    }

    remove(): void {
        this.element.remove();
    }

    move(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;

        Stickers.save()
    }
}

class KeyboardListener {
    sticker: Sticker;
    element: HTMLElement;
    textarea: HTMLTextAreaElement;

    constructor(sticker: Sticker, textarea: HTMLElement) {
        this.sticker = sticker;
        this.element = sticker.element;
        this.textarea = <HTMLTextAreaElement> textarea;

        this.textarea.addEventListener(`keyup`, () => {
            this.keyUp();
        }, false);
    }

    keyUp(): void {
        console.log(this.sticker);
        this.sticker.text = this.textarea.value;

        Stickers.save();
    }
}

class MouseListener {
    x: number;
    y: number;
    sticker: Sticker;
    element: HTMLElement;

    constructor(sticker: Sticker) {
        this.sticker = sticker;
        this.element = sticker.element;

        this.element.addEventListener(`dragstart`, (e: DragEvent) => {

            this.dragStart(e);

        }, false);

        this.element.addEventListener(`drag`, (e: DragEvent) => {

            this.drag(e);

        }, false);

        this.element.addEventListener(`dragend`, (e: DragEvent) => {

            this.dragEnd(e);

        }, false);

        this.element.addEventListener(`dragleave`, (e: DragEvent) => {

            this.dragLeave(e);

        }, false);
    }

    dragStart(e: DragEvent) {
        this.x = e.offsetX;
        this.y = e.offsetY;
        const crt = <Element> this.element.cloneNode(true);
        e.dataTransfer.setDragImage(crt, 0, 0);
    }

    drag(e: DragEvent) {
        this.sticker.move(e.clientX - this.x, e.clientY - this.y);
    }

    dragEnd(e: DragEvent) {
        this.sticker.move(e.clientX - this.x, e.clientY - this.y);
    }

    dragLeave(e: DragEvent) {
        console.log(`test`);
        this.sticker.move(e.clientX - this.x, e.clientY - this.y);
    }

    static context(e: PointerEvent) {
        e.preventDefault();
        const target: HTMLElement = <HTMLElement> e.target;
        if (target.className === `board`) {
            Stickers.create(e.clientX - 100, e.clientY - 100);
        }
        else if (target.className === `sticker-head`) {
            Stickers.remove(parseInt(target.dataset.id));
        }
    }
}

board.addEventListener(`contextmenu`, MouseListener.context, false);

Stickers.load();