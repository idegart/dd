import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import vk from './modules/vk'

const store = new Vuex.Store({
    modules: {
        vk,
    }
});

export default store

