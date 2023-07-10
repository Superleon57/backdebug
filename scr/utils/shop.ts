import moment from 'moment-timezone';
moment.tz.setDefault('Europe/Paris');

export const isShopOpen = openingTimes => {
  if (!openingTimes) return false;

  const currentDayOfWeek = moment().format('dddd').toLowerCase();
  const currentDay = openingTimes.find(openingTime => openingTime.day === currentDayOfWeek);

  if (currentDay?.isClosed) {
    return false;
  }

  const currentHour = moment().format('HH:mm');
  const currentSlot = currentDay.slots.find(slot => {
    const opening = moment(slot.opening, 'HH:mm');
    const closing = moment(slot.closing, 'HH:mm');
    const current = moment(currentHour, 'HH:mm');

    return current.isBetween(opening, closing, undefined, '[)');
  });

  if (currentSlot) {
    return true;
  }

  return false;
};

export const extractShopInfo = shop => {
  const shopInfo = {
    id: shop.id,
    name: shop.name,
    description: shop.description,
    slogan: shop.slogan,
    image: shop.image,
    address: shop.address,
    openingTimes: shop.openingTimes,
    isOpen: isShopOpen(shop.openingTimes),
    _geoDistance: shop._geoDistance,
  };

  return shopInfo;
};
