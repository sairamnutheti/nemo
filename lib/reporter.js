var debug = require('debug');
var log = debug('nemo:reporter:log');
var filenamify = require('filenamify');
var fs = require('fs');
var mkdirp = require('mkdirp');
var util = require('./util');

function masterEnd(context) {
  context.emitter.once('master:end', (_context, _instances) => {
    let output = util.formatSummary(_instances);
    // make report directory in case mocha reporter did not (happens when no tests run)
    mkdirp.sync(`${_context.config.get('output:reports')}`);
    try {
      fs.writeFileSync(`${_context.config.get('output:reports')}/summary.json`, JSON.stringify(output, null, '\t'));
    } catch (err) {
      console.error('something went wrong writing report file summary.json');
      console.error(err);
    }
  });
}
module.exports.mochawesome = function mochawesome(context, instance) {
  masterEnd(context);
  if (!instance.conf.reports) {
    log('mochawesome: output.reports was not defined. Fallback to manual mochawesome config');
    return;
  }
  let assetsDir = `${instance.conf.reportsBase}/mochawesomeAssets`;
  log('mochawesome: start: %O', instance.conf.mocha);
  let instanceLabel = '';
  for (let tag in instance.tags) {
    if (instance.tags.hasOwnProperty(tag)) {
      instanceLabel = instanceLabel + `:${tag}:${instance.tags[tag]}:`;
    }
  }
  instance.conf.reports = `${instance.conf.reports}/${filenamify(instanceLabel)}`;
  let reporterOptions = {
    reportDir: instance.conf.reports,
    reportFilename: 'nemo-report',
    assetsDir: assetsDir
  };
  instance.tags.reportFile = `${instance.conf.reports}/nemo-report.html`.split(instance.conf.reportsBase)[1];
  instance.conf.mocha.reporterOptions = Object.assign({}, instance.conf.mocha.reporterOptions, reporterOptions);
};

module.exports.xunit = function (context, instance) {
  masterEnd(context);
  if (!instance.conf.reports) {
    log('xunit: output.reports was not defined. Fallback to manual xunit config');
    return;
  }
  log('xunit: start');
  let instanceLabel = '';
  for (let tag in instance.tags) {
    if (instance.tags.hasOwnProperty(tag)) {
      instanceLabel = instanceLabel + `:${tag}:${instance.tags[tag]}:`;
    }
  }
  instance.conf.reports = filenamify.path(`${instance.conf.reports}/${instanceLabel}`);
  let reporterOptions = {
    output: `${instance.conf.reports}/nemo-report.xml`
  };
  instance.tags.reportFile = `${instance.conf.reports}/nemo-report.xml`.split(instance.conf.reportsBase)[1];
  instance.conf.mocha.reporterOptions = Object.assign({}, instance.conf.mocha.reporterOptions, reporterOptions);
  log('xunit: config: %O', instance.conf.mocha);
};

module.exports['mocha-allure-reporter'] = function (context, instance) {
  masterEnd(context);
  if (!instance.conf.reports) {
    log('mocha-allure-report: output.reports was not defined. Fallback to manual mocha allure report config');
    return;
  }
  log(`mocha-allure-report: start`);
  let instanceLabel = '';
  for (let tag in instance.tags) {
    if (instance.tags.hasOwnProperty(tag)) {
      instanceLabel += `:${tag}:${instance.tags[tag]}:`;
    }
  }
  instance.conf.reports = filenamify.path(`${instance.conf.reports}/${instanceLabel}`);
  let reporterOptions = {
    targetDir: instance.conf.reports
  };
  instance.conf.mocha.reporterOptions = Object.assign({}, instance.conf.mocha.reporterOptions, reporterOptions);
  log(`mocha-allure-reporter: config: %O`, instance.conf.mocha);
};
