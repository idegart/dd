export default {
    app: (state, app) => state.app = app,
    gameScene: (state, gameScene) => state.gameScene = gameScene,
    startScene: (state, startScene) => state.startScene = startScene,

    user: (state, user) => state.user = user,
    foods: (state, foods) => state.food = foods,

    addFood: (state, food) => state.foods.push(food),
    removeFood: (state, food) => state.foods.splice(state.foods.indexOf(food), 1),

    joystick: (state, joystick) => state.joystick = joystick,

    clearMove: state => state.move = {angle: 0, force: null},
    setMove: (state, move) => state.move = move,

    intervalSec: (state, intervalSec) => state.intervalSec = intervalSec,
    interval: (state, interval) => state.interval = interval,

    animationFrameId: (state, animationFrameId) => state.animationFrameId = animationFrameId
}
