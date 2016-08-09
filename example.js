const resolve = require('ufr');

const filename = 'resolve.js';

const paths = [
    '/home/user/',
    'https://example.com/',
    'https://github.com/StefanHamminga/universal-file-resolver.js/raw/master/',
    '/tmp/'
];

resolve(filename, paths).then(match => {
        console.log("Found your file:\n", match);
    }).catch(error => {
        console.log(error);
    });
