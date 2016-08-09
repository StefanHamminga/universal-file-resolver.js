# Universal File Resolver

JavaScript Promise based library to quickly find the first accessible file in a set of filenames and paths. Resolves both local and http(s) url paths.

## Installation and usage

```bash
npm install --save ufr
```

```js
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

/* Output:
Found your file:
 { name: 'https://github.com/StefanHamminga/universal-file-resolver.js/raw/master/resolve.js',
  path: 'https://github.com/StefanHamminga/universal-file-resolver.js/raw/master/',
  filename: 'resolve.js',
  url: true }
*/
```

## Arguments

### Input

Arg. | Types | Description
---|:---:|:---:|:---
filename | String, Array | Either one filename or an array of filenames to test. Required.
paths | String, Array, undefined | Single path, array of paths or empty.

### Output

```js
// Resolve:

Object {
    name:     String  - 'Merged and resolved path to valid file'
    path:     String  - 'Path, as provided, for successfull resolve'
    filename: String  - 'Lucky filename'
    url:      Boolean - 'Was this resolved as an URL?'
}

// Reject:

Error { ... }
```

## Notes and license

This project is available on [GitHub](https://github.com/StefanHamminga/universal-file-resolver.js) and [npm](https://www.npmjs.com/package/ufr).

The project is licensed as LGPL v3.0 and may be freely used and distributed as such.

Copyright 2016 [Stefan Hamminga](mailto:stefan@prjct.net) - [prjct.net](https://prjct.net)
