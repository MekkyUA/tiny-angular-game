import { tryCatch } from 'rxjs/util/tryCatch';
import { Component, Directive, ElementRef, Renderer, AfterViewInit } from '@angular/core';
import { CookieController, UserData } from '../cookieController';
import { Router } from '@angular/router';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements AfterViewInit {
  private root: ElementRef;
  // styles
  private readonly top: string;
  private nextTop: number;
  private width: string;
  private nextScaleX: number;
  private readonly height: string;
  private nextScaleY: number;
  private readonly MAX_TOP = 600;
  private readonly MAX_SCALE_X = 2;
  private readonly MAX_SCALE_Y= 2;
  private readonly MIN_SCALE_X = 0.5;
  private readonly MIN_SCALE_Y= 0.5;
  private readonly backgrounds: string[];
  private readonly lefts: string[];
  // helpers
  private readonly numOfObjs = 20;
  private readonly indexer: number[];
  // game variables
  private score: number;
  private GAMEOVER: boolean;
  private MissedGreenBoxes: number;
  private readonly AllowedToMiss = 3;
  private readonly speedInterval = 20; // ms
  private readonly MIN_SPEED_INTERVAL = 1;
  private nextSpeedInterval: number;
  private readonly speedStep = 1; // px
  private MAX_SPEED_STEP: number;
  private nextSpeedStep: number; // px
  private readyToMove: any[];
  private timeslot: number;
  // sound effect
  private clickAudio: any;
  private clickUpAudio: any;
  private gameOverAudio: any;

  constructor(private elementRef: ElementRef, private router: Router) {
    this.width = '50px';
    this.nextScaleX =  1;
    this.height = this.width;
    this.nextScaleY = 1;
    this.top = (0 * parseInt(this.height, 10)).toString() + 'px'; // 0 -> -1
    this.nextTop = 0 * parseInt(this.height, 10) * this.nextScaleY; // 0 -> -1
    this.backgrounds =
      ['green', 'green', 'green', 'green', 'green',
       'green', 'green', 'red', 'blue', 'brown'];
    this.lefts =
      ['25px', '125px', '225px', '325px'];
    this.indexer = Array(this.numOfObjs).fill(0).map((x, i) => i);
    this.score = 0;
    this.GAMEOVER = false;
    this.MissedGreenBoxes = 0;
    this.nextSpeedInterval = this.speedInterval;
    this.nextSpeedStep = this.speedStep;
    this.root = elementRef;

    this.clickAudio = new Audio('http://mihailo.centarzatalente.com/sounds/click.mp3');
    this.clickUpAudio = new Audio('http://mihailo.centarzatalente.com/sounds/clickUp.mp3');
    this.gameOverAudio = new Audio('http://soundbible.com/grab.php?id=1830&type=mp3');
  }

  ngAfterViewInit() {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    // Get all boxes then add them to readyToMove
    this.readyToMove = [].slice.call(this.root.nativeElement.children[0].children);
    this.readyToMove.forEach(function(boxObj) {
      boxObj.style.display = 'none';
      boxObj.style.pointerEvents = 'none';
    });

    // set difficulty
    if (CookieController.readCookie('misCooki') !== null) {
      const cookiesData = CookieController.readCookie('misCooki');
      const splittedData = cookiesData.split(',');
      switch (splittedData[1]) {
        case 'Easy':
          this.timeslot = 5000;
          this.MAX_SPEED_STEP = 1;
          break;
        case 'Meduim':
          this.timeslot = 3000;
          this.MAX_SPEED_STEP = 2;
          break;
        case 'Hard':
          this.timeslot = 1000;
          this.MAX_SPEED_STEP = 3;
          break;
      }
    } else {
      // difficulty [increase = easier] {5000, 3000, 1000}
      this.timeslot = 5000;
      // difficulty [decrease = easier] {3, 2, 1}
      this.MAX_SPEED_STEP = 1;
    }
    this.play();
  }

  private rgp2string(rgpColorVal) {
    switch (rgpColorVal) {
      case 'rgb(0, 128, 0)':
        return 'green';
      case 'rgb(255, 0, 0)':
        return 'red';
      case 'rgb(0, 0, 255)':
        return 'blue';
      case 'rgb(165, 42, 42)':
        return 'brown';
    }
  }

  private boxClicked(event) {
    const obj = event.target || event.srcElement || event.currentTarget;
    obj.style.display = 'none';
    obj.style.pointerEvents = 'none';
    const objStyle = window.getComputedStyle(obj);
    switch (this.rgp2string(objStyle.backgroundColor)) {
      case 'green':
        this.score++;
        break;
      case 'red':
        this.GAMEOVER = true;
        break;
      case 'blue':
        if (this.nextScaleX < this.MAX_SCALE_X && this.nextScaleY < this.MAX_SCALE_Y) {
          this.nextScaleX *= 1.05;
          this.nextScaleY *= 1.05;
          if (this.nextScaleX > this.MAX_SCALE_X || this.nextScaleY > this.MAX_SCALE_Y) {
              this.nextScaleX = this.MAX_SCALE_X;
              this.nextScaleY = this.MAX_SCALE_Y;
          }
          this.nextTop = 0 * this.nextScaleY * parseInt(this.height, 10); // 0 -> -1
        }
        break;
      case 'brown':
        if (this.nextScaleX > this.MIN_SCALE_X && this.nextScaleY > this.MIN_SCALE_Y) {
          this.nextScaleX *= 0.95;
          this.nextScaleY *= 0.95;
          if (this.nextScaleX < this.MIN_SCALE_X || this.nextScaleY < this.MIN_SCALE_Y) {
              this.nextScaleX = this.MIN_SCALE_X;
              this.nextScaleY = this.MIN_SCALE_Y;
          }
          this.nextTop = 0 * this.nextScaleY * parseInt(this.height, 10); // 0 -> -1
        }
        break;
    }
    try {
      this.clickAudio.play();
      this.clickUpAudio.play();
    } catch (Exception) { }
  }

  private async play() {
    // every timeslot do something
    const updateSpeedTaskId = setInterval(this.updateSpeed, this.timeslot, this);
    while (!this.GAMEOVER) {
      this.move(this, this.nextSpeedInterval, this.nextSpeedStep);
      const rnd = Math.floor(Math.random() * 3000) + 500; // get random value from 500 to 3000 ms
      await this.delay(rnd); // async wait for rnd ms until moving the next box
    }
    clearInterval(updateSpeedTaskId);
    try {
      this.gameOverAudio.play();
    } catch (Exception) { }
    this.gameOver(this.score);
  }

  private gameOver(score: number) {
    if (CookieController.readCookie('misCooki') !== null) {
      const cookiesData = CookieController.readCookie('misCooki');
      const splittedData = cookiesData.split(',');
      const newUserData = new UserData(splittedData[0], splittedData[1],  parseInt(splittedData[2], 10));

      if (score > newUserData.highScore) {
        const fakeUser = new UserData(score.toString(), newUserData.highScore.toString(), 1);
        CookieController.updateCookie('misCookiHelper', fakeUser, 1);
        newUserData.highScore = score;
        CookieController.updateCookie('misCooki', newUserData, 30);
      } else {
        const fakeUser = new UserData(score.toString(), newUserData.highScore.toString(), 0);
        CookieController.updateCookie('misCookiHelper', fakeUser, 1);
      }
      this.router.navigate(['gameover']);
    } else {
      console.log('Should not appear!');
      this.router.navigate(['home']);
    }
  }

  private updateSpeed(sender) {
    if (sender.nextSpeedInterval > sender.MIN_SPEED_INTERVAL) {
      sender.nextSpeedInterval--;
    } else if (sender.nextSpeedStep < sender.MAX_SPEED_STEP) {
      sender.nextSpeedStep++;
      sender.nextSpeedInterval = sender.speedInterval;
    }
    // else [Max Speed Reached!]
  }

  private delay(ms: number) {
      return new Promise<void>(function(resolve) {
          setTimeout(resolve, ms);
      });
  }

  public move(sender, interval, step) {
    // get and remove random ready box object from array
    const rndIdx = Math.floor(Math.random() * sender.readyToMove.length);
    const boxObj = this.readyToMove[rndIdx];
    this.readyToMove.splice(rndIdx, 1);
    // set next styles
    // 1-Top Padding
    boxObj.style.top = this.nextTop.toString() + 'px';
    // 2-Scaling
    const scale = 'scale(' + this.nextScaleX.toString() + ', ' + this.nextScaleY.toString() + ')';
    boxObj.style.transform = scale;
    // 3-Visibility
    boxObj.style.display = 'block';
    // 4-Clickability
    boxObj.style.pointerEvents = 'auto';
    // move the box
    const id = setInterval(function() { sender.frame(sender, boxObj, step, id); }, interval);
  }

  public frame(sender, boxObj, step, thisIntervalId) {
    if (parseInt(window.getComputedStyle(boxObj).top, 10) >=
    sender.MAX_TOP - (parseInt(sender.height, 10) * sender.nextScaleY)) {
      clearInterval(thisIntervalId);
      // check if green box missed
      if (sender.rgp2string(window.getComputedStyle(boxObj).backgroundColor) === 'green'
      && window.getComputedStyle(boxObj).display === 'block') {
        sender.MissedGreenBoxes++;
        if (sender.MissedGreenBoxes >= sender.AllowedToMiss) {
          sender.GAMEOVER = true;
        }
      }
      // reset styles
      boxObj.style.display = 'none';
      boxObj.style.pointerEvents = 'none';
      // change game div border relatively
      sender.root.nativeElement.children[0].style.borderColor =
        sender.rgp2string(window.getComputedStyle(boxObj).backgroundColor);

      // restore element to readyToMove
      sender.readyToMove.push(boxObj);
    } else if (sender.GAMEOVER) {
      clearInterval(thisIntervalId);
      boxObj.style.pointerEvents = 'none';
    } else { // move the element
      boxObj.style.top =
        (parseInt(window.getComputedStyle(boxObj).top, 10) + step).toString() + 'px';
    }
  }
}
