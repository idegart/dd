<template>
    <div>
        hello!
    </div>
</template>

<script>
    import connect from '@vkontakte/vk-connect';

    export default {
        name: "AppComponent",

        mounted() {
            connect.subscribe((e) => {
                console.log({e})
            });
            connect.send("VKWebAppInit", {});

            // connect.sendPromise('VKWebAppGetUserInfo');
            // connect.send("VKWebAppInit", {});
            connect.send("VKWebAppGetUserInfo", {});

            connect.send('VKWebAppGetFriends', {});

            console.log('test')

            // connect.send("VKWebAppCallAPIMethod", {"method": "execute.ИМЯ_ПРОЦЕДУРЫ", "params": {"НАЗВАНИЕ_ПАРАМЕТРА": "ЗНАЧЕНИЕ_ПАРАМЕТРА", "v": "ВЕРСИЯ_API", "access_token": "ВАШ_КЛЮЧ_ДОСТУПА"}});
        }
    }
</script>

<style scoped>

</style>
