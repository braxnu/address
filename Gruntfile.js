module.exports = function (grunt) {

    grunt.initConfig({
        build: {
            options: {
                include: ["address", "ok", "error"],
                plugins: {
                  "text": '../node_modules/text/text'
                , "web": 'empty:'
                }
            }
        },

        karma: {
            "ci-test": {
                configFile: "karma.conf.js",
                colors: false,
                singleRun: true,
                reporters: "teamcity",
                browsers: ["Chrome"]
            }
        }
    });

    grunt.loadNpmTasks('zambezi-contrib-build');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask("default", ["build"]);
    grunt.registerTask("ci-build", ["build"]);
}
