const fs = require('fs');
const path = require('path');
const tar = require('tar-fs');
const defaultArgs = require('./args');

module.exports.defaultArgs = defaultArgs;

// see https://github.com/alixaxel/chrome-aws-lambda
module.exports.getExecutablePath = function() {
  return new Promise((resolve, reject) => {
    let input = path.join(__dirname, '..', 'bin');
    let output = '/tmp/instdir/program/soffice';

    if (fs.existsSync(output) === true) {
      for (let file of fs.readdirSync(`/tmp`)) {
        if (file.endsWith('.tmp') === true || file.startsWith('OSL_PIPE')) {
          fs.unlinkSync(`/tmp/${file}`);
        }
      }

      return resolve(output);
    }

    for (let file of fs.readdirSync(input)) {
      if (file.endsWith('.br') === true) {
        input = path.join(input, file);
      }
    }

    const source = fs.createReadStream(input);
    const target = tar.extract('/tmp');

    source.on('error', error => {
      return reject(error);
    });

    target.on('error', error => {
      return reject(error);
    });

    target.on('close', () => {
      fs.chmod(output, '0755', error => {
        if (error) {
          return reject(error);
        }

        return resolve(output);
      });
    });

    source.pipe(require(`${__dirname}/../node_modules/iltorb`).decompressStream()).pipe(target);
  });
};
