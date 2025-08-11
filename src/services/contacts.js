import Contact from '../models/contact.js';

export const getAllContacts = async (filter, sortOption, skip, perPage) => {
  const totalItems = await Contact.countDocuments(filter);
  const data = await Contact.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(perPage);

  return { totalItems, data };
};

export const getContactById = async (filter) => {
  return await Contact.findOne(filter);
};

export const addContact = async (data) => {
  return await Contact.create(data);
};

export const updateContact = async (filter, data) => {
  return await Contact.findOneAndUpdate(filter, data, { new: true });
};

export const removeContact = async (filter) => {
  return await Contact.findOneAndDelete(filter);
};
