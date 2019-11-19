import * as PIXI from 'pixi.js'

const SPEED = 5;

function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}

export default {
    initApp: ({commit, dispatch}) => {
        let app = new PIXI.Application({
                width: window.innerWidth,
                height: window.innerHeight,
                antialias: true,
                transparent: false,
                resolution: 1
            }
        );

        commit('app', app)

        document.body.appendChild(app.view);

        app.loader
            .add("https://sun9-23.userapi.com/c623422/v623422145/34dbc/2BLzJkwdTMg.jpg?ava=1")
            .on("progress", function (loader, resource) {
                //Display the file `url` currently being loaded
                console.log("loading: " + resource.url);

                //Display the percentage of files currently loaded
                console.log("progress: " + loader.progress + "%");
            })
            .load(() => dispatch('setup'));
    },

    setup: ({state, commit, dispatch}) => {
        let app = state.app

        dispatch('setUser')

        app.ticker.add(delta => dispatch('gameLoop', delta));
    },

    gameLoop: ({state, dispatch}, delta) => {
        dispatch('playUser', delta)
    },

    setUser: ({state, commit}) => {
        let user = new PIXI.Sprite(state.app.loader.resources["https://sun9-23.userapi.com/c623422/v623422145/34dbc/2BLzJkwdTMg.jpg?ava=1"].texture);

        //Capture the keyboard arrow keys
        let left = keyboard("ArrowLeft"),
            up = keyboard("ArrowUp"),
            right = keyboard("ArrowRight"),
            down = keyboard("ArrowDown");

        left.press = () => {
            user.vx = -SPEED;
        };

        left.release = () => {
            user.vx = right.isDown ? SPEED : 0;
        };

        right.press = () => {
            user.vx = SPEED;
        };

        right.release = () => {
            user.vx = left.isDown ? -SPEED : 0;
        };

        up.press = () => {
            user.vy = -SPEED;
        };
        up.release = () => {
            user.vy = down.isDown ? SPEED : 0;
        };

        down.press = () => {
            user.vy = SPEED;
        };

        down.release = () => {
            user.vy = up.isDown ? -SPEED : 0;
        };

        commit('user', user);

        state.app.stage.addChild(user);
    },

    playUser: ({state}, delta) => {
        state.user.x += state.user.vx || 0;
        state.user.y += state.user.vy || 0
    }
}
