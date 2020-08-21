class fs {
  static ReadFileSyncSpy = jest.fn();

  static readFileSync (file) {
    fs.ReadFileSyncSpy(file);
    return file;
  }
}

module.exports = fs;
