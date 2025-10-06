const express = require('express');
const router = express.Router();
const User = require('./User');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const user = new User({ name, email, phone, password });
    await user.save();
    res.send({ message: 'Inscription réussie' });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(404).send('Utilisateur non trouvé');
  const isMatch = await user.comparePassword(password);
  if(!isMatch) return res.status(400).send('Mot de passe incorrect');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.send({ token, user });
});

module.exports = router;
