function mjml2Html (data) {
  TemplateSpy(data);
  return {
    html: 'htmlMJML'
  };
}

const TemplateSpy = jest.fn();

module.exports = mjml2Html;
module.exports.TemplateSpy = TemplateSpy;
