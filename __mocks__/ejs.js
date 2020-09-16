class Ejs {
  static compile (file) {
    Ejs.CompileSpy(file);

    return (param) => {
      Ejs.TemplateSpy(param);
      return 'htmlEJS';
    };
  }
}

Ejs.CompileSpy = jest.fn();
Ejs.TemplateSpy = jest.fn();

module.exports = Ejs;
