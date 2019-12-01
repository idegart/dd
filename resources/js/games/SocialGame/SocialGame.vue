<template>
    <div id="socialGameContainer">
        <div id="initialGameModal" class="modal" data-backdrop="static" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Добро пожаловать</h5>
                    </div>
                    <div class="modal-body">
                        <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. A accusantium aspernatur corporis
                            cumque dolore doloremque dolores eos expedita harum maxime necessitatibus, odit pariatur
                            possimus quos sequi tempore, temporibus. Libero, voluptatem.
                        </div>
                        <div>Ab autem cum, dicta dolores eos eveniet in incidunt ipsam libero modi rerum ullam velit.
                            Aperiam consequatur culpa et facere ipsa itaque, iusto laudantium, maiores, praesentium
                            quasi totam vitae voluptatum!
                        </div>
                        <div>Accusamus alias asperiores atque beatae deleniti et exercitationem impedit qui sit.
                            Aspernatur assumenda at consequatur doloremque id, magnam minus omnis quam quis recusandae
                            sunt tempore temporibus! Ad aliquid eligendi inventore?
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
                            <dt class="col-sm-3">Вы достигли:</dt>
                            <dd class="col-sm-9">A description list is perfect for defining terms.</dd>

                            <dt class="col-sm-3">Вас постигло:</dt>
                            <dd class="col-sm-9">
                                {{ enemu && enemu.name }}
                            </dd>

                            <dt class="col-sm-3">Информация:</dt>
                            <dd class="col-sm-9">Etiam porta sem malesuada magna mollis euismod.</dd>

                            <dt class="col-sm-3">Источник:</dt>
                            <dd class="col-sm-9">Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</dd>
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
                                <button @click="startGame" type="button" class="btn btn-secondary btn-lg btn-block">
                                    Поделиться с согражданами
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
                enemu: null,
            }
        },

        computed: {
            vkAppInitialized () {
                return this.$store.getters['vk/initialized']
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
                this.hideModal('#initialGameModal')
                this.hideModal('#endGameModal')

                this.game.events.emit('startGame')
            },

            initGame () {
                this.game = new Phaser.Game(this.gameConfig);

                this.game.events.on('gameOver', ({enemy, score}) => {
                    this.score = score
                    this.enemu = enemy
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
