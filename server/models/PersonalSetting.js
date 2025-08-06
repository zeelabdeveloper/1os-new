const mongoose = require("mongoose");

const PersonalSettingSchema = new mongoose.Schema(
  {
    canViewAllApplication: { type: Boolean, default: false },
     
  },
  { timestamps: true }
);

const PersonalSetting = mongoose.model(
  "PersonalSetting",
  PersonalSettingSchema
);
module.exports = PersonalSetting;
