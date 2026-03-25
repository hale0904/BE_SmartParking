const Parking = require('../../../models/parking.model');
const Floor = require('../../../models/floor.model');
const Zone = require('../../../models/zone.model');
const Slot = require('../../../models/slot.model');
const GroupSlot = require('../../../models/groupSlot.model');
const Entrance = require('../../../models/entrances.model');
const Exit = require('../../../models/exit.model');
const Lane = require('../../../models/lane.model');
const SlotStandalone = require('../../../models/standaloneSlot.model');
const bookingModel = require('../../../models/booking.model');

const STATUS_SLOT = {
  0: 'Vị trí trống',
  1: 'Vị trí có xe',
  2: 'Vị trí đặt trước',
  3: 'Vị trí lỗi/ Vị trí đang chỉnh sửa',
};

exports.getParkingMap = async (
  status,
  expectedArrivalTime,
  expectedLeaveTime
) => {
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

          const arrivalInput = expectedArrivalTime
            ? new Date(expectedArrivalTime)
            : null;

          const leaveInput = expectedLeaveTime
            ? new Date(expectedLeaveTime)
            : null;

          const validSlots = [];
          // đầu ngày hôm nay
          // const startDay = new Date();
          // startDay.setHours(0, 0, 0, 0);

          // cuối ngày hôm nay
          // const endDay = new Date();
          // endDay.setHours(23, 59, 59, 999);

          // +4h từ thời gian user chọn
          // const plus4Hours = new Date(timeNow.getTime() + 4 * 60 * 60 * 1000);

          for (const slot of slots) {
            // const timeNow = new Date();

            // const isToday =
            //   arrivalInput.toDateString() === timeNow.toDateString();

            const bookings = await bookingModel
              .find({ slotId: slot._id })
              .lean();

            // =========================
            // CASE 1: KHÔNG truyền thời gian
            // =========================
            const now = new Date();

            // if (
            //   slot.status === 0 ||
            //   slot.status === 2 ||
            //   slot.status === 3 ||
            //   slot.status === 1
            // ) {
            if (!arrivalInput && !leaveInput) {
              const activeBooking = bookings.find(
                (b) =>
                  b.slotId.toString() === slot._id.toString() &&
                  b.expectedArrivalTime <= now &&
                  b.expectedLeaveTime >= now
              );

              if (activeBooking) {
                validSlots.push({
                  ...slot,
                  status: 2,
                  statusName: STATUS_SLOT[2],
                });
              }

              if (!activeBooking && slot.status === 2) {
                validSlots.push({
                  ...slot,
                  status: 0,
                  statusName: STATUS_SLOT[0],
                });
              }

              if (!activeBooking) {
                validSlots.push({
                  ...slot,
                });
              }

              continue;
            }
            // }

            // =========================
            // CASE 2: CÓ chọn thời gian
            // =========================
            if (arrivalInput && leaveInput) {
              const activeBooking = bookings.find(
                (b) =>
                  b.slotId.toString() === slot._id.toString() &&
                  b.expectedArrivalTime > arrivalInput &&
                  b.expectedLeaveTime < leaveInput
              );

              if (activeBooking) {
                validSlots.push({
                  ...slot,
                  status: 2,
                  statusName: STATUS_SLOT[2],
                });
              }

              if (!activeBooking && slot.status !== 3) {
                validSlots.push({
                  ...slot,
                  status: 0,
                  statusName: STATUS_SLOT[0],
                });
              }

              continue;
            }
          }

          // if (!expectedArrivalTime) {
          //   group.slots = bookings;
          // } else {
          // FIX QUAN TRỌNG
          group.slots = validSlots;
          // }
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
