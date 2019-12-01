<template>
    <div id="socialGameContainer">
        <div id="initialGameModal" class="modal" data-backdrop="static" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Добро пожаловать</h5>
                    </div>
                    <div class="modal-body">
                        <div>
                            Добро пожаловать в игру "Жызн в Росеи"
                        </div>
                        <div>
                            Не потрать все свои пластиковые стаканчики и не упусти возможность подобрать чужие
                        </div>
                        <div>
                            Чтобы управлять - води пальцем по экрану
                        </div>
                    </div>
                    <div class="modal-footer">
                        <ul class="list-unstyled w-100 m-0">
                            <li>
                                <button @click="startGame" type="button" class="btn btn-primary btn-lg btn-block">
                                    Попытать удачу
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div id="endGameModal" class="modal" data-backdrop="static" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Дистанция: {{ score }}км</h5>
                    </div>
                    <div class="modal-body">
                        <dl class="row">
                            <dt class="col-sm-3">Вас постигло:</dt>
                            <dd class="col-sm-9">
                                <div>
                                    {{enemyData.name}}
                                </div>
                                <div>
                                    <img v-if="enemyData && enemyData.image" :src="enemyData.image" alt="" width="100%">
                                </div>
                            </dd>

                            <dt class="col-sm-3">Информация:</dt>
                            <dd class="col-sm-9">
                                {{enemyData.description}}
                            </dd>

                            <dt class="col-sm-3">Источник:</dt>
                            <dd class="col-sm-9">
                                <a :href="enemyData.source" target="_blank">К источнику</a>
                            </dd>
                        </dl>
                    </div>
                    <div class="modal-footer">
                        <ul class="list-unstyled w-100 m-0">
                            <li>
                                <button @click="startGame" type="button" class="btn btn-primary btn-lg btn-block">
                                    Попытать удачу еще раз
                                </button>
                            </li>
                            <li class="mt-3">
                                <button @click="share" type="button" class="btn btn-secondary btn-lg btn-block">
                                    Поделиться с друзьяшками
                                </button>
                            </li>
                            <li class="mt-3">
                                <button @click="wallPost" type="button" class="btn btn-secondary btn-lg btn-block">
                                    Опубликовать на стене
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import * as Phaser from 'phaser'
    import SocialGame from "./SocialGame";

    import connect from '@vkontakte/vk-connect'

    export default {
        data () {
            return {
                game: null,
                gameConfig: {
                    type: Phaser.AUTO,
                    parent: 'socialGameContainer',
                    dom: {
                        createContainer: true
                    },
                    pixelArt: true,
                    backgroundColor: '#182d3b',
                    width: window.innerWidth,
                    height: window.innerHeight,
                    physics: {
                        default: 'arcade',
                        arcade: {
                            gravity: { y: 0 }
                        }
                    },
                    scene: SocialGame,
                },

                score: 0,
                enemy: null,
            }
        },

        computed: {
            vkAppInitialized () {
                return this.$store.getters['vk/initialized']
            },

            enemyData () {
                return this.enemy && SocialGame.getEnemyDescription(this.enemy.name) || {}
            }
        },

        watch: {
            vkAppInitialized (value) {
                if (!value) return

                this.initGame()

                this.showModal('#initialGameModal')
            }
        },

        methods: {
            startGame () {
                console.log('test 1')
                this.hideModal('#initialGameModal')
                console.log('test 2')
                this.hideModal('#endGameModal')
                console.log('test 3')
                this.game.events.emit('startGame')
                console.log('test 4')
            },

            initGame () {
                this.game = new Phaser.Game(this.gameConfig);

                this.game.events.on('gameOver', ({enemy, score}) => {
                    this.score = score
                    this.enemy = enemy
                    console.log('gameOver', {enemy, score})

                    this.showModal('#endGameModal')
                })
            },

            showModal (id) {
                $(id).modal('show')
            },

            hideModal (id) {
                $(id).modal('hide')
            },

            share () {
                this.$store.dispatch('vk/dispatchShare', {
                    link: `https://vk.com/app${process.env.MIX_GAME_SOCIAL_VK_APP_ID}`
                })
            },

            wallPost () {
                this.$store.dispatch('vk/dispatchWallPost', {
                    message: `Я убежал от Росеи на ${this.score}км. Кто сможет дальше? Спасити миня!!`
                })
            },
        },

        created() {
            connect.subscribe(event => {
                this.$store.dispatch('vk/handleEvent', event)
            });
        },

        mounted() {
            this.$store.dispatch('vk/initApp', {app_id: process.env.MIX_GAME_SOCIAL_VK_APP_ID})
        }
    }
</script>

<style scoped>

</style>
