Package.describe({
  name: 'numtel:cfs-image-resize',
  version: '0.0.1',
  summary: 'Resize images in CollectionFS using PhantomJS',
  git: 'https://github.com/numtel/meteor-cfs-image-resize.git',
  documentation: 'README.md'
});

Npm.depends({
  'data-uri-to-buffer': '0.0.4'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.use('underscore', 'server');
  api.use('numtel:phantomjs-persistent-server@0.0.11');
  api.addFiles('client.js', 'client');
  api.addFiles('server.js', 'server');
  api.export('resizeImageStream');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('numtel:cfs-image-resize');
  api.addFiles('test/index.js', 'server');
  api.addFiles([
    'test/zebra.jpg',
    'test/zebra-w100-h100-q50.jpg',
    'test/zebra-w100-h100-q100.jpg',
    'test/zebra-w300-h500-q75.jpg',
    'test/spectrum.png',
    'test/spectrum-w100-h100.png',
    'test/spectrum-w200-h200.png',
    'test/spectrum-w300-h500.png'
  ], 'server', { isAsset: true });
});
