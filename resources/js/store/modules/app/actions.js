import * as PIXI from 'pixi.js'
import nipplejs from 'nipplejs';

const SIZE = window.innerWidth > 400 ? 80 : 40;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function getRandomFloat(min, max, fixed = 4) {
    return (Math.random() * (max - min) + min).toFixed(fixed)
}
function getRandomTop() {
    return {
        x: getRandomInt(window.innerWidth) - SIZE,
        y: 0 - SIZE,
    }
}
function getRandomLeft() {
    return {
        x: 0 - SIZE,
        y: getRandomInt(window.innerHeight),
    }
}
function getRandomBottom() {
    return {
        x: getRandomInt(window.innerWidth),
        y: window.innerHeight + SIZE
    }
}
function getRandomRight() {
    return {
        x: window.innerWidth,
        y: getRandomInt(window.innerHeight)
    }
}

const DIRECTIONS = [
    {
        name: 'top',
        direction: () => {
            return getRandomFloat(3.7, 5.6)
        },
        point: getRandomTop,
    },
    {
        name: 'left',
        direction: () => {
            let directions = [
                getRandomFloat(0, 0.7),
                getRandomFloat(5.4, 6.2)
            ]
            return directions[getRandomInt(1)]
        },
        point: getRandomLeft,
    },
    {
        name: 'bottom',
        direction: () => {
            return getRandomFloat(0.8, 2.3)
        },
        point: getRandomBottom,
    },
    {
        name: 'right',
        direction: () => {
            return getRandomFloat(2.3, 3.9)
        },
        point: getRandomRight,
    }
]

function contain(sprite, container = {x: 0, y: 0, width: window.innerWidth, height: window.innerHeight}) {
    let collision = undefined;

    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.width > container.height) {
        sprite.y = container.height - sprite.width;
        collision = "bottom";
    }

    //Return the `collision` value
    return collision;
}

function boxesIntersect(a, b, isCircle = false) {
    let ab = a.getBounds(),
        bb = b.getBounds();

    if (isCircle) {
        let aRadius = ab.height / 2,
            aCenterLeft = ab.left + aRadius,
            aCenterTop = ab.top + aRadius;

        let bRadius = bb.height / 2,
            bCenterLeft = bb.left + bRadius,
            bCenterTop = bb.top + bRadius;

        let distance = Math.sqrt(Math.pow(bCenterLeft - aCenterLeft, 2) + Math.pow(bCenterTop - aCenterTop, 2));

        return  distance <= (aRadius + bRadius)
    }

    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

export default {
    initApp: ({state, commit, dispatch}) => {
        let app = new PIXI.Application({
                width: window.innerWidth,
                height: window.innerHeight,
                antialias: true,
                transparent: false,
                resolution: 1
            }
        ),
            startScene = new PIXI.Container(),
            gameScene = new PIXI.Container();

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

        app.renderer.backgroundColor = 0x061639;

        let message = new PIXI.Text("GrowFood", style);
        startScene.addChild(message);

        app.stage.addChild(gameScene);
        app.stage.addChild(startScene);

        commit('app', app);
        commit('gameScene', gameScene);
        commit('startScene', startScene);

        let container = document.getElementById('app-container')
        container.appendChild(app.view);

        app.loader
            .add("https://sun9-23.userapi.com/c623422/v623422145/34dbc/2BLzJkwdTMg.jpg?ava=1")
            .on("progress", function (loader, resource) {
                //Display the file `url` currently being loaded
                console.log("loading: " + resource.url);

                //Display the percentage of files currently loaded
                console.log("progress: " + loader.progress + "%");
            })
            .load(() => dispatch('setup'));

        let joystick = nipplejs.create({
            zone: container,
            mode: 'static',
            position: {right: '50%', bottom: '15%'},
            dynamicPage: true,
        });

        joystick
            .on('move', (event, data) => {
                dispatch('handleJoystickMoveEvent', {event, data})
            })
            .on('end', () => {
                dispatch('handleJoystickStopEvent')
            });

        commit('joystick', joystick);

        let interval = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                dispatch('setFriend');
            }
            commit('intervalSec', state.intervalSec - 150)
        }, state.intervalSec)

        commit('interval', interval)
    },

    handleJoystickMoveEvent: ({commit}, {data}) => {
        commit('setMove', {
            angle: data.angle.radian,
            force: data.distance
        })
    },

    handleJoystickStopEvent: ({commit}) => {
        commit('clearMove')
    },

    setup: ({state, dispatch}) => {
        dispatch('setUser');

        for (let i = 0; i < 5; i++) {
            dispatch('setFriend');
        }

        dispatch('gameLoop')
    },

    refresh: ({state, dispatch}) => {
        dispatch('setUser');
    },

    gameLoop: ({state, dispatch}) => {
        dispatch('playUser');
        dispatch('playFoods');
        dispatch('checkHit')

        requestAnimationFrame(() => dispatch('gameLoop'));
    },

    gameOver: ({state, dispatch}) => {
        let app = state.app,
            gameScene = state.gameScene,
            user = state.user

        gameScene.removeChild(user)
        clearInterval(state.interval)

        // setTimeout(() => {
        //     dispatch('refresh')
        // }, 1000)
    },

    setUser: ({state, commit}) => {
        const resource = "https://sun9-23.userapi.com/c623422/v623422145/34dbc/2BLzJkwdTMg.jpg?ava=1";

        let user = new PIXI.Container();

        let sprite = new PIXI.Sprite(state.app.loader.resources[resource].texture);
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

        user.x = window.innerWidth / 2;
        user.y = window.innerHeight / 2;

        commit('user', user);
        state.gameScene.addChild(user);
    },

    setFriend: ({state, commit}) => {
        const resource = "https://sun9-23.userapi.com/c623422/v623422145/34dbc/2BLzJkwdTMg.jpg?ava=1";

        let food = new PIXI.Container();

        let sprite = new PIXI.Sprite(state.app.loader.resources[resource].texture);
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
            point = direction.point()

        food._move_direction = direction.name;
        food._move_angle = direction.direction()
        food._move_force = getRandomFloat(1, 6, 2) * 10
        food.x = point.x
        food.y = point.y

        commit('addFood', food);

        state.gameScene.addChild(food);
    },

    playUser: ({state}) => {
        if (!state.move.force) {
            return
        }

        let vx = Math.cos(state.move.angle) * state.move.force / 10,
            vy = -Math.sin(state.move.angle) * state.move.force / 10;

        contain(state.user);

        state.user.x += vx;
        state.user.y += vy
    },

    playFoods: ({state, dispatch}) => {
        state.foods.forEach(food => {
            dispatch('playFood', food)
        })
    },

    playFood: ({state, commit}, food) => {

        let w = food.width,
            h = food.height

        if (contain(food, {x: 0 - w * 2, y: 0 - h * 2, width: window.innerWidth + w * 2, height: window.innerHeight + h * 2})) {
            console.log('remove')
            state.gameScene.removeChild(food);
            commit('removeFood', food)
        }

        let vx = Math.cos(food._move_angle) * food._move_force / 10,
            vy = -Math.sin(food._move_angle) * food._move_force / 10;

        food.x += vx
        food.y += vy
    },

    checkHit: ({state, dispatch}) => {
        state.foods.forEach(food => {
            if (boxesIntersect(state.user, food, true)) {
                dispatch('gameOver')
            }
        })
    }
}
