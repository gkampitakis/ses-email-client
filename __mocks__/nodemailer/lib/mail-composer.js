class MailComposer {
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

MailComposer.ConstructorSpy = jest.fn();
MailComposer.BuildError = false;

module.exports = MailComposer;
