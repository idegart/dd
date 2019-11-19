<template>
    <div>
        {{ user }}
    </div>
</template>

<script>
    import connect from '@vkontakte/vk-connect';

    import {createNamespacedHelpers} from 'vuex'
    const {mapActions, mapState} = createNamespacedHelpers('user')

    export default {
        name: "AppComponent",

        computed: {
            ...mapState([
                'user'
            ]),
        },

        methods: {
            ...mapActions([
                'initApp',
                'handleEvent',
            ]),
        },

        mounted() {
            connect.subscribe((e) => {
                this.handleEvent(e)
            });

            this.initApp({app_id: 7213797})
        }
    }
</script>

<style scoped>

</style>
