import * as Phaser from 'phaser'
import nipple from "nipplejs";

import {times, random} from 'lodash'
import BaseGameScene from '@module/BaseGameScene';

const SPEED = 500;
const IS_MOBILE = window.innerWidth < 450;
const SCALE = IS_MOBILE ? 1 : 2;
const ENEMY_SPEED_MIN = IS_MOBILE ? 300 : 400;
const ENEMY_SPEED_MAX = IS_MOBILE ? 500 : 600;

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return parseInt(color, 16);
}

export default class SocialGame extends BaseGameScene {

    init() {
        this.spawnEnemyTimer = null;
        this.enemies = [];
        this.cups = [];
        this.isPlaying = false;
        this.isCupShooting = false;

        this.safeCups = [];

        this.scoreText = null;
        this.score = 0;
        this.scoreTimer = null;

        this.gradient = null;
        this.joystick = null;

        this.userMove = {
            angle: 0,
            force: 0
        }
    }

    preload() {
        this.load.setBaseURL('/gameFiles/social/');

        this.load.spritesheet('person', 'personSprite.png', {
            frameWidth: 34,
            frameHeight: 60,
        });

        this.load.image('cup', 'cup.png');
        this.load.image('dollar', 'dollar.png');
        this.load.image('bridge', 'bridge.png');
        this.load.image('ball', 'ball.png');
        this.load.image('forest', 'forest.png');
        this.load.image('hole', 'hole.png');
        this.load.image('construction', 'construction.png');
        this.load.image('duma', 'duma.png');
        this.load.image('trash', 'trash1.png');
        this.load.image('med', 'med.png');

        this.load.spritesheet('policeman', 'policeman.png', {
            frameWidth: 34,
            frameHeight: 60,
        });

        this.load.spritesheet('fire', 'fire.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    create() {
        this.gradient = this.add.graphics();

        this.gradient.clear();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.createPlayer();

        this.scoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#fff' });

        this.updateBackground();

        this.setJoystick()

        this.game.events.on('startGame', () => this.startGame())
    }

    update(time, delta) {
        this.updatePlayer();
        this.updateEnemies();
        this.updateCups();
    }

    setJoystick () {
        this.joystick = nipple.create({
            zone: document.getElementById('socialGameContainer'),
            mode: 'dynamic',
            position: {right: '50%', bottom: '15%'},
        });

        this.joystick
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
    }

    updatePlayer() {

        if (this.cursors.space.isDown && !this.isCupShooting) {
            this.isCupShooting = true;
            this.shoutCup()
        } else if (this.cursors.space.isUp) {
            this.isCupShooting = false
        }

        if (this.userMove.angle) {
            this.moveUserByJoystick()
            return
        }

        this.moveUserByKeyboard()
    }

    moveUserByJoystick () {
        let vx = Math.cos(this.userMove.angle) * this.userMove.force * SPEED / 50,
            vy = Math.sin(this.userMove.angle) * this.userMove.force * SPEED / 50;

        this.player.setVelocity(vx, -vy);
    }

    moveUserByKeyboard () {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-SPEED);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(SPEED);
        }
        else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-SPEED)
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(SPEED)
        } else {
            this.player.setVelocityY(0)
        }
    }

    updateEnemies () {
        this.enemies.forEach(enemy => {
            if (this.isPlaying) {
                this.physics.collide(this.player, enemy, () => {
                    this.destroyEnemy(enemy)

                    if (enemy.is_cup) {
                        this.addSafeCup();
                        return
                    }

                    this.gameOver(enemy)
                });
            }

            if (!Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, enemy.getBounds())) {
                if (!this.isPlaying || enemy.is_cup || !random(0,10)) {
                    this.destroyEnemy(enemy)
                } else {
                    enemy.setRandomPosition(0, 0, window.innerWidth, 0)
                }
            }
        })
    }

    updateCups () {
        this.cups.forEach(cup => {
            this.enemies.forEach(enemy => {
                this.physics.collide(cup, enemy, () => {
                    this.destroyCup(cup);
                    this.destroyEnemy(enemy)
                });
            });

            if (!Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, cup.getBounds())) {
                this.destroyCup(cup)
            }
        })
    }

    destroyCup (cup) {
        cup.destroy();
        this.cups.splice(this.cups.indexOf(cup), 1)
    }

    destroyEnemy (enemy) {
        enemy.destroy();
        this.enemies.splice(this.enemies.indexOf(enemy), 1)
    }

    createPlayer () {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('person', {}),
            frameRate: 12,
            repeat: -1
        });

        this.player = this.physics.add.sprite(400, 300, 'person');
        this.player.setCollideWorldBounds();
        this.player.setVisible(false);
        this.player.setImmovable(true);

        this.player.setScale(SCALE, SCALE);

        this.player.play('walk')
    }

    createEnemy () {
        let enemy;

        switch (random(0, 12)) {
            case 0: enemy = this.createEnemyPoliceman();enemy.name = 'policeman';break;
            case 1: enemy = this.physics.add.sprite(0, 0, 'dollar');enemy.name = 'dollar';break;
            case 2: enemy = this.physics.add.sprite(0, 0, 'bridge');enemy.name = 'bridge';break;
            case 3: enemy = this.physics.add.sprite(0, 0, 'ball');enemy.name = 'ball';break;
            case 4: enemy = this.physics.add.sprite(0, 0, 'forest');enemy.name = 'forest';break;
            case 5: enemy = this.physics.add.sprite(0, 0, 'hole');enemy.name = 'hole';break;
            case 6: enemy = this.physics.add.sprite(0, 0, 'construction');enemy.name = 'construction';break;
            case 7: enemy = this.physics.add.sprite(0, 0, 'duma');enemy.name = 'duma';break;
            case 8: enemy = this.physics.add.sprite(0, 0, 'trash');enemy.name = 'trash';break;
            case 9: enemy = this.physics.add.sprite(0, 0, 'med');enemy.name = 'med';break;
            case 10: enemy = this.createEnemyFire();enemy.name = 'fire';break;
            default:
                enemy = this.createEnemySafeCup()
        }

        enemy.setRandomPosition(0, 0, window.innerWidth, 0);
        enemy.setImmovable(true);
        enemy.setScale(SCALE, SCALE);
        enemy.setVelocityY(random(ENEMY_SPEED_MIN, ENEMY_SPEED_MAX));

        this.enemies.push(enemy)
    }

    createEnemyPoliceman () {
        this.anims.create({
            key: 'policeman_walk',
            frames: this.anims.generateFrameNumbers('policeman', {}),
            frameRate: 12,
            repeat: -1
        });

        return this.physics.add.sprite(0, 0, 'square')
            .setRandomPosition(0, 0, window.innerWidth, 0)
            .setImmovable(true)
            .setVelocityY(SPEED)
            .play('policeman_walk')
    }

    createEnemyFire () {
        this.anims.create({
            key: 'fire',
            frames: this.anims.generateFrameNumbers('fire', {}),
            frameRate: 12,
            repeat: -1
        });

        return this.physics.add.sprite(0, 0, 'fire')
            .setRandomPosition(0, 0, window.innerWidth, 0)
            .setImmovable(true)
            .setVelocityY(SPEED)
            .play('fire')
    }

    createEnemySafeCup () {
        let enemy;

        enemy = this.physics.add.sprite(0, 0, 'cup');
        enemy.is_cup = true;

        return enemy
    }

    shoutCup () {
        if (!this.isPlaying || !this.safeCups.length) {
            return
        }

        this.removeSafeCup()

        let cup = this.physics.add.sprite(this.player.x, this.player.y, 'cup');
        cup.setImmovable(true);
        cup.setVelocityY(-SPEED * 2);

        this.cups.push(cup)
    }

    removeSafeCup () {
        let safeCup = this.safeCups.pop();
        safeCup.destroy();
    }

    addSafeCup () {
        let cup = this.add.sprite(this.safeCups.length * 40 + 30, 70, 'cup');
        this.safeCups.push(cup)
    }

    updateBackground () {
        this.gradient.clear();
        this.gradient.fillGradientStyle(getRandomColor(), getRandomColor(), getRandomColor(), getRandomColor(), 1);
        this.gradient.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    startGame () {
        this.enemies.forEach(enemy => {
            enemy.destroy()
        });
        this.safeCups.forEach(cup => {
            cup.destroy()
        });
        this.enemies = [];
        this.safeCups = [];
        this.cups = [];
        this.score = 0;

        this.updateBackground();

        times(3, () => this.addSafeCup());

        this.isPlaying = true;
        this.player.setVisible(true);
        this.player.setPosition(window.innerWidth / 2, window.innerHeight / 2);

        this.spawnEnemyTimer = setInterval(() => {
            if (document.hasFocus()) {
                this.createEnemy()
            }
        }, 1000);

        this.scoreTimer = setInterval(() => {
            if (document.hasFocus()) {
                this.score += 1;
                this.scoreText.setText(`Дистанция: ${this.score}км`)
            }
        }, 100)
    }

    gameOver (enemy) {
        if (!this.isPlaying) {
            return
        }

        this.isPlaying = false;

        if (this.safeCups.length) {
            this.removeSafeCup()
            this.isPlaying = true
            return;
        }

        this.player.setVisible(false);

        clearInterval(this.spawnEnemyTimer);
        clearInterval(this.scoreTimer);

        this.game.events.emit('gameOver', {
            enemy,
            score: this.score
        })
    }
}
