module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Define the configuration for all the tasks
  grunt.initConfig({
    clean: {
      release: ["weQuote.apk"]
    },
    curl: {
      'www/data.json': 'https://api-wequote.rhcloud.com/list?deviceUUID=testclient&limit=2500',
    },
    wiredep: {
      app: {
        src: ['www/index.html'],
        exclude:'lib/angular/angular.js',
        ignorePath: /\.\.\//
      }
    },
    shell: {
      installPluginNetwork: {
        command: 'cordova plugin add org.apache.cordova.network-information'
      },
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
      },
      buildAndroidRelease: {
        command: 'cordova build --release android'
      },
      signApk: {
        command: 'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore hkt.keystore platforms/android/ant-build/weQuote-release-unsigned.apk weQuote'
      },
      compressApk: {
        command: 'zipalign -v 4 platforms/android/ant-build/weQuote-release-unsigned.apk weQuote.apk'
      },
      installPluginToast: {
        command: 'cordova plugin add https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git'
      }
    }
  });

  grunt.registerTask('setup', ['shell:installPluginFile',
    'shell:installPluginNetwork',
    'shell:installPluginKeyboard',
    'shell:installPluginConsole',
    'shell:installPluginDevice',
    'shell:installPluginFileTransfer',
    'shell:installPluginInappbrowser',
    'shell:installPluginPhoneGap',
    'shell:installPluginAdmob',
    'shell:installPluginSplashscreen',
    'shell:installPluginCamera',
    'shell:installPluginToast'
  ]);

  grunt.registerTask('release', [
    'clean:release',
    'curl',
    'shell:buildAndroidRelease',
    'shell:signApk',
    'shell:compressApk'
  ]);

};