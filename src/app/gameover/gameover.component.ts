import { Component, OnInit } from '@angular/core';
import { CookieController, UserData } from '../cookieController';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gameover',
  templateUrl: './gameover.component.html',
  styleUrls: ['./gameover.component.css']
})
export class GameoverComponent implements OnInit {

  private won: number; // 0 1
  private playername: string;
  private newscore: number;
  private highscore: number;
  constructor(private router: Router) { }

  ngOnInit() {
    if (CookieController.readCookie('misCooki') !== null) {
      const cookiesData = CookieController.readCookie('misCooki');
      const splittedData = cookiesData.split(',');
      const userData = new UserData(splittedData[0], splittedData[1],  parseInt(splittedData[2], 10));
      // helper cookie (newscore[name], highscore[difficulty], won[highscore :boolean])
      const fakeCookiesData = CookieController.readCookie('misCookiHelper');
      const fakeSplittedData = fakeCookiesData.split(',');
      const fakeUserData = new UserData(fakeSplittedData[0], fakeSplittedData[1],  parseInt(fakeSplittedData[2], 10));
      //
      this.playername = userData.name;
      this.newscore = parseInt(fakeUserData.name, 10);
      this.highscore = parseInt(fakeUserData.difficulty, 10);
      this.won = fakeUserData.highScore;
      // delete helper cookie
      // CookieController.eraseCookie('misCookiHelper');
    } else {
      console.log('Should not appear!');
      this.router.navigate(['home']);
    }


  }

}
