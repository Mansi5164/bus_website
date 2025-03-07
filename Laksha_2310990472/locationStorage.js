const locations = [];

export function storeLocation(id, device, coords) {
  const locationData = {
    id,
    deviceInfo: device,
    timestamp: new Date(),
    ...coords,
  };

  locations.push(locationData);
  console.log('Location stored:', locationData);
}

export function getLocations() {
  return locations;
}
