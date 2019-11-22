export {getRandomInt, getRandomFloat, DIRECTIONS, contain, boxesIntersect, SIZE}

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
