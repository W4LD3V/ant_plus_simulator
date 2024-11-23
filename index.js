const { AntDevice } = require('incyclist-ant-plus/lib/bindings');
const { BicyclePowerSensor, HeartRateSensor } = require('incyclist-ant-plus');

(async () => {
  try {
    // Initialize the ANT+ Device
    const ant = new AntDevice({ startupTimeout: 2000, debug: true });
    const success = await ant.open();

    if (!success) {
      console.error('Failed to open ANT+ device. Please check the USB stick connection.');
      return;
    }

    console.log('ANT+ device connected.');

    // Reserve a channel
    const channel = ant.getChannel();
    if (!channel) {
      console.error('Failed to reserve a channel. Make sure the USB stick is working properly.');
      return;
    }

    // Attach sensors to the channel
    const powerSensor = new BicyclePowerSensor();
    const heartRateSensor = new HeartRateSensor();
    channel.attach(powerSensor);
    channel.attach(heartRateSensor);

    // Event: Log detected ANT+ devices
    channel.on('detect', (profile, id) => {
      console.log(`Detected ANT+ device - Profile: ${profile}, ID: ${id}`);
    });

    // Event: Log data received from ANT+ devices
    channel.on('data', (profile, id, data) => {
      console.log(`Data received - Profile: ${profile}, ID: ${id}, Data: ${JSON.stringify(data)}`);
    });

    // Start scanning for devices
    console.log('Scanning for ANT+ devices...');
    const detected = await channel.startScanner({ timeout: 15000 }); // Scan for 15 seconds

    if (detected) {
      console.log('Devices detected:', detected);
    } else {
      console.log('No ANT+ devices detected during the scan.');
    }

    // Attempt to connect to the power sensor
    console.log('Attempting to connect to the Bicycle Power Sensor...');
    const successPowerSensor = await channel.startSensor(powerSensor);

    if (successPowerSensor) {
      console.log('Connected to the Bicycle Power Sensor!');
    } else {
      console.error('Failed to connect to the Bicycle Power Sensor. Ensure the device is active and in range.');
    }

    // Graceful cleanup on exit
    process.on('SIGINT', async () => {
      console.log('Closing ANT+ connection...');
      await ant.close();
      console.log('Connection closed. Exiting.');
      process.exit();
    });

  } catch (error) {
    console.error('Error:', error);
  }
})();
