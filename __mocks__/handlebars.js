class Hbs {
  static CompileSpy = jest.fn();
  static TemplateSpy = jest.fn();

  static compile (file) {
    Hbs.CompileSpy(file);

    return (param) => {
      Hbs.TemplateSpy();
      return 'html';
    };
  }
}

module.exports = Hbs;
