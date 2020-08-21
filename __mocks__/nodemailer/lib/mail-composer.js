class MailComposer {
  static ConstructorSpy = jest.fn();
  static BuildError = false;

  constructor(param) {
    MailComposer.ConstructorSpy(param);
  }

  compile () {
    return {
      build (callback) {
        callback(MailComposer.BuildError, 'mockMessage');
      }
    };
  }
}

module.exports = MailComposer;
