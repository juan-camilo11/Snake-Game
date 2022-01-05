import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss']
})
export class ScoreBoardComponent implements OnInit, OnDestroy {

  /**
   * variable to hold the score
   */
  public vScore: number = 0;

  /**
   * variable to hold the high score
   */
  public vHighScore: number = 0;

  private vScoreSub: Subscription;

  private vGameOverSub: Subscription;


  constructor(
    private communicationService: CommunicationService
  ) { }


  onGameOver(){
    if(this.vScore > this.vHighScore){
      this.vHighScore = this.vScore;
    }

    /**
     * reset the score to 0
     */
    //this.vScore = 0;
  }

  ngOnInit(): void {
    this.vScoreSub = this.communicationService.scoreStream$.subscribe(data => {
      this.vScore = data;
    });

    /**
     * on game over we want to check if the high score was beaten or not
     */
    this.vGameOverSub = this.communicationService.gameOverStream$.subscribe(data => {
      this.onGameOver();
    })
  }

  ngOnDestroy(): void {
    this.vScoreSub.unsubscribe();
  }

}
