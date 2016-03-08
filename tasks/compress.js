/*
 * grunt-contrib-compress
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Chris Talkington, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var compress = require('./lib/compress')(grunt);
  var chalk = require('chalk');

  grunt.registerMultiTask('compress', 'Compress files.', function() {
    var compressed, processed, taskLength, taskDone, taskFiles;
    function taskCallback(mode) {
      if (mode === 'dir') {
        taskFiles--;
      }
      if (mode === 'gzip') {
        compressed++;
      }
      if (mode === 'tar') {
        grunt.log.ok('Compressed ' + chalk.cyan(taskLength) + ' ' + grunt.util.pluralize(taskLength, 'file/files.'));
        taskDone();
      } else if (processed === taskLength - 1) {
        grunt.log.ok('Compressed ' + chalk.cyan(compressed.toString()) + ' out of ' + chalk.cyan(taskFiles.toString()) + ' ' + grunt.util.pluralize(compressed, 'file/files.'));
        taskDone();
      }
      processed++;
    }
    
    compress.options = this.options({
      archive: null,
      ifSmaller: false,
      level: 1,
      minSize: 0,
      mode: null
    });

    if (typeof compress.options.archive === 'function') {
      compress.options.archive = compress.options.archive();
    }

    compress.options.mode = compress.options.mode || compress.autoDetectMode(compress.options.archive);

    if (grunt.util._.include(['zip', 'tar', 'tgz', 'gzip', 'deflate', 'deflateRaw'], compress.options.mode) === false) {
      grunt.fail.warn('Mode ' + String(compress.options.mode).cyan + ' not supported.');
    }

    compressed = 0;
    processed = 0;
    taskDone = this.async();
    taskLength = 0;
    this.files.forEach(function(val) {
      taskLength += val.src.length;
    });
    taskFiles = taskLength;
    if (compress.options.mode === 'gzip' || compress.options.mode.slice(0, 7) === 'deflate') {
      compress[compress.options.mode](this.files, taskCallback);
    } else {
      compress.tar(this.files, taskCallback);
    }
  });
};
