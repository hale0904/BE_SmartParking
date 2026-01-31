const Parking = require('../../../models/parking.model');
const Floor = require('../../../models/floor.model');
const Slot = require('../../../models/slot.model');

exports.getParkingMap = async (parkingCode) => {
  const parking = await Parking.findOne({ code: parkingCode });
  if (!parking) {
    throw new Error('Parking not found');
  }

  const floors = await Floor.find({ parkingCode: parking._id }).sort({
    level: 1,
  });
  const floorIds = floors.map((f) => f._id);

  const slots = await Slot.find({
    floorCode: { $in: floorIds },
  });

  return {
    code: parking.code,
    name: parking.name,
    location: parking.location,
    status: parking.status,
    statusName: parking.statusName,
    totalFloors: parking.totalFloors,
    floors: floors.map((f) => ({
      code: f.code,
      name: f.name,
      level: f.level,
      totalSlots: f.totalSlots,
      entrances: f.entrances,
      exits: f.exits,
      availableSlots: f.availableSlots,
      occupiedSlots: f.occupiedSlots,
      reservedSlots: f.reservedSlots,
      status: f.status,
      statusName: f.statusName,
      slots: slots
        .filter((s) => s.floorCode.toString() === f._id.toString())
        .map((s) => ({
          code: s.code,
          nameSlot: s.nameSlot,
          x: s.positionX,
          y: s.positionY,
          status: s.status,
          statusName: s.statusName,
          zone: s.zone,
        })),
    })),
  };
};
