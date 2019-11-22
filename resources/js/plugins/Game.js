import * as PIXI from "pixi.js";
import nipple from "nipplejs";


export default class Game {
    constructor (rootEl) {
        this.rootEl = rootEl;

        this.SIZE = window.innerWidth > 400 ? 80 : 40

        this.rootApp = this._setRootApp();
        this.rootJoystick = this._setJoystick()

        this.user = null

        this.userMove = {
            force: 0,
            angle: 0,
        }
    }

    _setRootApp() {
        let app = new PIXI.Application({
                width: window.innerWidth,
                height: window.innerHeight,
                transparent: false,
            }
        )

        app.renderer.backgroundColor = 0x061639;

        this.rootEl.appendChild(app.view);

        app.loader
            .add("https://sun9-23.userapi.com/c623422/v623422145/34dbc/2BLzJkwdTMg.jpg?ava=1")
            .load(() => this._setup());

        return app
    }

    _setJoystick () {
        let joystick = nipple.create({
            zone: this.rootEl,
            mode: 'static',
            position: {right: '50%', bottom: '15%'},
        });

        joystick
            .on('move', (event, data) => {
                this.userMove = {
                    angle: data.angle.radian,
                    force: data.distance
                }
            })
            .on('end', () => {
                this.userMove = {
                    angle: 0,
                    force: 0
                }
            });

        return joystick;
    }

    _setup () {
        this._setUser()

        this._gameLoop()
    }

    _setUser () {
        const resource = "https://sun9-23.userapi.com/c623422/v623422145/34dbc/2BLzJkwdTMg.jpg?ava=1";

        let user = new PIXI.Container();

        let sprite = new PIXI.Sprite(this.rootApp.loader.resources[resource].texture);
        sprite.width = sprite.height = this.SIZE;

        let circleMask = new PIXI.Graphics();
        circleMask.beginFill(0, 1);
        circleMask.drawCircle(this.SIZE / 2, this.SIZE / 2, this.SIZE / 2);
        circleMask.endFill();

        let circleLine = new PIXI.Graphics();
        circleLine.beginFill(0, 0);
        circleLine.lineStyle(this.SIZE / 5, 0x99CCFF, 1);
        circleLine.drawCircle(this.SIZE / 2, this.SIZE / 2, this.SIZE / 2);
        circleLine.endFill();

        user.addChild(sprite);
        user.addChild(circleMask);
        user.addChild(circleLine);

        user.mask = circleMask;

        user.x = window.innerWidth / 2 - this.SIZE / 2;
        user.y = window.innerHeight / 2 - this.SIZE / 2;

        this.rootApp.stage.addChild(user)
        this.user = user
    }

    _playUser () {
        if (!this.user) {
            return
        }


        let vx = Math.cos(this.userMove.angle) * this.userMove.force / 10,
            vy = -Math.sin(this.userMove.angle) * this.userMove.force / 10;

        this.user.x += vx;
        this.user.y += vy
    }

    _gameLoop () {
        this._playUser()

        requestAnimationFrame(() => this._gameLoop())
    }

}
