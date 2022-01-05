import { BoardPosition } from "./boardposition";
import { LinkedListNode } from "./linkedlistnode";


export class LinkedList {

    public head: LinkedListNode;
    public tail: LinkedListNode;


    constructor(pValue: BoardPosition){
        const vNode = new LinkedListNode(pValue);
        this.head = vNode;
        this.tail = vNode;
    }
}