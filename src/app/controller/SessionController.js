import jwt from 'jsonwebtoken';

import User from '../model/User';
import File from '../model/File';
import auth from '../../config/auth';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne(
      {
        where: { email },
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      },
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does note match' });
    }

    const {
      id, name, avatar, provider,
    } = user;

    return res.json({
      user: {
        id, name, email, provider, avatar,
      },
      token: jwt.sign(
        { id },
        auth.secret,
        { expiresIn: auth.expiresIn },
      ),
    });
  }
}

export default new SessionController();
