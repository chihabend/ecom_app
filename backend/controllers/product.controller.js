const Joi = require('joi');
const { Product, Sequelize } = require('../models');

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  price: Joi.number().positive().required(),
  imageUrl: Joi.string().allow(''),
  stock: Joi.number().integer().min(0).default(0),
  images: Joi.array().items(Joi.string()).default([]),
  isNew: Joi.boolean().default(false),
  isPromo: Joi.boolean().default(false)
});

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 100);
    const offset = (page - 1) * limit;
    const q = (req.query.q || '').trim();

    const where = q ? {
      [Sequelize.Op.or]: [
        { name: { [Sequelize.Op.iLike]: `%${q}%` } },
        { description: { [Sequelize.Op.iLike]: `%${q}%` } }
      ]
    } : {};

    const { rows, count } = await Product.findAndCountAll({ where, limit, offset, order: [['id', 'DESC']] });
    res.json({ items: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(product);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const p = await Product.create(value);
    res.status(201).json(p);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updateSchema = Joi.object({
      name: Joi.string(),
      description: Joi.string().allow(''),
      price: Joi.number().positive(),
      imageUrl: Joi.string().allow(''),
      stock: Joi.number().integer().min(0),
      images: Joi.array().items(Joi.string()),
      isNew: Joi.boolean(),
      isPromo: Joi.boolean()
    }).min(1);
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'Produit non trouvé' });
    await p.update(value);
    res.json(p);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'Produit non trouvé' });
    await p.destroy();
    res.json({ message: 'Supprimé' });
  } catch (err) { next(err); }
};
