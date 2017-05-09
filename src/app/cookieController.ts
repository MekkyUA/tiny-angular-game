export class CookieController {
    public static createCookie(name: string, value: UserData, days: number) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        const userData: string = value.name + ',' + value.difficulty + ',' + '0';
        document.cookie = name + '=' + userData + expires + '; path=/';
    }

    public static updateCookie(name: string, value: UserData, days: number) {
        CookieController.eraseCookie(name);
        let expires = '';
        if (days) {
            const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
        }
        const userData: string = value.name + ',' + value.difficulty + ',' + value.highScore;
        document.cookie = name + '=' + userData + expires + '; path=/';
   }

    public static readCookie(name: string) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    public static eraseCookie(name) {
        const userData = new UserData('null', 'null', 0);
        CookieController.createCookie(name, userData, -1);
    }
}

export class UserData {
    public name: string;
    public difficulty: string;
    public highScore: number;

    public constructor(userName: string, userDifficulty: string, userHighscore: number) {
        this.name = userName;
        this.difficulty = userDifficulty;
        this.highScore = userHighscore;
    }
}

