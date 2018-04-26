var allure = require('allure-commandline');
var debug = require('debug');
var log = debug('nemo:allure:log');

module.exports = function (context) {
  context.instances.forEach(function (instance) {
    if(instance.conf.mocha.reporter === 'mocha-allure-reporter') {
      var generation = allure(['generate', instance.conf.reports, '--report-dir', `${instance.conf.reports}/nemo-report`]);
      generation.on('exit', function (exitCode) {
        log('Generation is finished with code:', exitCode);
        var autoOpen = instance.conf.mocha.reporterOptions.autoOpen || false;
        if (autoOpen === true) {
          allure(['open', `${instance.conf.reports}/nemo-report`]);
        }
      });
    }
  });
};
