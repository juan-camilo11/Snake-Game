import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { BOARD_SIZE, DIRECTIONS } from '../constants/constants';
import { CommunicationService } from '../services/communication.service';
import { BoardPosition } from '../utility/boardposition';
import { LinkedList } from '../utility/linkedlist';
import { LinkedListNode } from '../utility/linkedlistnode';
import { randomNumberInitializer } from '../utility/utility';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  /**
   * BOARD STRUCTURE VARIABLES
   * ========================================================================
   */

  /**
   * variable holding board matrix
   */
  public vBoardArray: number[][] = [];

  /**
   * SNAKE VARIABLES
   * =========================================================================
   */

  /**
   * variable holding linked list representing snake
   */
  public vSnake!: LinkedList;

  /**
   * variable holding set of numbers. Each number is a cell number that belongs to the snake
   */
  public vSnakeCells: Set<number> = new Set();

  public vInputDirection: string = DIRECTIONS.RIGHT;

  public vSnakeActiveMovingDirection: string = DIRECTIONS.RIGHT;

  /**
   * FOOD VARIABLES
   * =========================================================================
   */

  public vFoodCell!: number;


  /**
   * SCORE VARIBALES
   * =========================================================================
   */

  public vScore: number = 0;

  /**
   * MISC
   * ===============================================================================
   */
  private vKeyDownListener!: () => void;
  /**
   * hold interval so it can be stopped and reset
   */
  private vIntervalHolder: any;

  public vShowStart: boolean = true;

  constructor(
    private renderer2: Renderer2,
    private communicationService: CommunicationService
    ) {
    this.createBoard();
    this.setSnakeInitialPosition();
    this.setFoodInitialPosition();
    this.vKeyDownListener = this.renderer2.listen(
      'document',
      'keydown',
      (event) => {
        this.handleKeyDown(event);
      }
    );
  }

  private handleKeyDown(event: any) {

    const vIsOppositeDirection = this.isOppositeDirection(this.vSnakeActiveMovingDirection, event.key)

    if(this.vSnakeCells.size > 1 && vIsOppositeDirection){
      return;
    }else{
      const vTempDirection = this.getDirectionFromKey(event.key);
      if(vTempDirection !== ''){
        this.vInputDirection = vTempDirection;
      }
    }
  }

  private getOppositeDirection(pDirection: string){
    if(pDirection === DIRECTIONS.UP){
      return DIRECTIONS.DOWN;
    }else if(pDirection === DIRECTIONS.DOWN){
      return DIRECTIONS.UP;
    }else if(pDirection === DIRECTIONS.LEFT){
      return DIRECTIONS.RIGHT;
    }else{
      return DIRECTIONS.LEFT;
    }
  }

  private getCurrentDirection(pNode: LinkedListNode, pDirection: string): string{
    if(pNode === null){
      return '';
    }else if(pNode.next === null){
      return pDirection;
    }else{
      /**
       * was moving down
       */
      if(pNode.next.value.column === pNode.value.column && pNode.value.row - pNode.next.value.row > 0){
        return DIRECTIONS.DOWN;

      }/*
        * was moiving up
       */
      else if(pNode.next.value.column === pNode.value.column && pNode.value.row - pNode.next.value.row < 0){
        return DIRECTIONS.UP;
      }
      /**
       * was moving right
       */
      else if(pNode.next.value.row === pNode.value.row && pNode.value.column - pNode.next.value.column > 0){
        return DIRECTIONS.RIGHT;
      }
      /**
       * was moving left
       */
      else{
        return DIRECTIONS.LEFT;
      }
    }

  }


  private getNextNodeDirection(pNode: LinkedListNode, pDirection: string): string{
    if(pNode === null){
      return '';
    }else if(pNode.next === null){
      return this.getOppositeDirection(pDirection);
    }else{
      /**
       * add cell below
       */
      if(pNode.next.value.column === pNode.value.column && pNode.value.row - pNode.next.value.row > 0){
        return DIRECTIONS.DOWN;

      }/*
        * add cell above
       */
      else if(pNode.next.value.column === pNode.value.column && pNode.value.row - pNode.next.value.row < 0){
        return DIRECTIONS.UP;
      }
      /**
       * add cell to the right
       */
      else if(pNode.next.value.row === pNode.value.row && pNode.value.column - pNode.next.value.column > 0){
        return DIRECTIONS.RIGHT;
      }
      /**
       * add cell to the left
       */
      else{
        return DIRECTIONS.LEFT;
      }
    }
  }

  private isOppositeDirection(
    pCurrentDireciton: string,
    pPressedArrowKey: string
  ) {
    switch (pCurrentDireciton) {
      case 'UP':
        if (pPressedArrowKey === 'ArrowDown') {
          return true;
        }
        break;
      case 'DOWN':
        if (pPressedArrowKey === 'ArrowUp') {
          return true;
        }
        break;
      case 'LEFT':
        if (pPressedArrowKey === 'ArrowRight') {
          return true;
        }
        break;
      case 'RIGHT':
        if (pPressedArrowKey === 'ArrowLeft') {
          return true;
        }
        break;
    }

    return false;
  }

  private getDirectionFromKey(keyString: string): string{
    if(keyString === 'ArrowLeft'){
      return DIRECTIONS.LEFT;
    }else if(keyString === 'ArrowRight'){
      return DIRECTIONS.RIGHT;
    }else if(keyString === 'ArrowUp'){
      return DIRECTIONS.UP;
    }else if(keyString === 'ArrowDown'){
      return DIRECTIONS.DOWN;
    }else{
      return '';
    }
  }

  private moveSnake() {
    this.vSnakeActiveMovingDirection = this.vInputDirection;
    const vNewNode = this.getNextSnakeCell(this.vSnakeActiveMovingDirection, this.vSnake.head);
    if(this.isOutOfBounds(this.vSnakeCells, vNewNode.value.row, vNewNode.value.column)){
      /**
       * game over
       */
      this.gameOver();
      return;
    }else{
      /**
       * set cell value if new cell is inbounds
       */
      vNewNode.value.cell = this.vBoardArray[vNewNode.value.row][vNewNode.value.column];
    }

    const tailValue = this.vSnake.tail.value.cell;    
    const vTempHead = this.vSnake.head;
    this.vSnake.head = vNewNode;
    vTempHead.next = vNewNode;

    this.vSnakeCells.delete(tailValue);
    this.vSnakeCells.add(vNewNode.value.cell);


    this.vSnake.tail = this.vSnake.tail.next;
    if(this.vSnake.tail === null){
      this.vSnake.tail = this.vSnake.head
    }

    if(this.isFood(vNewNode.value.cell, this.vFoodCell)){
      /**
       * grow snake
       */
      this.growSnake(this.vSnakeActiveMovingDirection);

      this.resetFoodAfterEating();

      this.vScore ++;
      this.communicationService.setScore(this.vScore);
    }

  }



  /**
   * grows the snake, returns true or false
   * true if cell was added, false it cell was unable to be added
   * a false return will result in a game over or maybe nothing will happen
   * @param pHeadDirection 
   * @param pSnake 
   * @returns 
   */
  private growSnake(pHeadDirection: string): boolean{
    const vNextNodeDirection: string = this.getNextNodeDirection(this.vSnake.tail, pHeadDirection);
    const vNewCell = this.getNewSnakeCell(vNextNodeDirection, this.vSnake.tail);

    if(vNewCell === null){
      return false;
    }


    const vTempTail = this.vSnake.tail;
    this.vSnake.tail = vNewCell;
    this.vSnake.tail.next = vTempTail;

    this.vSnakeCells.add(this.vSnake.tail.value.cell);


    return true;
  }

  /**
   * called whenever the snake eats the fruit/egg/whatever
   * @param pDirection
   * @param pSnakeTail 
   */
  private getNewSnakeCell(pDirection: string, pSnakeTail: LinkedListNode): LinkedListNode{
    let vResult: LinkedListNode;
    let vTempBoardPosition: BoardPosition;
    let vRow: number;
    let vColumn: number;
    switch(pDirection){
      
      case DIRECTIONS.DOWN:
        vRow = pSnakeTail.value.row + 1;
        vColumn = pSnakeTail.value.column;
        if(this.isValidAdditionRow(vRow, vColumn, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow, vColumn, this.vBoardArray[vRow][vColumn]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else if(this.isValidAdditionColumn(vRow - 1, vColumn + 1, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow - 1, vColumn + 1, this.vBoardArray[vRow - 1][vColumn + 1]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else if(this.isValidAdditionColumn(vRow - 1, vColumn - 1, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow - 1, vColumn - 1, this.vBoardArray[vRow - 1][vColumn - 1]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else{
          vResult = null;
        }

        break;
      case DIRECTIONS.UP:
        vRow = pSnakeTail.value.row - 1;
        vColumn = pSnakeTail.value.column;
        if(this.isValidAdditionRow(vRow, vColumn, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow, vColumn, this.vBoardArray[vRow][vColumn]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else if(this.isValidAdditionColumn(vRow + 1, vColumn + 1, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow + 1, vColumn + 1, this.vBoardArray[vRow + 1][vColumn + 1]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else if(this.isValidAdditionColumn(vRow + 1, vColumn - 1, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow -+ 1, vColumn - 1, this.vBoardArray[vRow + 1][vColumn - 1]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else{
          vResult = null;
        }

        break;
      case DIRECTIONS.LEFT:
        vRow = pSnakeTail.value.row;
        vColumn = pSnakeTail.value.column - 1;
        if(this.isValidAdditionColumn(vRow, vColumn, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow, vColumn, this.vBoardArray[vRow][vColumn]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else if(this.isValidAdditionRow(vRow + 1, vColumn + 1, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow + 1, vColumn + 1, this.vBoardArray[vRow - 1][vColumn + 1]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else if(this.isValidAdditionRow(vRow - 1, vColumn + 1, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow - 1, vColumn + 1, this.vBoardArray[vRow + 1][vColumn + 1]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else{
          vResult = null;
        }

        break;
      case DIRECTIONS.RIGHT:
        vRow = pSnakeTail.value.row;
        vColumn = pSnakeTail.value.column + 1;
        if(this.isValidAdditionColumn(vRow, vColumn, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow, vColumn, this.vBoardArray[vRow][vColumn]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else if(this.isValidAdditionRow(vRow + 1, vColumn - 1, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow + 1, vColumn - 1, this.vBoardArray[vRow - 1][vColumn - 1]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else if(this.isValidAdditionRow(vRow - 1, vColumn - 1, this.vSnakeCells)){
          vTempBoardPosition = new BoardPosition(vRow - 1, vColumn - 1, this.vBoardArray[vRow + 1][vColumn - 1]);
          vResult = new LinkedListNode(vTempBoardPosition);
        }else{
          vResult = null;
        }
        break;
        /**
         * this should never be hit */ 
      default:
        vTempBoardPosition = new BoardPosition(pSnakeTail.value.row - 1, pSnakeTail.value.column, 0);
        vResult = new LinkedListNode(vTempBoardPosition);
    }

    return vResult;
  }

  /**
   * called everytime the snake moves
   * @param pDirection 
   * @param pSnakeHead 
   * @returns 
   */
  private getNextSnakeCell(pDirection: string, pSnakeHead: LinkedListNode): LinkedListNode{

    let vResult: LinkedListNode;
    let vTempBoardPosition: BoardPosition;
    switch(pDirection){
      case DIRECTIONS.DOWN:
        /**
         * setting cell value to 0 since we are not checking out of bounds here
         */
        vTempBoardPosition = new BoardPosition(pSnakeHead.value.row + 1, pSnakeHead.value.column, 0);
        vResult = new LinkedListNode(vTempBoardPosition);
        break;
      case DIRECTIONS.UP:
        /**
         * setting cell value to 0 since we are not checking out of bounds here
         */
         vTempBoardPosition = new BoardPosition(pSnakeHead.value.row - 1, pSnakeHead.value.column, 0);
         vResult = new LinkedListNode(vTempBoardPosition);
        break;
      case DIRECTIONS.LEFT:
        /**
         * setting cell value to 0 since we are not checking out of bounds here
         */
         vTempBoardPosition = new BoardPosition(pSnakeHead.value.row, pSnakeHead.value.column - 1, 0);
         vResult = new LinkedListNode(vTempBoardPosition);
        break;
      case DIRECTIONS.RIGHT:
        /**
         * setting cell value to 0 since we are not checking out of bounds here
         */
         vTempBoardPosition = new BoardPosition(pSnakeHead.value.row, pSnakeHead.value.column + 1, 0);
         vResult = new LinkedListNode(vTempBoardPosition);
        break;
        /**
         * this should never be hit */ 
      default:
        vTempBoardPosition = new BoardPosition(pSnakeHead.value.row - 1, pSnakeHead.value.column, 0);
        vResult = new LinkedListNode(vTempBoardPosition);
    }

    return vResult;

  }


  /**
   * check if the new snake cell is out of bounds or a part of the existing snake
   * @param pSnakeCells 
   * @param pNewRow 
   * @param pNewCol 
   * @returns 
   */
  private isOutOfBounds(pSnakeCells: Set<number>, pNewRow: number, pNewCol: number): boolean{
    let vResult = false;
    
    /**
     * this means the snake ran into itself
     */
    if(pNewRow > BOARD_SIZE - 1 || pNewCol > BOARD_SIZE - 1 || pNewCol < 0 || pNewRow < 0){
      vResult = true
    }else{ 
      const vNewCell = this.vBoardArray[pNewRow][pNewCol]; 
      if(pSnakeCells.has(vNewCell)){
        vResult = true;
      }
    }

    return vResult;
  }

  /**
   * check if row where new cell is to be added is valid
   */
  private isValidAdditionRow(pRow: number, pCol: number, pSnakeCells: Set<number>): boolean{
    if(pRow > BOARD_SIZE - 1 || pRow < 0){
      return false;
    }

    if(pSnakeCells.has(this.vBoardArray[pRow][pCol])){
      return false;
    }

    return true;

  }

  /**
   * check if column where new cell is to be added is valid
   */
  private isValidAdditionColumn(pRow: number, pCol: number, pSnakeCells: Set<number>){
    if(pCol > BOARD_SIZE - 1 || pCol < 0){
      return false;
    }

    if(pSnakeCells.has(this.vBoardArray[pRow][pCol])){
      return false;
    }

    return true;
  }


  private isFood(pCellValue: number, pFoodCellValue: number): boolean{
    if(pCellValue === pFoodCellValue){
      return true;
    }else{
      return false;
    }

  }


  /**
   * handle game over
   */
  private gameOver(){
    
    
    this.communicationService.onGameOver();
    clearInterval(this.vIntervalHolder);
    
  }

  /**
   * set where the snake starts
   * set where the food starts
   */
  private createBoard(): void {
    let vCounter = 1;
    for (let i = 0; i < BOARD_SIZE; i++) {
      const vRow = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        vRow.push(vCounter);
        vCounter++;
      }
      this.vBoardArray.push(vRow);
    }
  }

  /**
   * set snake intial position
   */
  private setSnakeInitialPosition(): void {
    this.vSnake = new LinkedList(this.getStartingSnakeLinkedListValue());
    /**
     * add snake starting node cell value to the snake cells set
     */
    this.vSnakeCells = new Set([this.vSnake.head.value.cell]);
  }

  /**
   * get starting coordinates for the head of the linked list
   * @returns
   */
  private getStartingSnakeLinkedListValue(): BoardPosition {
    const vRows = this.vBoardArray.length;
    const vColumns = this.vBoardArray[0]?.length;
    const vSnakeRowIndex = Math.floor(vRows / 3);
    const vSnakeColumnIndex = Math.floor(vColumns / 3);
    const vSnakeCellValue = this.vBoardArray[vSnakeRowIndex][vSnakeColumnIndex];

    return new BoardPosition(
      vSnakeRowIndex,
      vSnakeColumnIndex,
      vSnakeCellValue
    );
  }

  /**
   * set the starting position for the food
   */
  private setFoodInitialPosition(): void {
    let vFoodPos;
    while (true) {
      vFoodPos = this.getFoodPosition();
      if (this.vSnakeCells.has(vFoodPos)) {
        continue;
      }
      break;
    }

    this.vFoodCell = vFoodPos;
  }


  resetFoodAfterEating(): void {
    while(true){
      const vFoodValue = this.getFoodPosition();
      if(this.vSnakeCells.has(vFoodValue)){
        continue;
      }else{
        this.vFoodCell = vFoodValue;
        break;
      }
    }
  }
  /**
   * gets food position by randomly generating a numerical value inbetween
   * 1 and the max cell value as determined by the board size
   * @returns
   */
  private getFoodPosition(): number {
    const vMaxCellValue = BOARD_SIZE * BOARD_SIZE;
    const vTempFoodValue = randomNumberInitializer(1, vMaxCellValue);
    return vTempFoodValue;
  }

  public getCellClass(pCellValue: number): string {
    if (this.vSnakeCells.has(pCellValue)) {
      if (this.vSnake.head.value.cell === pCellValue) {
        return 'snake-head';
      } else {
        return 'snake';
      }
    } else if (pCellValue === this.vFoodCell) {
      return 'food';
    } else {
      return 'cell';
    }
  }


  public onStart(): void {
    if(this.vIntervalHolder){
      clearInterval(this.vIntervalHolder);
    }
    this.vIntervalHolder = setInterval(() => {
      this.moveSnake();
    }, 250);
    this.vShowStart = false;
  }

  public onRestart(): void {
    this.setSnakeInitialPosition();
    this.setFoodInitialPosition();
    this.vScore = 0;
    this.communicationService.setScore(this.vScore);
    this.vInputDirection = DIRECTIONS.RIGHT;
    this.vSnakeActiveMovingDirection = DIRECTIONS.RIGHT;
    if(this.vIntervalHolder){
      clearInterval(this.vIntervalHolder);
    }
    this.vIntervalHolder = setInterval(() => {
      this.moveSnake();
    }, 250);
  }


  ngOnInit(): void {
    
  }
}
