import { Component, OnInit } from '@angular/core';
import { CookieController, UserData } from '../cookieController';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private loggedIn: boolean;
  private playername: string;
  private difficulty: string;
  private highScore: number;
  levels: Array<Object> = [
      {num: 0, name: 'Easy'},
      {num: 1, name: 'Medium'},
      {num: 2, name: 'Hard'}
  ];

  constructor() { }

  ngOnInit() {
    if (CookieController.readCookie('misCooki') !== null) {
      const cookiesData = CookieController.readCookie('misCooki');

      const splittedData = cookiesData.split(',');
      this.loggedIn = true;
      this.playername = splittedData[0];
      this.difficulty = splittedData[1];
      this.highScore = parseInt(splittedData[2], 10);

    } else {
      this.loggedIn = false;
    }
  }

  private saveCookies(name: string) {
    const userData = new UserData(name, this.difficulty, 0);
    console.log(userData);
    CookieController.createCookie('misCooki', userData, 30);
  }

  private forgetMe() {
    CookieController.eraseCookie('misCooki');
    location.reload();
  }
}
