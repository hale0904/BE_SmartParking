const userModel = require('../../../models/user.model');

exports.getListAccountUser = async (keyword) => {
  const filter = {};

  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ code: regex }];
  }

  const accountUser = await userModel
    .find(filter)
    .select('code userName email phone createdAt role');
  return accountUser;
};
