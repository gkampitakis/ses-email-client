class fs {
  static ReadFileSyncSpy = jest.fn();

  static readFileSync (...args) {
    fs.ReadFileSyncSpy(...args);
    return args[0];
  }
}

module.exports = fs;
