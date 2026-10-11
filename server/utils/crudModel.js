const mongoose = require("mongoose");

// Shared list/create/update/remove helpers for the simple admin collections
// (infrastructure, studio projects, notes). `fields` whitelists what the API
// may write; everything else (reminders_sent, timestamps) is server-owned.
module.exports = (Model, { fields, sort = { created_at: -1 } }) => {
  const serialize = (d) => {
    const { _id, __v, reminders_sent, ...rest } = d;
    return { id: _id.toString(), ...rest };
  };

  const pick = (input) => {
    const out = {};
    fields.forEach((k) => {
      if (input[k] !== undefined) out[k] = input[k];
    });
    return out;
  };

  return {
    model: Model,
    serialize,

    all: async (query = {}) => {
      const docs = await Model.find(query).sort(sort).lean();
      return docs.map(serialize);
    },

    create: async (input) => {
      const doc = await Model.create(pick(input));
      return serialize(doc.toObject());
    },

    update: async (id, input) => {
      if (!mongoose.isValidObjectId(id)) return null;
      const doc = await Model.findByIdAndUpdate(
        id,
        { ...pick(input), updated_at: new Date() },
        { new: true, runValidators: true }
      ).lean();
      return doc ? serialize(doc) : null;
    },

    remove: async (id) => {
      if (!mongoose.isValidObjectId(id)) return;
      await Model.findByIdAndDelete(id);
    },
  };
};
