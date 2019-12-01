import connect from '@vkontakte/vk-connect';

export default {
    initApp: ({commit, dispatch}, {app_id}) => {
        console.log('VKApp request initialization', {app_id})
        commit('app_id', app_id)
        dispatch('dispatchEvent', {type: "VKWebAppInit"})

        console.log('VKApp was pseudo initialized')
        commit('initialized', true)
    },

    getUserInfo: ({dispatch}) => {
        // dispatch('dispatchEvent', {type: "VKWebAppGetUserInfo"})
    },

    dispatchShare: ({dispatch}) => {
        dispatch('dispatchEvent', {type: "VKWebAppShare", params: {
            link: `https://vk.com/app${process.env.MIX_GAME_SOCIAL_VK_APP_ID}`
        }})
    },

    dispatchWallPost: ({dispatch}) => {
        dispatch('dispatchEvent', {type: "VKWebAppShowWallPostBox", params: {
            message: `Hello!`
        }})
    },

    dispatchEvent: ({}, {type, params = {}}) => {
        console.log('VKApp dispatch event:', {type, params})
        connect.send(type, params);
    },

    handleEvent: ({commit, dispatch}, event) => {
        console.log({event})

        if (event.detail.handler === "VKWebAppInit") {
            dispatch('handleInitApp')
        }
    },

    handleInitApp: ({commit}) => {
        console.log('VKApp was initialized')
        commit('initialized', true)
    }
}
