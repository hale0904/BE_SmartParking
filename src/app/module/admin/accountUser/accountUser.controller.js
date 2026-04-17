const accountUserService = require('./accountUser.service');

exports.getListAccountUser = async (req, res) => {
  try {
    const { keyword } = req.body;

    const data = await accountUserService.getListAccountUser(keyword);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
