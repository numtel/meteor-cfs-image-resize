// cfs-image-resize
// MIT License ben@latenightsketches.com

// Launch PhantomJS instance to handle resize requests
var phantomExec = phantomLaunch({ debug: false });

/*
Exported method for generating a CollectionFS transformWrite function
@param  options  object   Object containing paramaters for resize
@option width    integer  Output width in pixels, required
@option height   integer  Output height in pixels, required
@option quality  number   For image formats image/jpeg and image/webp, between 0-1
*/
resizeImageStream = function(options) {
  return function(fileObj, readStream, writeStream) {
    // readStream comes as one chunk
    readStream.on('readable', Meteor.bindEnvironment(function() {
      var input = readStream.read();

      var output = phantomExec(resizeImage, _.extend(options, {
        dataUri: bufferToDataUri(fileObj.original.type, input),
        format: options.format || fileObj.original.type
      }));

      writeStream.end(dataUriToBuffer(output));
    }));
  }
}

resizeImageStream.phantomProcess = phantomExec;

function bufferToDataUri(mimetype, input) {
  return "data:" + mimetype + ';base64,' + input.toString('base64');
}

var dataUriToBuffer = Npm.require('data-uri-to-buffer');

/*
Method for resizing images, to be executed in PhantomJS context
@param  options  object   Object containing paramaters for resize
@option dataUri  string   Input image to be resized, required
@option width    integer  Output width in pixels, required
@option height   integer  Output height in pixels, required
@option format   string   Output image format. Default: image/png
@option quality  number   For image formats image/jpeg and image/webp, between 0-1
@param  callback function Return new data Uri (error, result)
*/
var resizeImage = function(options, callback) {
  var page = require('webpage').create();

  page.content =
    '<html><body>' +
    '<img src="' + options.dataUri + '" />' +
    '<canvas ' +
      'width="' + options.width + '" ' +
      'height="' + options.height + '" ' +
      'data-format="' + (options.format || '') + '" ' +
      'data-quality="' + (options.quality || '') + '" ' +
    '></canvas>' +
    '</body></html>';

  page.onLoadFinished = function(status) {
    var resizedDataUri = page.evaluate(function() {
      var canvas = document.getElementsByTagName('canvas')[0];
      var ctx = canvas.getContext("2d");
      var img = document.getElementsByTagName('img')[0];

      // Draw image in center of canvas
      var ratio  = Math.max(
        canvas.width / img.width,
        canvas.height / img.height);
      var offsetX = (canvas.width - (img.width * ratio)) / 2;
      var offsetY = (canvas.height - (img.height * ratio)) / 2;  
      ctx.drawImage(
        img, 0, 0, img.width, img.height,
        offsetX, offsetY, img.width * ratio, img.height * ratio);

      // Different context than wrapping function, so pass arguments in DOM
      var format = canvas.getAttribute('data-format') || undefined;
      var quality = canvas.getAttribute('data-quality') * 1 || undefined;

      return canvas.toDataURL(format, quality); 
    });

    callback(null, resizedDataUri);
  }
}
