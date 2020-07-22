const { verify } = require('jsonwebtoken');
// Service to verify if the received auth token is valid
const isAuthRefreshed = (req) => {
  const token = req;
  const { userId } = verify(token, process.env.ACCESS_TOKEN_SECRET);
  return userId;
};

module.exports = {
  isAuthRefreshed,
};
