import { BoardPosition } from "./boardposition";


export class LinkedListNode {

    public value: BoardPosition;
    public next: LinkedListNode;

    constructor(pValue: BoardPosition){
        this.value = pValue;
        this.next = null;
    }


}