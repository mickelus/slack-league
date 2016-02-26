export class MainController {
  constructor () {
    'ngInject';

    this.activate();
  }

  activate() {
    
  }


  showToastr() {
    this.toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
    this.classAnimation = '';
  }
}
