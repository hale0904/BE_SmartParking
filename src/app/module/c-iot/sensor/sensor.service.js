const express = require('express');
const router = express.Router();
const Slot = require('../../../models/slot.model');

exports.updateSensor = async (payload) => {
  console.log('REQ:', req.body);

  const { nameSlot, sensorId, sensorStatus } = req.body;

  const slot = await Slot.findOneAndUpdate(
    { nameSlot: nameSlot },
    {
      $set: {
        sensorId: sensorId,
        sensorStatus: sensorStatus,
      },
    },
    { new: true }
  );
};
