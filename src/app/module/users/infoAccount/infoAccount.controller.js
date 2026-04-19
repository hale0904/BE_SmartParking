const infoAccountservice = require('./infoAccount.service');

exports.getInfoAccount = async (req, res) => {
  try {
    const { code } = req.body;

    const data = await infoAccountservice.getInfoAccount(code);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateInfoAccount = async (req, res) => {
  try {
    const payload = {
      ...req.body,
    };

    const result = await infoAccountservice.updateInfoAccount(payload);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
