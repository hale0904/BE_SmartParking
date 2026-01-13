// const authService = require('./auth.service');

// exports.register = async (req, res) => {
//   try {
//     const { email, password, confirmPassword } = req.body;

//     if (!email || !password || !confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'Passwords do not match'
//       });
//     }

//     const user = await authService.register({ email, password });

//     return res.status(201).json({
//       success: true,
//       message: 'Register successful',
//       userId: user._id
//     });

//   } catch (err) {
//     return res.status(400).json({
//       success: false,
//       message: err.message
//     });
//   }
// };


// exports.showLogin = (req, res) => {
//   res.render('pages/login', {
//     title: 'Login'
//   });
// };

// exports.showRegister = (req, res) => {
//   res.render('pages/register', {
//     title: 'Register'
//   });
// };


