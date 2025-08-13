import * as contactsService from '../services/contacts.js';
import createError from 'http-errors';
import { uploadImage } from '../services/cloudinary.js';

export const getAllContacts = async (req, res) => {
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
  const filter = { userId: req.user._id };
  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined')
    filter.isFavourite = isFavourite === 'true';
  const { totalItems, data } = await contactsService.getAllContacts(
    filter,
    sortOption,
    skip,
    parseInt(perPage),
  );
  const totalPages = Math.ceil(totalItems / perPage);
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
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await contactsService.getContactById({
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

export const createContact = async (req, res) => {
  if (req.file) {
    const photoUrl = await uploadImage(req.file.path);
    req.body.photo = photoUrl;
  }
  const newContact = await contactsService.addContact({
    ...req.body,
    userId: req.user._id,
  });
  res.status(201).json({ status: 'success', code: 201, data: newContact });
};

export const updateContact = async (req, res) => {
  if (req.file) {
    const photoUrl = await uploadImage(req.file.path);
    req.body.photo = photoUrl;
  }
  const { contactId } = req.params;
  const updated = await contactsService.updateContact(
    { _id: contactId, userId: req.user._id },
    req.body,
  );
  if (!updated) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updated,
  });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const deleted = await contactsService.removeContact({
    _id: contactId,
    userId: req.user._id,
  });
  if (!deleted) throw createError(404, 'Contact not found');
  res.status(204).send();
};
