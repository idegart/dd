import * as PIXI from "pixi.js";
import nipplejs from "nipplejs";


export default class Game {
    constructor (rootEl) {
        this.rootEl = rootEl;

        console.log(this.rootEl)


        // this.rootApp = this._setRootApp();

        this._setJoystick()
    }

    _setRootApp() {
        let app = new PIXI.Application({
                width: window.innerWidth,
                height: window.innerHeight,
                // antialias: true,
                transparent: false,
                // resolution: 1
            }
        )

        app.renderer.backgroundColor = 0x061639;

        this.rootEl.appendChild(app.view);

        app.loader
            .add("https://sun9-23.userapi.com/c623422/v623422145/34dbc/2BLzJkwdTMg.jpg?ava=1")

        return app
    }

    _setJoystick () {
        let joystick = nipplejs.create({
            zone: this.rootEl,
            mode: 'static',
            position: {
                left: '50%',
                top: '50%'
            },
            color: 'red'
            // position: {right: '50%', bottom: '15%'},
            // dynamicPage: true,
        });
    }

}
