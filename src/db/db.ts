import Dexie, { Table } from 'dexie';
import { PAGES } from '../actions/pages/pages.interface';

export class Docs extends Dexie {
    // 'friends' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    doc!: Table<PAGES>;

    constructor() {
        super('myDatabase');
        this.version(1).stores({
            doc: '++id, name, activePageIndex, activeTool, hoveredShapeId, contextMenu, clipboard, pages, colors, gradients, images' // Primary key and indexed props
        });
    }
}

export const db = new Docs();
