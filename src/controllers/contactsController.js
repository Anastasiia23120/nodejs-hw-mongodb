import * as contactsService from '../services/contacts.js';
import createError from 'http-errors';

export const getAllContacts = async (req, res) => {
  const contacts = await contactsService.listContacts();
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await contactsService.getContactById(contactId);
  if (!contact) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: 'Successfully found contact!',
    data: contact,
  });
};

export const createContact = async (req, res) => {
  const newContact = await contactsService.addContact(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const updated = await contactsService.updateContact(contactId, req.body);
  if (!updated) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updated,
  });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const deleted = await contactsService.removeContact(contactId);
  if (!deleted) throw createError(404, 'Contact not found');
  res.status(204).send();
};
