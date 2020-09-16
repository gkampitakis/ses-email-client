class fs {
  static readFileSync (...args) {
    fs.ReadFileSyncSpy(...args);
    return args[0];
  }
}

fs.ReadFileSyncSpy = jest.fn();

module.exports = fs;
