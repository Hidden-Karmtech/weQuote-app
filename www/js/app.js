// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('weQuote', ['ionic','weQuote.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


.config(function($stateProvider, $urlRouterProvider) {
  
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('login', {
      url: "/login",
      controller: 'Login',
      templateUrl: "templates/login.html"
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

  openFB.init({appId: '654874671294085'});

});
