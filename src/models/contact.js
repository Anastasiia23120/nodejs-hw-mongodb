import { Schema, model } from 'mongoose';

const contactSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  contactType: {
    type: String,
    enum: ['personal', 'business'],
    default: 'personal',
  },
  isFavourite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
});

const Contact = model('contact', contactSchema);

export default Contact;
