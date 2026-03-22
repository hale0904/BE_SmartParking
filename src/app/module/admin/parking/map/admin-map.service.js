const Parking = require('../../../../models/parking.model');
const Floor = require('../../../../models/floor.model');
const Zone = require('../../../../models/zone.model');
const GroupSlot = require('../../../../models/groupSlot.model');
const Slot = require('../../../../models/slot.model');
const Entrance = require('../../../../models/entrances.model');
const Exit = require('../../../../models/exit.model');
const Lane = require('../../../../models/lane.model');
const SlotStandalone = require('../../../../models/standaloneSlot.model');
const laneNodeModel = require('../../../../models/laneNode.model');

const STATUS_MAP = {
  0: 'Đang chỉnh sửa',
  1: 'Hoạt động',
  2: 'Ngưng hoạt động',
};

const STATUS_SLOT = {
  0: 'Vị trí trống',
  1: 'Vị trí có xe',
  2: 'Vị trí đặt trước',
  3: 'Vị trí lỗi/ Vị trí đang chỉnh sửa',
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
      const [entrances, exits, lanes, slotStandalone, laneNodes] =
        await Promise.all([
          Entrance.find({ floorCode: floor._id }).lean(),
          Exit.find({ floorCode: floor._id }).lean(),
          Lane.find({ floorCode: floor._id }).lean(),
          SlotStandalone.find({ floorCode: floor._id }).lean(),
          laneNodeModel.find({ floorCode: floor._id }).lean(),
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
      floor.laneNodes = laneNodes;
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
  // FLOORS (2 chiều)
  // ======================
  const dbFloors = await Floor.find({ parkingCode: parking._id });
  const feFloorCodes = floors.map((f) => f.code);

  // Xoá floor không còn trong FE (phải xoá con trước)
  for (const dbFloor of dbFloors) {
    if (!feFloorCodes.includes(dbFloor.code)) {
      await Slot.deleteMany({ floorCode: dbFloor._id });
      await GroupSlot.deleteMany({ floorCode: dbFloor._id });
      await Zone.deleteMany({ floorCode: dbFloor._id });
      await SlotStandalone.deleteMany({ floorCode: dbFloor._id });
      await Lane.deleteMany({ floorCode: dbFloor._id });
      await Exit.deleteMany({ floorCode: dbFloor._id });
      await Entrance.deleteMany({ floorCode: dbFloor._id });
      await Floor.deleteOne({ _id: dbFloor._id });
    }
  }

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
      Object.assign(floor, {
        nameFloor: f.nameFloor,
        level: f.level,
        status: f.status,
        statusName: STATUS_MAP[f.status],
        boundary: f.boundary,
      });
      await floor.save();
    }

    // ======================
    // ENTRANCE (2 chiều)
    // ======================
    const dbEntrances = await Entrance.find({ floorCode: floor._id });
    const feEntranceCodes = (f.entrances || []).map((e) => e.code);

    for (const eDb of dbEntrances) {
      if (!feEntranceCodes.includes(eDb.code)) {
        await Entrance.deleteOne({ _id: eDb._id });
      }
    }

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
    // EXIT (2 chiều)
    // ======================
    const dbExits = await Exit.find({ floorCode: floor._id });
    const feExitCodes = (f.exits || []).map((x) => x.code);

    for (const xDb of dbExits) {
      if (!feExitCodes.includes(xDb.code)) {
        await Exit.deleteOne({ _id: xDb._id });
      }
    }

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
    // LANENODE (2 chiều)
    // ======================
    const dbLaneNodes = await laneNodeModel.find({ floorCode: floor._id });
    const feLaneNodeCodes = (f.laneNodes || []).map((n) => n.code);

    // xoá
    for (const lnDb of dbLaneNodes) {
      if (!feLaneNodeCodes.includes(lnDb.code)) {
        await laneNodeModel.deleteOne({ _id: lnDb._id });
      }
    }

    // create/update
    for (const n of f.laneNodes || []) {
      let laneNode = await laneNodeModel.findOne({ code: n.code });

      if (!laneNode) {
        await laneNodeModel.create({
          ...n,
          floorCode: floor._id,
        });
      } else {
        Object.assign(laneNode, n);
        await laneNode.save();
      }
    }

    // ======================
    // TẠO nodeMap (QUAN TRỌNG)
    // ======================
    const laneNodes = await laneNodeModel.find({ floorCode: floor._id });

    const nodeMap = {};
    for (const n of laneNodes) {
      nodeMap[n.code] = n._id;
    }

    // ======================
    // LANE (2 chiều)
    // ======================
    const dbLanes = await Lane.find({ floorCode: floor._id });
    const feLaneCodes = (f.lanes || []).map((l) => l.code);

    // xoá
    for (const lDb of dbLanes) {
      if (!feLaneCodes.includes(lDb.code)) {
        await Lane.deleteOne({ _id: lDb._id });
      }
    }

    // create/update
    for (const l of f.lanes || []) {
      let lane = await Lane.findOne({
        code: l.code,
        floorCode: floor._id,
      });

      const fromNodeId = nodeMap[l.fromNodeId];
      const toNodeId = nodeMap[l.toNodeId];

      if (!fromNodeId || !toNodeId) {
        throw new Error(
          `Node không tồn tại: ${l.fromNodeId} hoặc ${l.toNodeId}`
        );
      }

      if (!lane) {
        await Lane.create({
          ...l,
          floorCode: floor._id,
          fromNodeId,
          toNodeId,
          statusName: STATUS_MAP[l.status],
        });
      } else {
        Object.assign(lane, {
          ...l,
          fromNodeId,
          toNodeId,
        });
        lane.statusName = STATUS_MAP[l.status];
        await lane.save();
      }
    }

    // ======================
    // SLOT STANDALONE (2 chiều)
    // ======================
    const dbSS = await SlotStandalone.find({ floorCode: floor._id });
    const feSSCodes = (f.slotStandalone || []).map((s) => s.code);

    for (const ssDb of dbSS) {
      if (!feSSCodes.includes(ssDb.code)) {
        await SlotStandalone.deleteOne({ _id: ssDb._id });
      }
    }

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
    // ZONES (2 chiều)
    // ======================
    const dbZones = await Zone.find({ floorCode: floor._id });
    const feZoneCodes = (f.zones || []).map((z) => z.code);

    for (const zDb of dbZones) {
      if (!feZoneCodes.includes(zDb.code)) {
        await Slot.deleteMany({ zoneCode: zDb._id });
        await GroupSlot.deleteMany({ zoneCode: zDb._id });
        await Zone.deleteOne({ _id: zDb._id });
      }
    }

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
      // GROUP SLOT (2 chiều)
      // ======================
      const dbGroups = await GroupSlot.find({ zoneCode: zone._id });
      const feGroupCodes = (z.groupSlots || []).map((g) => g.code);

      for (const gDb of dbGroups) {
        if (!feGroupCodes.includes(gDb.code)) {
          await Slot.deleteMany({ groupSlotCode: gDb._id });
          await GroupSlot.deleteOne({ _id: gDb._id });
        }
      }

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
        // SLOT (2 chiều)
        // ======================
        const dbSlots = await Slot.find({ groupSlotCode: group._id });
        const feSlotCodes = (g.slots || []).map((s) => s.code);

        for (const sDb of dbSlots) {
          if (!feSlotCodes.includes(sDb.code)) {
            await Slot.deleteOne({ _id: sDb._id });
          }
        }

        for (const s of g.slots || []) {
          let slot = await Slot.findOne({ code: s.code });

          if (!slot) {
            await Slot.create({
              ...s,
              groupSlotCode: group._id,
              statusName: STATUS_SLOT[s.status],
            });
          } else {
            Object.assign(slot, s);
            slot.statusName = STATUS_SLOT[s.status];
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
