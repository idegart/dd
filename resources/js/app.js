require('./bootstrap');

window.Vue = require('vue');

const gameFiles = require.context('./games', true, /\.vue$/i);
gameFiles.keys().map(key => {
    let componentName = key.split('/').pop().split('.')[0],
        path = `./games/${key.replace(/\.\//, '')}`

    Vue.component(componentName, () => import(
        /* webpackMode: "lazy" */
        /* webpackChunkName: "[request]" */
        `${path}`))
});

import store from '@store'

const app = new Vue({
    el: '#app',
    store,
});
