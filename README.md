# numtel:cfs-image-resize

Resize images in [CollectionFS](https://github.com/CollectionFS/Meteor-CollectionFS) using PhantomJS instead of GraphicsMagick.

## Installation

This package assumes you're using [CollectionFS](https://github.com/CollectionFS/Meteor-CollectionFS).

**This package is still under construction and not yet available on Atmosphere!**

```
meteor add numtel:cfs-image-resize
```

## Usage

A `resizeImageStream` function is exposed when this package is installed. Call this function with options for resizing.

Output images will be in the same format as the input images. Only PNG, JPEG are supported due to the usage of `canvas.toDataURL()`.

JPEG thumbnails are recommended due to the enormous size of generated PNG files. This is a result of the embedded browser and beyond the scope of this project. See the expected PNG output files in the `test` directory.

Images will be centered if the aspect ratio between the input and the output differs.

```javascript
Images = new FS.Collection("images", {
  stores: [
    new FS.Store.GridFS("images"),
    new FS.Store.GridFS("thumbs", {
      beforeWrite: function(fileObj) {
        // We return an object, which will change the
        // filename extension and type for this store only.
        return {
          extension: 'jpeg',
          type: 'image/jpeg'
        };
      },
      transformWrite: resizeImageStream({
        width: 100,
        height: 50,
        format: 'image/jpeg',
        quality: 0.5
      })
    })
  ],
});
```

### Available Options

Option | Description
-------|-------------
`width` | Output width in pixels, required
`height` | Output height in pixels, required
`format` | Format of output image, optional, default same as input, accepts `image/png` or `image/jpeg`
`quality` | Output image quality number 0-1, only used with JPEG images, optional

## Exit PhantomJS on hot code push

This package runs a persistent PhantomJS process in the background to process requestsso that no time is wasted spawning new processes. Because of this, hot code pushes will result in multiple instances of PhantomJS running unless the current instance is explicitly closed on exit. The following code may be placed in your application's server code to perform this action.

```javascript
var closeAndExit = function() {
  // Exit PhantomJS server process
  resizeImageStream.phantomProcess.kill();
  process.exit();
};

// Close PhantomJS on hot code push
process.on('SIGTERM', closeAndExit);
// Close PhantomJS on exit (ctrl + c)
process.on('SIGINT', closeAndExit);
```

## Running Tests

The test suite compares generated JPEG and PNG images against expected outputs. A test case with multiple simultaneous conversion requests is also performed.

```
meteor test-packages ./
```

## License

MIT

