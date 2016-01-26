// cfs-image-resize
// MIT License ben@latenightsketches.com

var PREFIX = 'numtel:cfs-image-resize - ';
var ASSET_DIR = 'assets/packages/local-test_numtel_cfs-image-resize/';

var MBE = Meteor.bindEnvironment;
var fs = Npm.require('fs');
var path = Npm.require('path');

// Helper function
function assetPath(file) { return path.join(ASSET_DIR, file) }

// Configure test cases
var MATRIX = {
  png_resize: {
    originalMime: 'image/png',
    paths: function(options) {
      var fileName = 'w' + options.width + '-h' + options.height;
      return {
        file: fileName,
        input: assetPath('test/spectrum.png'),
        output: assetPath('test/spectrum-' + fileName + '.out.png'),
        expectation: assetPath('test/spectrum-' + fileName + '.png')
      }
    },
    cases: [
      { width: 100, height: 100 },
      { width: 200, height: 200 },
      { width: 300, height: 500 }
    ]
  },
  png_to_jpeg: {
    originalMime: 'image/png',
    paths: function(options) {
      var fileName = 'w' + options.width + '-h' + options.height;
      return {
        file: fileName,
        input: assetPath('test/spectrum.png'),
        output: assetPath('test/spectrum-' + fileName + '.out.jpg'),
        expectation: assetPath('test/spectrum-' + fileName + '.jpg')
      }
    },
    cases: [
      { width: 100, height: 100, format: 'image/jpeg', quality: 75 },
      { width: 200, height: 200, format: 'image/jpeg', quality: 75 },
      { width: 300, height: 500, format: 'image/jpeg', quality: 75 }
    ]
  },
  jpeg_resize: {
    originalMime: 'image/jpeg',
    paths: function(options) {
      var fileName =
        'w' + options.width + '-h' + options.height + '-q' + options.quality;
      return {
        file: fileName,
        input: assetPath('test/zebra.jpg'),
        output: assetPath('test/zebra-' + fileName + '.out.jpg'),
        expectation: assetPath('test/zebra-' + fileName + '.jpg')
      }
    },
    cases: [
      { width: 100, height: 100, quality: 50 },
      { width: 100, height: 100, quality: 100 },
      { width: 300, height: 500, quality: 75 }
    ]
  }
}

Object.keys(MATRIX).forEach(function(testName) {
  var testSettings = MATRIX[testName];
  testSettings.cases.forEach(function(options) {
    var paths = testSettings.paths.call(testSettings, options);
    Tinytest.addAsync(PREFIX + testName + ' ' + paths.file,
      function (test, done) {
        var readStream = fs.createReadStream(paths.input);
        var writeStream = fs.createWriteStream(paths.output);
        var resizer = resizeImageStream(options);

        writeStream.on('finish', MBE(function() {
          outputContents = fs.readFileSync(paths.output);
          expectationContents = fs.readFileSync(paths.expectation);
          test.equal(
            outputContents.toString('base64'),
            expectationContents.toString('base64')
          );
          done();
        }));
        
        resizer(
          { original: { type: testSettings.originalMime } },
          readStream,
          writeStream
        );
      }
    );
  });
});
