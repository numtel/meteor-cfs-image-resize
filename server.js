// cfs-image-resize
// MIT License ben@latenightsketches.com

// Prepare background worker process
var pkgdir = Npm.require('pkgdir');
var fork = Npm.require('child_process').fork;
var path = Npm.require('path');
var fs = Npm.require('fs');

var workerCode = Assets.getText('worker.js');
var workerFile =
  path.join(process.cwd(), 'imageResizeWorker.' + Random.id() + '.js');
fs.writeFileSync(workerFile, workerCode);

/*
Exported method for generating a CollectionFS transformWrite function
@param  options  object   Object containing paramaters for resize
@option width    integer  Output width in pixels, required
@option height   integer  Output height in pixels, required
@option format   string   Output image format. Default: image/png
@option quality  number   For image format image/jpeg, between 0-100
*/
resizeImageStream = function(options) {
  return function(fileObj, readStream, writeStream) {
    // readStream comes as one chunk
    readStream.on('readable', Meteor.bindEnvironment(function() {
      var input = readStream.read();

      options.format = options.format || fileObj.original.type;

      var worker = fork(workerFile, [ pkgdir, JSON.stringify(options) ]);

      worker.send(input);

      worker.on('message', function(output) {
        writeStream.end(new Buffer(output));
        worker.kill();
      });
    }));
  }
}
