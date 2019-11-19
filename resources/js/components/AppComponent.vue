<template>
    <div>
        {{ user }}
    </div>
</template>

<script>
    import connect from '@vkontakte/vk-connect';

    import {mapActions, mapState} from 'vuex'

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
                initBaseApp: 'app/initApp',
            }),
        },

        mounted() {
            connect.subscribe((e) => {
                this.handleEvent(e)
            });

            this.initUserApp({app_id: 7213797})

            this.initBaseApp()
        }
    }
</script>

<style scoped>

</style>
