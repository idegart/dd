import * as PIXI from "pixi.js";
import nipple from "nipplejs";
import {boxesIntersect, contain, DIRECTIONS, getRandomFloat, getRandomInt, SIZE} from "./gameHelpers";

const MAX_SCORE = 30
const FOOD_TYPE = [
    "/storage/images/hamburger.png"
]

export default class Game {
    constructor (rootEl, userImage) {
        this.rootEl = rootEl;
        this.userImage = userImage

        this.rootApp = this._setRootApp();
        this.rootJoystick = this._setJoystick();

        this.user = null;
        this.food = [];

        this.userMove = {
            force: 0,
            angle: 0,
        };

        this.isPlaying = false;

        this.scrore = 0;
        this.scroreEl = this._setScore();
        this.scoreInterval = null;

        this.foodInterval = null;
        this.foodBaseForce = 5

        this.listeners = []
    }

    on (name, cb) {
        this.listeners.push({name, cb});

        return this;
    }

    retry () {
        this._setup()
    }

    _setRootApp() {
        let app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            transparent: false,
            resolution: 1
        });

        app.renderer.backgroundColor = 0x061639;

        this.rootEl.appendChild(app.view);

        app.loader
            .add(this.userImage)
            .add(FOOD_TYPE)
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
        this.scrore = 0;
        this.foodBaseForce = 5
        this._clearFood()
        this._setUser();
        this._setFoodInterval();
        this._setScoreInterval();

        if (!this.isPlaying) {
            this.isPlaying = true;
            this._gameLoop()
        }
    }

    _clearFood () {
        this.food.forEach(food => {
            this.rootApp.stage.removeChild(food)
        })

        this.food = []
    }

    _setFoodInterval () {
        clearInterval(this.foodInterval);

        this.foodInterval = setInterval(() => {
            if (!this.user) {
                return
            }

            for (let i = 0; i < 4; i++) {
                this._setFood()
            }

            this.foodBaseForce++;

            this._setFoodInterval()
        }, 1000)
    }

    _setScoreInterval () {
        clearInterval(this.scoreInterval);

        this.scoreInterval = setInterval(() => {
            if (!this.user) {
                return
            }
            this.scrore++

            if (this.scrore > MAX_SCORE - 1) {
                clearInterval(this.scoreInterval)
            }

        }, 1000)
    }

    _gameOver () {
        this._emitEvent('over', this.scrore)

        this.rootApp.stage.removeChild(this.user);
        this.user = null;

        clearInterval(this.foodInterval);
        clearInterval(this.scoreInterval);
    }

    _setUser () {
        let user = new PIXI.Container(),
            storedResource = this.userImage ? this.rootApp.loader.resources[this.userImage] : null

        let sprite = new PIXI.Sprite(storedResource ? storedResource.texture : null);
        sprite.width = sprite.height = SIZE;

        let circleMask = new PIXI.Graphics();
        circleMask.beginFill(0, 1);
        circleMask.drawCircle(SIZE / 2, SIZE / 2, SIZE / 2);
        circleMask.endFill();

        let circleLine = new PIXI.Graphics();
        circleLine.beginFill(0, 0);
        circleLine.lineStyle(SIZE / 5, 0x99CCFF, 1);
        circleLine.drawCircle(SIZE / 2, SIZE / 2, SIZE / 2);
        circleLine.endFill();

        user.addChild(sprite);
        user.addChild(circleMask);
        user.addChild(circleLine);

        user.mask = circleMask;

        user.x = window.innerWidth / 2 - SIZE / 2;
        user.y = window.innerHeight / 2 - SIZE / 2;

        this.rootApp.stage.addChild(user);
        this.user = user
    }

    _setFood () {
        const resource = FOOD_TYPE[0];

        let food = new PIXI.Container(),
            storedResource = this.rootApp.loader.resources[resource]

        let sprite = new PIXI.Sprite(storedResource ? storedResource.texture : null);
        sprite.width = sprite.height = SIZE;

        let circleMask = new PIXI.Graphics();
        circleMask.beginFill(0, 1);
        circleMask.drawCircle(SIZE / 2, SIZE / 2, SIZE / 2);
        circleMask.endFill();

        let circleLine = new PIXI.Graphics();
        circleLine.beginFill(0, 0);
        circleLine.lineStyle(SIZE / 5, 0xBE0D14, 1);
        circleLine.drawCircle(SIZE / 2, SIZE / 2, SIZE / 2);
        circleLine.endFill();

        food.addChild(sprite);
        food.addChild(circleMask);
        food.addChild(circleLine);

        food.mask = circleMask;

        let direction = DIRECTIONS[getRandomInt(4)],
            point = direction.point();

        food._move_direction = direction.name;
        food._move_angle = direction.direction();
        food._move_force = getRandomFloat(this.foodBaseForce - 3, this.foodBaseForce + 3, 2) * 10;
        food.x = point.x;
        food.y = point.y;

        this.food.push(food);
        this.rootApp.stage.addChild(food)
    }

    _setScore () {
        let style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 36,
            fill: "white",
            stroke: '#00be32',
            strokeThickness: 4,
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });

        let message = new PIXI.Text(this.scrore, style);

        message.x = message.y = 10

        this.rootApp.stage.addChild(message);

        return message
    }

    _playUser () {
        if (!this.user) {
            return
        }

        contain(this.user);

        let vx = Math.cos(this.userMove.angle) * this.userMove.force / 10,
            vy = -Math.sin(this.userMove.angle) * this.userMove.force / 10;

        this.user.x += vx;
        this.user.y += vy
    }

    _playFood () {
        this.food.forEach(food => {
            let w = food.width,
                h = food.height;

            if (contain(food, {x: 0 - w * 2, y: 0 - h * 2, width: window.innerWidth + w * 2, height: window.innerHeight + h * 2})) {
                this.rootApp.stage.removeChild(food);
                this.food.splice(this.food.indexOf(food), 1)
            }

            let vx = Math.cos(food._move_angle) * food._move_force / 10,
                vy = -Math.sin(food._move_angle) * food._move_force / 10;

            food.x += vx;
            food.y += vy
        })
    }

    _checkHit () {
        this.food.forEach(food => {
            if (this.user && boxesIntersect(this.user, food, true)) {
                this._gameOver()
            }
        })
    }

    _gameLoop () {
        this._playUser();

        this._playFood();

        this._checkHit();

        this.scroreEl.text = this.scrore;

        if (this.scrore > MAX_SCORE - 5) {
            this.scroreEl.style.fill = 'red'
        }

        if (this.isPlaying) {
            requestAnimationFrame(() => this._gameLoop())
        }
    }

    _emitEvent(name, data) {
        this.listeners
            .filter(listener => listener.name === name)
            .forEach(listener => listener.cb(data))
    }
}
