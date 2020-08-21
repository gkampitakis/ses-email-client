function mjml2Html (data) {
  MjmlCompileSpy(data);
  return {
    html: 'html'
  };
}

const MjmlCompileSpy = jest.fn();

module.exports = mjml2Html;
module.exports.MjmlCompileSpy = MjmlCompileSpy;
