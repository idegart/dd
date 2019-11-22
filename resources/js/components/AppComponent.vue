<template>
    <div id="app-container" style="background-color: green; height: 100vh; width: 100vw;position: absolute;">
    </div>
</template>

<script>
    import {mapActions, mapState} from 'vuex'

    import connect from '@vkontakte/vk-connect';

    import Game from "../plugins/Game";

    export default {
        name: "AppComponent",

        computed: {
            ...mapState({
                user: 'user/user',
            }),
        },

        methods: {
            ...mapActions({
                initUserApp: 'user/initApp',
                handleEvent: 'user/handleEvent',
                // initBaseApp: 'app/initApp',
            }),
        },

        mounted() {
            let game = new Game(document.getElementById('app-container'))
            connect.subscribe((e) => {
                this.handleEvent(e)
            });
            //
            this.initUserApp({app_id: 7213797})
            // this.initBaseApp()
        }
    }
</script>

<style scoped>

</style>
