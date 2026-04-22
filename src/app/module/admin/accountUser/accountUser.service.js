const userModel = require('../../../models/user.model');
const vehiclesModel = require('../../../models/vehicles.model');

exports.getListAccountUser = async (keyword) => {
  const filter = {};

  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ code: regex }];
  }

  const users = await userModel
    .find(filter)
    .select('code userName email phone createdAt');

  const result = await Promise.all(
    users.map(async (user) => {
      const vehicles = await vehiclesModel.find({ userId: user._id });

      return {
        ...user.toObject(),
        vehicles,
      };
    })
  );
  return result;
};
