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
                        "access_token": this.access_token,
                    }
                });
            },
        },

        mounted() {
            connect.subscribe((e) => {
                console.log({e})
                
                if (e.detail.type === "VKWebAppAccessTokenReceived") {
                    this.loadUsers()
                }

                if (e.detail.type === "VKWebAppGetUserInfoResult") {
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
