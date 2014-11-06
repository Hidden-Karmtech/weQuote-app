module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-wiredep');

  // Define the configuration for all the tasks
  grunt.initConfig({
   wiredep: {
      app: {
        src: ['www/index.html'],
        ignorePath:  /\.\.\//
      }
    }
  });

};