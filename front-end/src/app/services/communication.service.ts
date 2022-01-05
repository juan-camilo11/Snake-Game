import { EventEmitter, Injectable } from '@angular/core';
import { ObjectUnsubscribedError, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private scoreSubject: Subject<number> = new Subject<number>();

  public scoreStream$: Observable<number> = this.scoreSubject.asObservable();


  private gameOverSubject: Subject<boolean> = new Subject<boolean>();

  public gameOverStream$: Observable<boolean> = this.gameOverSubject.asObservable();



  constructor() { }

  setScore(pScore: number){
    this.scoreSubject.next(pScore);
  }

  onGameOver(){
    this.gameOverSubject.next(true);
  }
}
