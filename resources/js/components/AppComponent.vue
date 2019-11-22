<template>
    <div id="app-container">

        <div id="scoreModal" class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Поздравляем!</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Ваша скидка составляет: {{ score }}%</p>

                        <input class="form-control my-3" type="text" placeholder="Промокод сюда..." readonly>

                        <span class="text-muted">*Данная скидка применима только на один заказ и только на черную пятницу</span>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal">Попробовать еще</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import {mapActions, mapState} from 'vuex'

    import connect from '@vkontakte/vk-connect';

    import Game from "../plugins/Game";

    export default {
        name: "AppComponent",

        data: () => ({
            game: null,
            score: 0
        }),

        computed: {
            ...mapState({
                user: 'user/user',
            }),
        },

        methods: {
            ...mapActions({
                initUserApp: 'user/initApp',
                handleEvent: 'user/handleEvent',
            }),
        },

        mounted() {
            let image = "https://sun9-23.userapi.com/c623422/v623422145/34dbc/2BLzJkwdTMg.jpg?ava=1";

            this.game = new Game(document.getElementById('app-container'), image)

            this.game.on('over', score => {
                this.score = score
                $('#scoreModal').modal('show')
            })

            connect.subscribe((e) => {
                this.handleEvent(e)
            });

            this.initUserApp({app_id: 7213797})

            $('#scoreModal').on('hidden.bs.modal', () => {
                this.game.retry()
            })
        }
    }
</script>

<style scoped>

</style>
