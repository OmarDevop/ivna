const jwt = require('jsonwebtoken')
const User = require('../models/user')
// https://github.com/VitthalS/ivna

const auth = async (req, res, next) => {
  try {
    const token = req.cookies['auth_token'];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth