const cron = require('node-cron');
const bookingService = require('../module/users/booking/booking.service');
const sensorService = require('../module/admin/iot/sensor/sensor.service');

cron.schedule('* * * * *', async () => {
  try {
    await bookingService.autoAssignSlotForUpcomingBookings();
    await bookingService.releaseUncheckinBookings();
    // await sensorService.syncSensorStateService();
    console.log('Auto assign slot success');
  } catch (error) {
    console.error('Auto assign slot error:', error.message);
  }
});
