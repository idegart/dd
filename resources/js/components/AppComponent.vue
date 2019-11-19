<template>
    <div>
        hello!
    </div>
</template>

<script>
    import connect from '@vkontakte/vk-connect';

    export default {
        name: "AppComponent",

        data: () => ({
            app_id: 7213797,
            user_id: null,
            access_token: null,
        }),

        methods: {
            loadUsers () {
                if (!this.user_id || !this.access_token) {
                    return
                }

                connect.send("VKWebAppCallAPIMethod", {
                    "method": "friends.get",
                    "request_id": "32test",
                    "params": {
                        "user_id": this.user_id,
                        "order": "hints",
                        "fields": "nickname,domain,photo_50,photo_100,online,last_seen,status,can_write_private_message",
                        "access_token": this.access_token,
                        "v":"5.103",
                    }
                });
            },
        },

        mounted() {
            connect.subscribe((e) => {
                console.log({e})
                
                if (e.detail.type === "VKWebAppAccessTokenReceived") {
                    this.access_token = e.detail.data.access_token
                    this.loadUsers()
                }

                if (e.detail.type === "VKWebAppGetUserInfoResult") {
                    this.user_id = e.detail.data.id
                    this.loadUsers()
                }
            });
            connect.send("VKWebAppInit", {});

            connect.send("VKWebAppGetUserInfo", {});

            connect.send("VKWebAppGetAuthToken", {"app_id": this.app_id, "scope": "friends,status"});
        }
    }
</script>

<style scoped>

</style>
