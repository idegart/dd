const path = require('path');

module.exports = {
    resolve: {
        alias: {
            "@js": path.resolve(__dirname, "./resources/js"),
            "@sass": path.resolve(__dirname, "./resources/sass"),
            "@component": path.resolve(__dirname, "./resources/js/components"),
            "@game": path.resolve(__dirname, "./resources/js/games"),
            "@plugin": path.resolve(__dirname, "./resources/js/plugins"),
            "@module": path.resolve(__dirname, "./resources/js/modules"),
            "@store": path.resolve(__dirname, "./resources/js/store"),
        },
    },
    output: {
        chunkFilename: `dist/js/chunks/[name].js`,
    },
};
