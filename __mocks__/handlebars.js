class Hbs {
  static CompileSpy = jest.fn();
  static TemplateSpy = jest.fn();

  static compile (file) {
    Hbs.CompileSpy(file);

    return (param) => {
      Hbs.TemplateSpy(param);
      return 'htmlHBS';
    };
  }
}

module.exports = Hbs;