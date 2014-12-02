// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('weQuote', ['ionic','weQuote.controllers','weQuote.services','weQuote.directives','ngCordova','ionic.contrib.ui.cards'])

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

    $ionicPlatform.registerBackButtonAction(function () {
        
        //Try to figure if ask this.
        if(true){
          swal({
            title: "Sei sicuro di voler abbandonare #weQuote?",
            showCancelButton: true,
            confirmButtonColor: "#5264AE",
            cancelButtonText:"No",
            confirmButtonText: "Sì",
            closeOnConfirm: true }, 
              function(){
                ionic.Platform.exitApp();
              });
        }
      }, 100);
  });
})
.config(function($stateProvider, $urlRouterProvider) {
  
  $stateProvider
    .state('quotes', {
      url: "/quotes",
      controller: 'Quotes',
      templateUrl: "templates/quotes.html"
    })
    .state('authors', {
      url: "/authors",
      controller: 'Authors',
      templateUrl: "templates/authors.html"
    })
    .state('tags', {
      url: "/tags",
      controller: 'Tags',
      templateUrl: "templates/tags.html"
    })
    .state('about', {
      url: "/about",
      controller: 'About',
      templateUrl: "templates/about.html"
    });

  $urlRouterProvider.otherwise('/quotes');

});