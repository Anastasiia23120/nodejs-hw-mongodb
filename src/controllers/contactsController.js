import * as contactsService from '../services/contacts.js';
import createError from 'http-errors';
import Contact from '../models/contact.js';

const getAllContacts = async (req, res, next) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const skip = (page - 1) * perPage;
  const sortOption = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const filter = {};
  filter.userId = req.user._id;

  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined')
    filter.isFavourite = isFavourite === 'true';

  const totalItems = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / perPage);

  const data = await Contact.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(perPage));

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
  next();
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findOne({
    _id: contactId,
    userId: req.user._id,
  });
  if (!contact) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: 'Successfully found contact!',
    data: contact,
  });
};

const createContact = async (req, res, next) => {
  try {
    const newContact = await contactsService.addContact({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      code: 201,
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const updated = await Contact.findOneAndUpdate(
    { _id: contactId, userId: req.user._id },
    req.body,
    { new: true },
  );
  if (!updated) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updated,
  });
};

const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const deleted = await Contact.findOneAndDelete({
    _id: contactId,
    userId: req.user._id,
  });
  if (!deleted) throw createError(404, 'Contact not found');
  res.status(204).send();
};

export {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
