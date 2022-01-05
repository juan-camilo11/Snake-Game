export class BoardPosition {
    /**
     * index of the row
     */
    public row: number;
    /**
     * index of the column
     */
    public column: number;
    /**
     * numerical value of the cell
     */
    public cell: number;

    constructor(pRow: number, pColumn: number, pCell: number){
        this.row = pRow;
        this.column = pColumn;
        this.cell = pCell;

    }
}