angular.module('weQuote', [
    'ionic',
    'weQuote.controllers',
    'weQuote.services',
    'weQuote.directives',
    'weQuote.secrets',
    'ngCordova',
    'pasvaz.bindonce'
  ])
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
  }])
  .run(function(
    $ionicPlatform,
    $rootScope,
    $log,
    $cordovaDevice,
    WeQuote,
    $window,
    $state,
    $cordovaSplashscreen,
    ANDROID_ADMOB,
    IOS_ADMOB) {

    //Add Paginate function to lodash
    _.mixin({
      'paginate': function(arr, size) {
        var pages = [];

        size = size || this.length;

        while (arr.length) {
          pages.push(arr.splice(0, size));
        }

        return pages;
      }
    });


    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      window.backButtonClick = 0;

      if (window.plugins && window.plugins.AdMob) {
        var admob_key = ionic.Platform.isAndroid() ? ANDROID_ADMOB : IOS_ADMOB;
        var admob = window.plugins.AdMob;
        admob.createBannerView({
            'publisherId': admob_key,
            'adSize': admob.AD_SIZE.BANNER,
            'bannerAtTop': false
          },
          function() {
            admob.requestAd({
                'isTesting': false
              },
              function() {
                admob.showAd(true);
              },
              function() {
                console.log('failed to request ad');
              }
            );
          },
          function() {
            console.log('failed to create banner view');
          }
        );
      }

      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      $ionicPlatform.registerBackButtonAction(function() {
        $rootScope.$broadcast('back-button-action');
      }, 100);

      WeQuote.init().then(function(result) {
        if (!result) {
          swal({
              title: "Connesione Internet Assente",
              text: "L'applicazione avrà funzionalità limitate",
              confirmButtonColor: "#5264AE",
              closeOnConfirm: true
            },
            function() {
              $state.go("quotes").then(function(){
                $cordovaSplashscreen.hide();  
              });
            });
        } else {
          $state.go("quotes").then(function(){
            $cordovaSplashscreen.hide();  
          });
        }

      });


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
        title: 'Autori',
        templateUrl: "templates/authors-tags.html"
      })
      .state('tags', {
        url: "/tags",
        controller: 'Tags',
        title: 'Tags',
        templateUrl: "templates/authors-tags.html"
      })
      .state('about', {
        url: "/about",
        controller: 'About',
        title: 'About',
        templateUrl: "templates/about.html"
      })
      .state('loading', {
        url: "/loading",
        templateUrl: "templates/loading.html"
      })

    $urlRouterProvider.otherwise('/loading');

  });