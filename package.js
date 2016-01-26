Package.describe({
  name: 'numtel:cfs-image-resize',
  version: '0.0.3',
  summary: 'Resize images in CollectionFS using Jimp',
  git: 'https://github.com/numtel/meteor-cfs-image-resize.git',
  documentation: 'README.md'
});

Npm.depends({
  'jimp': '0.2.21',
  'pkgdir': '0.0.2'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.use([
    'underscore',
    'random'
  ], 'server');
  api.addFiles('client.js', 'client');
  api.addFiles('server.js', 'server');
  api.addFiles('worker.js', 'server', { isAsset: true });
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
    'test/spectrum-w100-h100.jpg',
    'test/spectrum-w200-h200.jpg',
    'test/spectrum-w300-h500.jpg',
    'test/spectrum-w100-h100.png',
    'test/spectrum-w200-h200.png',
    'test/spectrum-w300-h500.png'
  ], 'server', { isAsset: true });
});
