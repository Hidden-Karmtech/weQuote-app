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
    },
    shell: {    
      installPluginFile: {
          command: 'cordova plugin add org.apache.cordova.file'
      },
      installPluginKeyboard: {
          command: 'cordova plugin add com.ionic.keyboard'
      },
      installPluginConsole: {
          command: 'cordova plugin add org.apache.cordova.console'
      },
      installPluginDevice: {
          command: 'cordova plugin add org.apache.cordova.device'
      },
      installPluginFileTransfer: {
          command: 'cordova plugin add org.apache.cordova.file-transfer'
      },
      installPluginInappbrowser: {
          command: 'cordova plugin add org.apache.cordova.inappbrowser'
      },
      installPluginPhoneGap: {
          command: 'cordova plugin add https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git'
      },
      installPluginAdmob: {
          command: 'cordova plugin add https://github.com/floatinghotpot/cordova-plugin-admob.git'
      },
      installPluginSplashscreen: {
          command: 'cordova plugin add org.apache.cordova.splashscreen'
      },
      installPluginCamera: {
          command: 'cordova plugin add org.apache.cordova.camera'
      }
    }
  });
  
  grunt.registerTask('setup'
    , ['shell:installPluginFile', 
        'shell:installPluginKeyboard',
        'shell:installPluginConsole',
        'shell:installPluginDevice',
        'shell:installPluginFileTransfer',
        'shell:installPluginInappbrowser',
        'shell:installPluginPhoneGap',
        'shell:installPluginAdmob',
        'shell:installPluginSplashscreen',
        'shell:installPluginCamera',
        'copy']);

};