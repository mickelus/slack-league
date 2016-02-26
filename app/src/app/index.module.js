/* global moment:false */

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import {MainController} from './main/main.controller';
import LadderController from './ladder/ladder.controller';
import {ReportsController} from './reports/reports.controller';
import highlight from './components/highlight/highlight.directive';

angular.module('app', ['ngAnimate', 'ngTouch', 'ui.router', 'emguo.poller'])
  .constant('moment', moment)
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .controller('MainController', MainController)
  .controller('LadderController', LadderController)
  .controller('ReportsController', ReportsController)
  .directive('highlight', highlight);
