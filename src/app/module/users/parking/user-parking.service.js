const Parking = require('../../../models/parking.model');
const Floor = require('../../../models/floor.model');
const Zone = require('../../../models/zone.model');
const Slot = require('../../../models/slot.model');

exports.getParkingMap = async (parkingCode) => {
  const parking = await Parking.findOne({ code: parkingCode });
  if (!parking) {
    throw new Error('Parking not found');
  }

  // Lấy tầng
  const floors = await Floor.find({ parkingCode: parking._id }).sort({
    level: 1,
  });

  const floorIds = floors.map((f) => f._id);

  // Lấy zone theo floor
  const zones = await Zone.find({
    floorCode: { $in: floorIds },
  });

  const zoneIds = zones.map((z) => z._id);

  // Lấy slot theo zone
  const slots = await Slot.find({
    zoneCode: { $in: zoneIds },
  });

  return {
    code: parking.code,
    name: parking.name,
    location: parking.location,
    status: parking.status,
    statusName: parking.statusName,
    totalFloors: parking.totalFloors,

    floors: floors.map((f) => {
      const floorZones = zones.filter(
        (z) => z.floorCode.toString() === f._id.toString()
      );

      return {
        code: f.code,
        nameFloor: f.nameFloor,
        level: f.level,
        totalZone: f.totalZone,
        entrances: f.entrances,
        exits: f.exits,
        availableSlots: f.availableSlots,
        occupiedSlots: f.occupiedSlots,
        reservedSlots: f.reservedSlots,
        status: f.status,
        statusName: f.statusName,

        zones: floorZones.map((z) => {
          const zoneSlots = slots.filter(
            (s) => s.zoneCode.toString() === z._id.toString()
          );

          return {
            code: z.code,
            nameZone: z.nameZone,
            totalSlots: z.totalSlots,
            status: z.status,
            statusName: z.statusName,
            startPositionX: z.startPositionX,
            startPositionY: z.startPositionY,
            endPositionX: z.endPositionX,
            endPositionY: z.endPositionY,

            slots: zoneSlots.map((s) => ({
              code: s.code,
              nameSlot: s.nameSlot,
              x: s.positionX,
              y: s.positionY,
              status: s.status,
              statusName: s.statusName,
            })),
          };
        }),
      };
    }),
  };
};
