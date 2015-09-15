// cfs-image-resize
// MIT License ben@latenightsketches.com

var Jimp = Npm.require('jimp');

// TODO: perform Jimp in background process!

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
      var format = options.format || fileObj.original.type;
      var input = readStream.read();

      new Jimp(input, function(error, image) {
        if(error) throw error;

        // Crop image to same ratio as output
        var ratio  = Math.min(
          image.bitmap.width / options.width,
          image.bitmap.height / options.height);
        var offsetX = (image.bitmap.width - (options.width * ratio)) / 2;
        var offsetY = (image.bitmap.height - (options.height * ratio)) / 2;  
        image.crop(offsetX, offsetY,
          image.bitmap.width - (offsetX * 2),
          image.bitmap.height - (offsetY * 2)
        );
        image.resize(options.width, options.height);
        if(format === 'image/jpeg' && typeof options.quality === 'number') {
          image.quality(options.quality);
        }

        image.getBuffer(format, function(error, output) {
          if(error) throw error;
          writeStream.end(output);
        });
      });
    }));
  }
}
