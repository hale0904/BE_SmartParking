require('dotenv').config();
const createApp = require('./server');

const app = createApp();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
