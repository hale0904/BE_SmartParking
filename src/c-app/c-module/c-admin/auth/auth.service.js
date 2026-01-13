// const bcrypt = require('bcrypt');
// const User = require('./auth.model');

// exports.register = async ({ email, password }) => {
//   // check email tồn tại
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     throw new Error('Email already exists');
//   }

//   // hash password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // tạo user
//   const user = await User.create({
//     email,
//     password: hashedPassword
//   });

//   return user;
// };
