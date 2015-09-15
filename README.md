# numtel:cfs-image-resize

Resize images for thumbnails in [CollectionFS](https://github.com/CollectionFS/Meteor-CollectionFS) using [`Jimp`](https://github.com/oliver-moran/jimp)

## Installation

This package assumes you're using [CollectionFS](https://github.com/CollectionFS/Meteor-CollectionFS).

**This package is still under construction and not yet available on Atmosphere!**

```
meteor add numtel:cfs-image-resize
```

## Usage

A `resizeImageStream` function is exposed when this package is installed. Call this function with options for resizing.

Only `image/png` and `image/jpeg` file types are supported.

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
        quality: 50
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
`quality` | Output image quality number 0-100, only used with JPEG images, optional

## Running Tests

Use the standard command:

```
meteor test-packages ./
```

## License

MIT

