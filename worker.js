var path = require('path');
var pkgdir = process.argv[2];
var options = JSON.parse(process.argv[3]);
var Jimp = require(path.join(pkgdir, 'jimp'));

process.on('message', function(input) {
  new Jimp(new Buffer(input), function(error, image) {
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
    if(options.format === 'image/jpeg' && typeof options.quality === 'number') {
      image.quality(options.quality);
    }

    image.getBuffer(options.format, function(error, output) {
      if(error) throw error;
      process.send(output);
    });
  });
});
