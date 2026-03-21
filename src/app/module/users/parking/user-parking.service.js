const Parking = require('../../../models/parking.model');
const Floor = require('../../../models/floor.model');
const Zone = require('../../../models/zone.model');
const Slot = require('../../../models/slot.model');
const GroupSlot = require('../../../models/groupSlot.model');
const Entrance = require('../../../models/entrances.model');
const Exit = require('../../../models/exit.model');
const Lane = require('../../../models/lane.model');
const SlotStandalone = require('../../../models/standaloneSlot.model');

const STATUS_SLOT = {
  0: 'Vị trí trống',
  1: 'Vị trí có xe',
  2: 'Vị trí đặt trước',
  3: 'Vị trí lỗi/ Vị trí đang chỉnh sửa',
};

exports.getParkingMap = async (status, expectedArrivalTime) => {
  const filter = {};

  // filter theo status
  if (status !== undefined && status !== null && status !== '') {
    filter.status = Number(status);
  }

  const parkings = await Parking.find(filter)
    .select('code name location status statusName totalFloors')
    .lean();

  const result = [];

  for (const parking of parkings) {
    // ===== FLOOR =====
    const floors = await Floor.find({
      parkingCode: parking._id,
      status: 1,
    }).lean();

    for (const floor of floors) {
      // ===== ENTRANCE / EXIT / LANE / SLOT STANDALONE =====
      const [entrances, exits, lanes, slotStandalone] = await Promise.all([
        Entrance.find({ floorCode: floor._id }).lean(),
        Exit.find({ floorCode: floor._id }).lean(),
        Lane.find({ floorCode: floor._id }).lean(),
        SlotStandalone.find({ floorCode: floor._id }).lean(),
      ]);

      // ===== ZONE =====
      const zones = await Zone.find({ floorCode: floor._id, status: 1 }).lean();

      for (const zone of zones) {
        // ===== GROUP SLOT =====
        const groups = await GroupSlot.find({ zoneCode: zone._id }).lean();

        for (const group of groups) {
          const slots = await Slot.find({ groupSlotCode: group._id }).lean();

          const arrivalInput = new Date(expectedArrivalTime);

          const timeNow = new Date();

          // đầu ngày hôm nay
          const startDay = new Date();
          startDay.setHours(0, 0, 0, 0);

          // cuối ngày hôm nay
          const endDay = new Date();
          endDay.setHours(23, 59, 59, 999);

          // +4h từ thời gian user chọn
          const plus4Hours = new Date(timeNow.getTime() + 4 * 60 * 60 * 1000);

          const validSlots = [];

          for (const slot of slots) {
            // trong hôm nay
            if (arrivalInput >= startDay && arrivalInput <= endDay) {
              // theo thời gian user chọn
              if (arrivalInput <= plus4Hours) {
                // slot trống
                if (slot.status === 0) {
                  validSlots.push(slot);
                }
              }
              if (arrivalInput > plus4Hours) {
                if (slot.status === 1 || slot.status === 0) {
                  validSlots.push(slot);
                }
              }
            }
            if (arrivalInput >= startDay && arrivalInput >= endDay) {
              if (slot.status === 0 || slot.status === 2) {
                validSlots.push(slot);
              }
            }
          }

          if (!expectedArrivalTime) {
            group.slots = slots;
          } else {
            // FIX QUAN TRỌNG
            group.slots = validSlots;
          }
        }

        zone.groupSlots = groups;
      }

      floor.entrances = entrances;
      floor.exits = exits;
      floor.lanes = lanes;
      floor.slotStandalone = slotStandalone;
      floor.zones = zones;
    }

    parking.floors = floors;
    result.push(parking);
  }

  return result;
};
