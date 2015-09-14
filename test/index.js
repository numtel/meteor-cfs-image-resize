// cfs-image-resize
// MIT License ben@latenightsketches.com

var PNG_OPTS = [
  { width: 100, height: 100 },
  { width: 200, height: 200 },
  { width: 300, height: 500 }
];
var JPEG_OPTS = [
  { width: 100, height: 100, quality: 0.5 },
  { width: 100, height: 100, quality: 1 },
  { width: 300, height: 500, quality: 0.75 }
];
// Number of requests to perform simultaneously for "multi" test
var MULTI_COUNT = 10;

var PREFIX = 'numtel:cfs-image-resize - ';
var ASSET_DIR = 'assets/packages/local-test_numtel_cfs-image-resize/';
var READ_STREAM_OPTS = {
  highWaterMark: 10 * 1024 * 1024 // 10MB chunk size, larger than input file
}

var MBE = Meteor.bindEnvironment;
var fs = Npm.require('fs');
var path = Npm.require('path');

var closeAndExit = function() {
  // Exit PhantomJS server process
  resizeImageStream.phantomProcess.kill();
  process.exit();
};

// Close PhantomJS on hot code push
process.on('SIGTERM', closeAndExit);
// Close PhantomJS on exit (ctrl + c)
process.on('SIGINT', closeAndExit);

// Helper function
function assetPath(file) { return path.join(ASSET_DIR, file) }

// Test various PNG sizes
PNG_OPTS.forEach(function(options) {
  var fileName = 'w' + options.width + '-h' + options.height;
  var inputFile = assetPath('test/spectrum.png');
  var outputFile = assetPath('test/spectrum-' + fileName + '.out.png');
  var expectationFile = assetPath('test/spectrum-' + fileName + '.png');

  Tinytest.addAsync(PREFIX + 'PNG ' + fileName, function (test, done) {
    var readStream = fs.createReadStream(inputFile, READ_STREAM_OPTS);
    var writeStream = fs.createWriteStream(outputFile);
    var resizer = resizeImageStream(options);

    writeStream.on('finish', MBE(function() {
      outputContents = fs.readFileSync(outputFile);
      expectationContents = fs.readFileSync(expectationFile);
      test.equal(
        outputContents.toString('base64'),
        expectationContents.toString('base64')
      );
      done();
    }));
    
    resizer({ original: { type: 'image/png' }}, readStream, writeStream);
  });

});

// Test various JPEG qualities and centering with large (5.4mb) input image
JPEG_OPTS.forEach(function(options) {
  var fileName =
    'w' + options.width + '-h' + options.height + '-q' + (options.quality * 100);
  var inputFile = assetPath('test/zebra.jpg');
  var outputFile = assetPath('test/zebra-' + fileName + '.out.jpg');
  var expectationFile = assetPath('test/zebra-' + fileName + '.jpg');

  Tinytest.addAsync(PREFIX + 'JPEG ' + fileName, function (test, done) {
    var readStream = fs.createReadStream(inputFile, READ_STREAM_OPTS);
    var writeStream = fs.createWriteStream(outputFile);
    var resizer = resizeImageStream(options);

    writeStream.on('finish', MBE(function() {
      outputContents = fs.readFileSync(outputFile);
      expectationContents = fs.readFileSync(expectationFile);
      test.equal(
        outputContents.toString('base64'),
        expectationContents.toString('base64')
      );
      done();
    }));
    
    resizer({ original: { type: 'image/jpeg' }}, readStream, writeStream);
  });

});

// Test converting JPEG under load of multiple instantaneous requests
JPEG_OPTS.forEach(function(options) {
  var fileName =
    'w' + options.width + '-h' + options.height + '-q' + (options.quality * 100);
  var inputFile = assetPath('test/zebra.jpg');
  var expectationFile = assetPath('test/zebra-' + fileName + '.jpg');

  Tinytest.addAsync(PREFIX + 'JPEG x' + MULTI_COUNT + ' ' + fileName,
    function (test, done) {
      var conversionsCompleted = 0;

      _.range(MULTI_COUNT).forEach(function(i) {
        var outputFile =
          assetPath('test/zebra-' + fileName + '.out.' + i + '.jpg');
        var readStream = fs.createReadStream(inputFile, READ_STREAM_OPTS);
        var writeStream = fs.createWriteStream(outputFile);
        var resizer = resizeImageStream(options);

        writeStream.on('finish', MBE(function() {
          outputContents = fs.readFileSync(outputFile);
          expectationContents = fs.readFileSync(expectationFile);
          test.equal(
            outputContents.toString('base64'),
            expectationContents.toString('base64')
          );
          conversionsCompleted++;
          if(conversionsCompleted === MULTI_COUNT) done();
        }));
        
        resizer({ original: { type: 'image/jpeg' }}, readStream, writeStream);
      });
    }
  );

});
