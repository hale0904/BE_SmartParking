const cron = require('node-cron');
const bookingService = require('../module/users/booking/booking.service');

cron.schedule('* * * * *', async () => {
  try {
    await bookingService.autoAssignSlotForUpcomingBookings();
    console.log('Auto assign slot success');
  } catch (error) {
    console.error('Auto assign slot error:', error.message);
  }
});
