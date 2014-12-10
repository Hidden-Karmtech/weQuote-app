// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('weQuote', ['ionic','weQuote.controllers','weQuote.services','weQuote.directives','ngCordova','ionic.contrib.ui.cards','pasvaz.bindonce'])

.run(function($ionicPlatform,$rootScope,TagRepository,TagsState,AuthorRepository,AuthorsState,$log) {

  TagRepository.list().then(function(tags){
    TagsState.tags = tags;
  }); 

  AuthorRepository.list().then(function(authors){
    AuthorsState.authors = authors;
  });

  //Use in debug
  localStorage.clear();

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.plugins && window.plugins.AdMob) {
                var admob_key = ionic.Platform.isAndroid() ? "ca-app-pub-2603547889798705/4397541472" : "IOS_PUBLISHER_KEY";
                var admob = window.plugins.AdMob;
                admob.createBannerView( 
                    {
                        'publisherId': admob_key,
                        'adSize': admob.AD_SIZE.BANNER,
                        'bannerAtTop': false
                    }, 
                    function() {
                        admob.requestAd(
                            { 'isTesting': false }, 
                            function() {
                                admob.showAd(true);
                            }, 
                            function() { console.log('failed to request ad'); }
                        );
                    }, 
                    function() { console.log('failed to create banner view'); }
                );
            }

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    $ionicPlatform.registerBackButtonAction(function () {
        $rootScope.$broadcast('back-button-action');      
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
      title:'Autori',
      templateUrl: "templates/authors.html"
    })
    .state('tags', {
      url: "/tags",
      controller: 'Tags',
      title:'Tags',
      templateUrl: "templates/tags.html"
    })
    .state('about', {
      url: "/about",
      controller: 'About',
      title:'About',
      templateUrl: "templates/about.html"
    });

  $urlRouterProvider.otherwise('/quotes');

});