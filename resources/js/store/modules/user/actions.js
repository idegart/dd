import connect from '@vkontakte/vk-connect';

export default {
    initApp: ({commit, dispatch}, {app_id = null}) => {
        commit('appId', app_id)
        console.log('inited')
        dispatch('dispatchEvent', {type: "VKWebAppInit"})
        dispatch('getUserInfo')
        // dispatch('getAuthToken')
    },

    getUserInfo: ({dispatch}) => {
        dispatch('dispatchEvent', {type: "VKWebAppGetUserInfo"})
    },

    // getAuthToken: ({state, dispatch}) => {
    //     dispatch('dispatchEvent', {type: "VKWebAppGetAuthToken", params: {
    //         app_id: state.app_id,
    //         scope: state.scope.join(','),
    //     }})
    // },
    //
    // loadFriends: ({state, dispatch}) => {
    //     if (!state.user || !state.access_token) {
    //         return
    //     }
    //
    //     dispatch('dispatchEvent', {type: "VKWebAppCallAPIMethod", params: {
    //         "method": "friends.get",
    //         "request_id": "friends.get",
    //         "params": {
    //             user_id:    state.user.id,
    //             order:      "hints",
    //             fields:     state.friendsFields.join(','),
    //             v:          state.vk_api_version,
    //             access_token:   state.access_token,
    //         }
    //     }})
    // },

    dispatchEvent: ({}, {type, params = {}}) => {
        console.log({type, params})
        connect.send(type, params);
    },

    handleEvent: ({commit, dispatch}, event) => {
        console.log({event})

        // if (event.detail.type === "VKWebAppAccessTokenReceived") {
        //     commit('accessToken', event.detail.data.access_token)
        //     dispatch('loadFriends')
        // }

        if (event.detail.type === "VKWebAppGetUserInfoResult") {
            commit('user', event.detail.data)
            // dispatch('loadFriends')
        }

        // if (event.detail.type === "VKWebAppCallAPIMethodResult" && event.detail.data.request_id === "friends.get") {
        //     commit('friends', event.detail.data.response)
        // }
    },
}
