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
const sensorModel = require('../../../../models/sensor.model');

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

const getCodes = (items = []) => items.map((item) => item.code).filter(Boolean);

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
    Object.assign(parking, {
      name,
      location,
      totalFloors,
    });

    if (status !== undefined) {
      parking.status = status;
      parking.statusName = STATUS_MAP[status];
    }

    await parking.save();
  }

  // ======================
  // FLOOR
  // ======================
  for (const f of floors) {
    let floor = await Floor.findOne({
      code: f.code,
      parkingCode: parking._id,
    });

    if (!floor) {
      floor = await Floor.create({
        ...f,
        parkingCode: parking._id,
        statusName: STATUS_MAP[f.status],
      });
    } else {
      Object.assign(floor, {
        ...f,
        parkingCode: parking._id,
      });

      floor.statusName = STATUS_MAP[f.status];
      await floor.save();
    }

    // ======================
    // ENTRANCE
    // ======================
    const dbEntrances = await Entrance.find({ floorCode: floor._id });
    const feEntranceCodes = getCodes(f.entrances);

    for (const eDb of dbEntrances) {
      if (!feEntranceCodes.includes(eDb.code)) {
        await Entrance.deleteOne({ _id: eDb._id });
      }
    }

    for (const e of f.entrances || []) {
      let entrance = await Entrance.findOne({
        code: e.code,
        floorCode: floor._id,
      });

      if (!entrance) {
        await Entrance.create({
          ...e,
          floorCode: floor._id,
          statusName: STATUS_MAP[e.status],
        });
      } else {
        Object.assign(entrance, {
          ...e,
          floorCode: floor._id,
        });

        entrance.statusName = STATUS_MAP[e.status];
        await entrance.save();
      }
    }

    // ======================
    // EXIT
    // ======================
    const dbExits = await Exit.find({ floorCode: floor._id });
    const feExitCodes = getCodes(f.exits);

    for (const xDb of dbExits) {
      if (!feExitCodes.includes(xDb.code)) {
        await Exit.deleteOne({ _id: xDb._id });
      }
    }

    for (const x of f.exits || []) {
      let exit = await Exit.findOne({
        code: x.code,
        floorCode: floor._id,
      });

      if (!exit) {
        await Exit.create({
          ...x,
          floorCode: floor._id,
          statusName: STATUS_MAP[x.status],
        });
      } else {
        Object.assign(exit, {
          ...x,
          floorCode: floor._id,
        });

        exit.statusName = STATUS_MAP[x.status];
        await exit.save();
      }
    }

    // ======================
    // LANE NODE
    // ======================
    const dbLaneNodes = await laneNodeModel.find({ floorCode: floor._id });
    const feLaneNodeCodes = getCodes(f.laneNodes);

    for (const lnDb of dbLaneNodes) {
      if (!feLaneNodeCodes.includes(lnDb.code)) {
        await laneNodeModel.deleteOne({ _id: lnDb._id });
      }
    }

    for (const n of f.laneNodes || []) {
      let laneNode = await laneNodeModel.findOne({
        code: n.code,
        floorCode: floor._id,
      });

      if (!laneNode) {
        await laneNodeModel.create({
          ...n,
          floorCode: floor._id,
        });
      } else {
        Object.assign(laneNode, {
          ...n,
          floorCode: floor._id,
        });

        await laneNode.save();
      }
    }

    // ======================
    // NODE MAP
    // ======================
    const laneNodes = await laneNodeModel.find({ floorCode: floor._id });

    const nodeMap = {};
    for (const n of laneNodes) {
      nodeMap[n.code] = n._id;
    }

    // ======================
    // LANE
    // ======================
    const dbLanes = await Lane.find({ floorCode: floor._id });
    const feLaneCodes = getCodes(f.lanes);

    for (const lDb of dbLanes) {
      if (!feLaneCodes.includes(lDb.code)) {
        await Lane.deleteOne({ _id: lDb._id });
      }
    }

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
          floorCode: floor._id,
          fromNodeId,
          toNodeId,
        });

        lane.statusName = STATUS_MAP[l.status];
        await lane.save();
      }
    }

    // ======================
    // SLOT STANDALONE
    // ======================
    const dbSS = await SlotStandalone.find({ floorCode: floor._id });
    const feSSCodes = getCodes(f.slotStandalone);

    for (const ssDb of dbSS) {
      if (!feSSCodes.includes(ssDb.code)) {
        await SlotStandalone.deleteOne({ _id: ssDb._id });
      }
    }

    for (const ss of f.slotStandalone || []) {
      let slotStandalone = await SlotStandalone.findOne({
        code: ss.code,
        floorCode: floor._id,
      });

      if (!slotStandalone) {
        await SlotStandalone.create({
          ...ss,
          floorCode: floor._id,
          statusName: STATUS_MAP[ss.status],
        });
      } else {
        Object.assign(slotStandalone, {
          ...ss,
          floorCode: floor._id,
        });

        slotStandalone.statusName = STATUS_MAP[ss.status];
        await slotStandalone.save();
      }
    }

    // ======================
    // ZONE
    // ======================
    const dbZones = await Zone.find({ floorCode: floor._id });
    const feZoneCodes = getCodes(f.zones);

    for (const zDb of dbZones) {
      if (!feZoneCodes.includes(zDb.code)) {
        await Slot.deleteMany({ zoneCode: zDb._id });
        await GroupSlot.deleteMany({ zoneCode: zDb._id });
        await Zone.deleteOne({ _id: zDb._id });
      }
    }

    for (const z of f.zones || []) {
      let zone = await Zone.findOne({
        code: z.code,
        floorCode: floor._id,
      });

      if (!zone) {
        zone = await Zone.create({
          ...z,
          floorCode: floor._id,
          statusName: STATUS_MAP[z.status],
        });
      } else {
        Object.assign(zone, {
          ...z,
          floorCode: floor._id,
        });

        zone.statusName = STATUS_MAP[z.status];
        await zone.save();
      }

      // ======================
      // GROUP SLOT
      // ======================
      const dbGroups = await GroupSlot.find({ zoneCode: zone._id });
      const feGroupCodes = getCodes(z.groupSlots);

      for (const gDb of dbGroups) {
        if (!feGroupCodes.includes(gDb.code)) {
          await Slot.deleteMany({ groupSlotCode: gDb._id });
          await GroupSlot.deleteOne({ _id: gDb._id });
        }
      }

      for (const g of z.groupSlots || []) {
        let group = await GroupSlot.findOne({
          code: g.code,
          zoneCode: zone._id,
        });

        if (!group) {
          group = await GroupSlot.create({
            ...g,
            zoneCode: zone._id,
            floorCode: floor._id,
            statusName: STATUS_MAP[g.status],
          });
        } else {
          Object.assign(group, {
            ...g,
            zoneCode: zone._id,
            floorCode: floor._id,
          });

          group.statusName = STATUS_MAP[g.status];
          await group.save();
        }

        // ======================
        // SLOT
        // ======================
        const dbSlots = await Slot.find({ groupSlotCode: group._id });
        const feSlotCodes = getCodes(g.slots);

        // DELETE SLOT KHÔNG CÒN
        for (const sDb of dbSlots) {
          if (!feSlotCodes.includes(sDb.code)) {
            if (sDb.sensorId) {
              await sensorModel.updateOne(
                { _id: sDb.sensorId },
                { $set: { slotId: null } }
              );
            }

            await Slot.deleteOne({ _id: sDb._id });
          }
        }

        // UPSERT SLOT
        for (const s of g.slots || []) {
          let sensor = null;

          // ======================
          // FIND SENSOR BY CODE
          // ======================
          if (s.sensorCode) {
            sensor = await sensorModel.findOne({ code: s.sensorCode });

            if (!sensor) {
              throw new Error(`Sensor ${s.sensorCode} không tồn tại`);
            }
          }

          let slot = await Slot.findOne({
            code: s.code,
            groupSlotCode: group._id,
          });

          // ======================
          // CREATE SLOT
          // ======================
          if (!slot) {
            slot = await Slot.create({
              ...s,
              groupSlotCode: group._id,
              zoneCode: zone._id,
              floorCode: floor._id,
              statusName: STATUS_SLOT[s.status],
              sensorId: sensor ? sensor._id : null,
            });
          }
          // ======================
          // UPDATE SLOT
          // ======================
          else {
            Object.assign(slot, {
              ...s,
              groupSlotCode: group._id,
              zoneCode: zone._id,
              floorCode: floor._id,
              statusName: STATUS_SLOT[s.status],
              sensorId: sensor ? sensor._id : null,
            });

            await slot.save();
          }

          // ======================
          // SYNC SENSOR ↔ SLOT
          // ======================
          if (sensor) {
            // đảm bảo 1 sensor không bị gắn nhiều slot
            await sensorModel.updateMany(
              { slotId: slot._id, _id: { $ne: sensor._id } },
              { $set: { slotId: null } }
            );

            sensor.slotId = slot._id;
            await sensor.save();
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
