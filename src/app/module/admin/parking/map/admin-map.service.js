const Parking = require('../../../../models/parking.model');
const Floor = require('../../../../models/floor.model');
const Zone = require('../../../../models/zone.model');
const GroupSlot = require('../../../../models/groupSlot.model');
const Slot = require('../../../../models/slot.model');
const Entrance = require('../../../../models/entrances.model');
const Exit = require('../../../../models/exit.model');
const Lane = require('../../../../models/lane.model');
const SlotStandalone = require('../../../../models/standaloneSlot.model');

const STATUS_MAP = {
  0: 'Đang chỉnh sửa',
  1: 'Hoạt động',
  2: 'Ngưng hoạt động',
};

exports.getListMap = async (status, keyword) => {
  const filter = {};

  // filter theo status
  if (status !== undefined && status !== null && status !== '') {
    filter.status = Number(status);
  }

  // search theo name + location
  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i');
    filter.$or = [{ name: regex }, { location: regex }];
  }

  const parkings = await Parking.find(filter)
    .select('code name location status statusName totalFloors')
    .lean();

  const result = [];

  for (const parking of parkings) {
    // ===== FLOOR =====
    const floors = await Floor.find({ parkingCode: parking._id }).lean();

    for (const floor of floors) {
      // ===== ENTRANCE / EXIT / LANE / SLOT STANDALONE =====
      const [entrances, exits, lanes, slotStandalone] = await Promise.all([
        Entrance.find({ floorCode: floor._id }).lean(),
        Exit.find({ floorCode: floor._id }).lean(),
        Lane.find({ floorCode: floor._id }).lean(),
        SlotStandalone.find({ floorCode: floor._id }).lean(),
      ]);

      // ===== ZONE =====
      const zones = await Zone.find({ floorCode: floor._id }).lean();

      for (const zone of zones) {
        // ===== GROUP SLOT =====
        const groups = await GroupSlot.find({ zoneCode: zone._id }).lean();

        for (const group of groups) {
          // ===== SLOT =====
          const slots = await Slot.find({ groupSlotCode: group._id }).lean();
          group.slots = slots;
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

exports.updateMap = async (payload) => {
  const { code, name, location, status, totalFloors, floors = [] } = payload;

  if (!name || !location) {
    throw new Error('Thiếu thông tin bãi xe');
  }

  // ======================
  // PARKING
  // ======================
  let parking = await Parking.findOne({ code });

  if (!parking) {
    const count = await Parking.countDocuments();
    const newCode = `PK${String(count + 1).padStart(3, '0')}`;

    parking = await Parking.create({
      code: newCode,
      name,
      location,
      status,
      statusName: STATUS_MAP[status],
      totalFloors,
    });
  } else {
    parking.name = name;
    parking.location = location;
    parking.totalFloors = totalFloors;

    if (status !== undefined) {
      parking.status = status;
      parking.statusName = STATUS_MAP[status];
    }

    await parking.save();
  }

  // ======================
  // FLOORS
  // ======================
  for (const f of floors) {
    let floor = await Floor.findOne({ code: f.code });

    if (!floor) {
      floor = await Floor.create({
        code: f.code,
        nameFloor: f.nameFloor,
        level: f.level,
        status: f.status,
        statusName: STATUS_MAP[f.status],
        boundary: f.boundary,
        parkingCode: parking._id,
      });
    } else {
      floor.nameFloor = f.nameFloor;
      floor.level = f.level;
      floor.status = f.status;
      floor.statusName = STATUS_MAP[f.status];
      floor.boundary = f.boundary;
      await floor.save();
    }

    // ======================
    // ENTRANCE
    // ======================
    for (const e of f.entrances || []) {
      let entrance = await Entrance.findOne({ code: e.code });

      if (!entrance) {
        await Entrance.create({
          ...e,
          floorCode: floor._id,
          statusName: STATUS_MAP[e.status],
        });
      } else {
        Object.assign(entrance, e);
        entrance.statusName = STATUS_MAP[e.status];
        await entrance.save();
      }
    }

    // ======================
    // EXIT
    // ======================
    for (const x of f.exits || []) {
      let exit = await Exit.findOne({ code: x.code });

      if (!exit) {
        await Exit.create({
          ...x,
          floorCode: floor._id,
          statusName: STATUS_MAP[x.status],
        });
      } else {
        Object.assign(exit, x);
        exit.statusName = STATUS_MAP[x.status];
        await exit.save();
      }
    }

    // ======================
    // LANE
    // ======================
    for (const l of f.lanes || []) {
      let lane = await Lane.findOne({ code: l.code });

      if (!lane) {
        await Lane.create({
          ...l,
          floorCode: floor._id,
          statusName: STATUS_MAP[l.status],
        });
      } else {
        Object.assign(lane, l);
        lane.statusName = STATUS_MAP[l.status];
        await lane.save();
      }
    }

    // ======================
    // SLOT STANDALONE
    // ======================
    for (const ss of f.slotStandalone || []) {
      let slotStandalone = await SlotStandalone.findOne({ code: ss.code });

      if (!slotStandalone) {
        await SlotStandalone.create({
          ...ss,
          floorCode: floor._id,
          statusName: STATUS_MAP[ss.status],
        });
      } else {
        Object.assign(slotStandalone, ss);
        slotStandalone.statusName = STATUS_MAP[ss.status];
        await slotStandalone.save();
      }
    }

    // ======================
    // ZONES
    // ======================
    for (const z of f.zones || []) {
      let zone = await Zone.findOne({ code: z.code });

      if (!zone) {
        zone = await Zone.create({
          ...z,
          floorCode: floor._id,
          statusName: STATUS_MAP[z.status],
        });
      } else {
        Object.assign(zone, z);
        zone.statusName = STATUS_MAP[z.status];
        await zone.save();
      }

      // ======================
      // GROUP SLOT
      // ======================
      for (const g of z.groupSlots || []) {
        let group = await GroupSlot.findOne({ code: g.code });

        if (!group) {
          group = await GroupSlot.create({
            ...g,
            zoneCode: zone._id,
            statusName: STATUS_MAP[g.status],
          });
        } else {
          Object.assign(group, g);
          group.statusName = STATUS_MAP[g.status];
          await group.save();
        }

        // ======================
        // SLOT
        // ======================
        for (const s of g.slots || []) {
          let slot = await Slot.findOne({ code: s.code });

          if (!slot) {
            await Slot.create({
              ...s,
              groupSlotCode: group._id,
              statusName: STATUS_MAP[s.status],
            });
          } else {
            Object.assign(slot, s);
            slot.statusName = STATUS_MAP[s.status];
            await slot.save();
          }
        }
      }
    }
  }

  return {
    success: true,
    data: parking,
  };
};

exports.deleteMap = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách bãi xe không hợp lệ');
  }

  // lấy danh sách code
  const codes = items
    .map((i) => i.code)
    .filter((c) => typeof c === 'string' && c.trim() !== '');

  if (!codes.length) {
    throw new Error('Không có mã bãi xe hợp lệ');
  }

  // tìm parking
  const parkings = await Parking.find({ code: { $in: codes } });

  if (!parkings.length) {
    throw new Error('Bãi xe không tồn tại');
  }

  // chỉ cho xoá status = 0
  const invalid = parkings.filter((p) => p.status !== 0);
  if (invalid.length) {
    throw new Error(
      `Chỉ xoá bãi xe ở trạng thái "Đang chỉnh sửa". Không hợp lệ: ${invalid
        .map((p) => p.code)
        .join(', ')}`
    );
  }

  const parkingIds = parkings.map((p) => p._id);

  // =====================
  // FIND FLOORS
  // =====================
  const floors = await Floor.find({ parkingCode: { $in: parkingIds } });
  const floorIds = floors.map((f) => f._id);

  // =====================
  // FIND ZONES
  // =====================
  const zones = await Zone.find({ floorCode: { $in: floorIds } });
  const zoneIds = zones.map((z) => z._id);

  // =====================
  // FIND GROUP SLOTS
  // =====================
  const groups = await GroupSlot.find({ zoneCode: { $in: zoneIds } });
  const groupIds = groups.map((g) => g._id);

  // =====================
  // DELETE CHILD FIRST
  // =====================
  await Slot.deleteMany({ groupSlotCode: { $in: groupIds } });
  await GroupSlot.deleteMany({ _id: { $in: groupIds } });

  await Zone.deleteMany({ _id: { $in: zoneIds } });

  await Entrance.deleteMany({ floorCode: { $in: floorIds } });
  await Exit.deleteMany({ floorCode: { $in: floorIds } });
  await Lane.deleteMany({ floorCode: { $in: floorIds } });
  await SlotStandalone.deleteMany({ floorCode: { $in: floorIds } });

  await Floor.deleteMany({ _id: { $in: floorIds } });
  await Parking.deleteMany({ _id: { $in: parkingIds } });

  return {
    deletedCount: parkings.length,
  };
};
