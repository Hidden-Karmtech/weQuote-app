module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Define the configuration for all the tasks
  grunt.initConfig({
   wiredep: {
      app: {
        src: ['www/index.html'],
        ignorePath:  /\.\.\//
      }      
    },
    copy: {
      android: {
        files: [
          { src:"www/res/screens/android/hdpi-land/screen.png", dest:"platforms/android/res/drawable-land-hdpi/screen.png" },
          { src:"www/res/screens/android/hdpi-port/screen.png", dest:"platforms/android/res/drawable-port-hdpi/screen.png" },          
          { src:"www/res/screens/android/ldpi-land/screen.png", dest:"platforms/android/res/drawable-land-ldpi/screen.png" },
          { src:"www/res/screens/android/ldpi-port/screen.png", dest:"platforms/android/res/drawable-port-ldpi/screen.png" },
          { src:"www/res/screens/android/mdpi-port/screen.png", dest:"platforms/android/res/drawable-land-mdpi/screen.png" },
          { src:"www/res/screens/android/mdpi-land/screen.png", dest:"platforms/android/res/drawable-port-mdpi/screen.png" },
          { src:"www/res/screens/android/xhdpi-port/screen.png", dest:"platforms/android/res/drawable-port-xhdpi/screen.png" },
          { src:"www/res/screens/android/xhdpi-land/screen.png", dest:"platforms/android/res/drawable-land-xhdpi/screen.png" }
        ]
      }
    }
  });

};