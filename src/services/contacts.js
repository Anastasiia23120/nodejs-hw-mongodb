import Contact from '../models/contact.js';

export const listContacts = async () => {
  return await Contact.find();
};

export const getContactById = async (id) => {
  return await Contact.findById(id);
};

export const addContact = async (data) => {
  const contact = await Contact.create(data);
  return contact;
};

export const updateContact = async (id, data) => {
  const updatedContact = await Contact.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedContact;
};

export const removeContact = async (id) => {
  const result = await Contact.findByIdAndDelete(id);
  return result;
};
