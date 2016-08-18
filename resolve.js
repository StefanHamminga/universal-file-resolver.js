/**
 * Universal file resolver
 *
 * TODO: Add support for url templating in some way (enabling queries and anchor hashes)
 */

const fs            = require('fs');
const path          = require('path');
const urljoin       = require('url-join');
const request       = require('request');

function isUrl(url) {
    return /^['"`\s\t]*https?:\/\//i.test(url);
}

function testFile(f) {
    return new Promise((resolve, reject) => {
        fs.access(f, fs.constants.R_OK, (err) => {
            if (err) {
                reject(new Error(`File '{f}' inaccessible.`));
            } else {
                resolve(f);
            }
        });
    });
}

function testUrl(u) {
    return new Promise((resolve, reject) => {
        request({ url: u, method: 'HEAD', headers: { 'User-Agent': 'request' }},
            (err, res) => {
                if (err) {
                    reject(new Error(`Unable to connect to server for url '${u}'.`));
                } else if (res.statusCode !== 200) {
                    reject(new Error(`File '${u}' not reachable (code ${res.statusCode}).`));
                } else {
                    resolve(u);
                }
            });
    });
}

/**
 * Find the first (lowest index) accessible file in a set of filenames and paths.
 * @param  {string|array} filenames One or more file names to test for each path.
 * @param  {string|array} paths     Mixed list of local and remote path options,
 *                                  in order of preference.
 * @return {Promise}      Promise that resolves to the found valid path details
 *                        or rejects providing a default error message. Return
 *                        object structure:
 *                        { name:     'full valid path/filename',
 *                          path:     'selected input path',
 *                          filename: 'selected filename',
 *                          url:      true|false }
 */
function resolve(filenames, paths) {
    return new Promise((resolve, reject) => {
        if (typeof filenames === 'string') {
            filenames = [ filenames ];
        } else if (!(filenames instanceof Array)) {
            reject(new Error("No filename provided"));
        }
        if (typeof paths === 'string') {
            paths = [ paths ];
        } else if (!(paths instanceof Array)) {
            paths = [ '' ];
        }

        var fl = filenames.length, pl = paths.length;
        var r  = [];
        var rl = fl * pl;
        var rs = 0;

        var unresolved = true;

        function loop(fi, pi) {
            let f = filenames[fi];
            let p = paths[pi];
            let ri = pi * fl + fi; // Our result insertion point (ranking)

            let url = isUrl(p) || (p === '' && isUrl(f));

            if (url) {
                testUrl(urljoin(p, f)).then(test).catch(test);
            } else {
                testFile(path.join(p, f)).then(test).catch(test);
            }

            function test(name) {
                if (unresolved) {
                    r[ri] = (name instanceof Error) ? false : { name: name, path: p, filename: f, url: url };
                    let i = rs;
                    while (i < rl) {
                        if (r[i] === undefined) { // We need to try again when the next result is in.
                            rs = i; // Negative results up to here, start here next time
                            break;
                        } else if (r[i]) {
                            unresolved = false; // Call resolve exactly once (if possible)
                            resolve(r[i]);
                            return;
                        }
                        i++;
                    }
                    if (i === rl) {
                        reject(new Error(`Unable to resolve '${filenames.join(', ')}' in '${paths.join(', ')}'`));
                    }
                }
            }
        }

        // name alternatives > path alternatives. Initiate all searches at once.
        for (let j = 0; j < pl; j++) {
            for (let i = 0; i < fl; i++) {
                process.nextTick(loop, i, j);
            }
        }
    });
}

module.exports = resolve;
