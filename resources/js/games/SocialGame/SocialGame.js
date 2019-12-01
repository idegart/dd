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

    removeJoystick () {
        this.joystick.destroy()
        this.joystick = null
        this.userMove = {
            angle: 0,
            force: 0
        }
    }

    updatePlayer() {

        if (this.cursors.space.isDown && !this.isCupShooting) {
            this.isCupShooting = true;
            this.shoutCup()
        } else if (this.cursors.space.isUp) {
            this.isCupShooting = false
        }

        if (this.userMove.angle) {
            this.moveUserByJoystick();
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
                    this.destroyEnemy(enemy);

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

        switch (random(0, 11)) {
            case 0: enemy = this.createEnemyPoliceman();enemy.name = 'policeman';break;
            case 1: enemy = this.physics.add.sprite(0, 0, 'dollar');enemy.name = 'dollar';break;
            case 2: enemy = this.physics.add.sprite(0, 0, 'bridge');enemy.name = 'bridge';break;
            case 3: enemy = this.physics.add.sprite(0, 0, 'ball');enemy.name = 'ball';break;
            case 4: enemy = this.physics.add.sprite(0, 0, 'forest');enemy.name = 'forest';break;
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

        this.removeSafeCup();

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

        this.setJoystick();

        times(3, () => this.addSafeCup());

        this.isPlaying = true;
        this.player.setVisible(true);
        this.player.setPosition(window.innerWidth / 2, window.innerHeight / 2);

        this.spawnEnemyTimer = setInterval(() => {
            if (document.hasFocus() && this.enemies.length < (IS_MOBILE ? 6 : 12)) {
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
            this.removeSafeCup();
            this.isPlaying = true;
            return;
        }

        this.removeJoystick()

        this.player.setVisible(false);

        clearInterval(this.spawnEnemyTimer);
        clearInterval(this.scoreTimer);

        this.game.events.emit('gameOver', {
            enemy,
            score: this.score
        })
    }


    static getEnemyDescription (enemyName) {
        let obj = {
            name: '',
            image: '',
            description: '',
            source: '',
            target: '',
        };

        switch (enemyName) {
            case 'dollar':
                obj.name = 'Коррупция';
                obj.image = 'https://www.dw.com/image/36703313_303.jpg';
                obj.description = 'Аудит выявил в Роскосмосе признаки мошенничества и коррупции. Преступные схемы в корпорации, оказывается, «работали десятилетиями».\n' +
                    'По итогам проверки было возбуждено более 15 уголовных дел';
                obj.source = 'https://tjournal.ru/news/128612-v-roskosmose-nashli-priznaki-korrupcii-i-moshennichestva-vozbuzhdeno-bolee-15-ugolovnyh-del';
                obj.target = '';
                break;
            case 'bridge':
                obj.name = 'Крымский мост';
                obj.image = 'https://i.obozrevatel.com/gallery/2019/7/18/photo2019-07-1814-46-10.jpg';
                obj.description = '«Ведомости»: Власти планируют строить новую трассу из Краснодара к Крымскому мосту.\n' +
                    'Один её километр обойдётся в 1 000 000 000 рублей';
                obj.source = 'https://meduza.io/news/2019/08/30/ot-krasnodara-k-krymskomu-mostu-planiruyut-postroit-novuyu-trassu-ona-oboydetsya-v-odin-milliard-rubley-za-kilometr?utm_campaign=vedomosti-vlasti-planiruyut-stroit-no';
                obj.target = '';
                break;
            case 'ball':
                obj.name = 'Кокорин и Мамаев';
                obj.image = 'https://cdni.rt.com/russian/images/2018.10/article/5bc347b71835613c338b45b8.jpg';
                obj.description = 'Суд рассмотрел прошение Александра Протасовицкого об УДО. Это последний фигурант дела Кокорина и Мамаева — друг футболистов, который участвовал в потасовке и сейчас находится в колонии.';
                obj.source = 'https://sport24.ru/news/football/2019-10-01-sud-otkazalsya-dosrochno-vypuskat-druga-kokorina-i-mamayeva-na-svobodu';
                obj.target = '';
                break;
            case 'forest':
                obj.name = 'Вырубка лесов';
                obj.image = 'https://ecoportal.info/wp-content/uploads/2016/12/vyrubka-lesov-foto1-544x347.jpg';
                obj.description = 'Россия может временно ограничить экспорт древесины в Китай из-за проблем лесовосстановления и «черных вырубок»';
                obj.source = 'https://tass.ru/ekonomika/6095475';
                obj.target = '';
                break;
            case 'construction':
                obj.name = 'Обманутые дольщики';
                obj.image = 'https://politika09.com/wp-content/uploads/2019/10/img_0383.jpg';
                obj.description = 'В Москве задержали мужчину, облившего себя бензином у здания Минстроя.\n' +
                    'Он назвал себя обманутым дольщиком и требовал встречи с руководством ведомства';
                obj.source = 'https://meduza.io/news/2019/06/26/u-zdaniya-minstroya-v-moskve-muzhchina-oblil-sebya-benzinom-on-nazval-sebya-obmanutym-dolschikom-i-potreboval-vstrechi-s-rukovodstvom';
                obj.target = '';
                break;
            case 'duma':
                obj.name = 'Выборы в Думу';
                obj.image = 'https://cdn.vdmsti.ru/crop/image/2019/76/1dg3bs/original-1s30.jpg?height=698&width=1240';
                obj.description = 'Победившие на выборах в Мосгордуму оппозиционеры потратили на избирательные кампании в 9 раз меньше денег, чем проигравшие провластные кандидаты';
                obj.source = 'https://www.vedomosti.ru/politics/articles/2019/09/15/811290-proshedshie-mosgordumu-oppozitsioneri';
                obj.target = '';
                break;
            case 'trash':
                obj.name = 'Мусорная реформа';
                obj.image = 'https://gdb.rferl.org/9AC78BBE-D6A3-4C82-9894-A79A807F36F2_w1597_n_r1_st.jpg';
                obj.description = 'Учёные установили, что проект «мусорной реформы», одобренной президентом, нанесёт огромный ущерб здоровью россиян.';
                obj.source = 'https://www.svoboda.org/a/29815326.html';
                obj.target = '';
                break;
            case 'med':
                obj.name = 'Уволнение мед.работников';
                obj.image = 'https://images11.esquire.ru/upload/img_cache/b39/b396f5fe9048beb54deb7e13c78e0ac1_ce_2468x1539x0x79_cropped_960x600.jpg';
                obj.description = 'Сотрудники НИИ детской онкологии и гематологии НМИЦ записали видеообращение, в котором они рассказали общественности о конфликте с руководством института.\n';
                obj.source = 'https://meduza.io/feature/2019/10/01/vrachi-instituta-detskoy-onkologii-nmits-imeni-blohina-konfliktuyut-s-direktorom';
                obj.target = '';
                break;
            case 'policeman':
                obj.name = 'Полицейский беспредел';
                obj.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ivan_Golunov_at_the_Nikulinsky_Districtional_Court%2C_2019-06-08_%283%29.jpg/1920px-Ivan_Golunov_at_the_Nikulinsky_Districtional_Court%2C_2019-06-08_%283%29.jpg';
                obj.description = 'В Москве полиция задержала спецкорреспондента «Медузы» Ивана Голунова, известного своими расследованиями о коррупции в московской мэрии и воровстве среди депутатов.';
                obj.source = 'https://ru.wikipedia.org/wiki/%D0%94%D0%B5%D0%BB%D0%BE_%D0%98%D0%B2%D0%B0%D0%BD%D0%B0_%D0%93%D0%BE%D0%BB%D1%83%D0%BD%D0%BE%D0%B2%D0%B0';
                obj.target = '';
                break;
            case 'fire':
                obj.name = '"Экономически невыгодные" пожары';
                obj.image = 'https://www.ridus.ru/images/2019/7/31/953135/main_slider_f996d82634.jpg';
                obj.description = 'Весь июль в Сибири горят леса. На данный момент, по официальным данным, площадь горящего леса достигла 1 300 000 га.\n' +
                    'Однако региональные власти уверяют, что всё под контролем и паниковать не стоит. А большую часть пожаров просто не трогают, говорят, что тушить их экономически невыгодно';
                obj.source = 'https://secretmag.ru/news/ekonomicheski-nevygodnye-rukovoditeli-gubernatorov-khotyat-otstranit-ot-tusheniya-lesnykh-pozharov-16-08-2019.htm';
                obj.target = '';
                break;
        }

        return obj
    }
}
