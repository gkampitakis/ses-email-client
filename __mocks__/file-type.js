const FromFileSpy = jest.fn();
const SRC = { result: true };

function fromFile (path) {
  FromFileSpy(path);
  return Promise.resolve(SRC.result ? { mime: 'image/png' } : undefined);
}

module.exports = { fromFile, FromFileSpy, SRC };
