const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { User } = require('../models');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const issueTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, role: user.role, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const existing = await User.findOne({ where: { email: value.email } });
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    const user = await User.create(value);
    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: accessToken });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findOne({ where: { email: value.email } });
    if (!user) return res.status(401).json({ message: 'Identifiants invalides' });

    const ok = await user.comparePassword(value.password);
    if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });

    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: accessToken });
  } catch (err) { next(err); }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id','name','email','role'] });
    res.json(user);
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: 'Refresh token manquant' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') return res.status(401).json({ message: 'Token invalide' });
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });
    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
    res.json({ token: accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh échoué' });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('refresh_token');
  res.json({ message: 'Déconnecté' });
};
