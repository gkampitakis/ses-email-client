class Hbs {
  static compile (file) {
    Hbs.CompileSpy(file);

    return (param) => {
      Hbs.TemplateSpy(param);
      return 'htmlHBS';
    };
  }
}

Hbs.CompileSpy = jest.fn();
Hbs.TemplateSpy = jest.fn();

module.exports = Hbs;
