export function routerConfig ($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'vm'
    })
    .state('main.reports', {
      url: 'reports',
      templateUrl: 'app/reports/reports.html',
      controller: 'ReportsController',
      controllerAs: 'vm'
    })
    .state('main.ladder', {
      url: 'ladder',
      templateUrl: 'app/ladder/ladder.html',
      controller: 'LadderController',
      controllerAs: 'vm'
    });

  $urlRouterProvider.otherwise('/ladder');
}
