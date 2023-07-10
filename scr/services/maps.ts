import { Client, TravelMode, UnitSystem } from '@googlemaps/google-maps-services-js';
import config from 'src/config';
import { Geoloc } from 'src/types/Coordinates';
import { undefinedAdressException } from 'src/utils/errors';
import { CITY, COUNTRY, DEPARTMENT, POSTAL_CODE, REGION } from 'src/utils/googlePlacesConstants';

const client = new Client({});

export const getDistance = async (origin: Geoloc, destination: Geoloc) => {
  const { data } = await client.directions({
    params: {
      origin: [origin.latitude, origin.longitude],
      destination: [destination.latitude, destination.longitude],
      mode: TravelMode.bicycling,
      units: UnitSystem.metric,
      key: config.GOOGLE_MAP_API_KEY ?? '',
    },
  });

  const result = {
    distance: data.routes[0].legs[0].distance.text,
    duration: data.routes[0].legs[0].duration.text,
    distanceValue: data.routes[0].legs[0].distance.value,
  };

  return result;
};

export const getAddressFromPlaceId = async placeId => {
  const googlemaps = new Client({});

  if (placeId) {
    const request = {
      place_id: placeId,
      key: config.GOOGLE_MAP_API_KEY,
      fields: ['name', 'formatted_address', 'address_components', 'place_id', 'geometry'],
    };

    const response = await googlemaps.placeDetails({
      params: request,
      timeout: 1000,
    });

    if (response?.data?.status === 'OK' && response?.data?.result) {
      const { address_components: addressComponents, formatted_address: formattedAddress, geometry } = response.data.result;

      if (addressComponents) {
        return {
          googlePlaceId: placeId ?? '',
          address: formattedAddress,
          postalCode: addressComponents.find(field => field.types.includes(POSTAL_CODE))?.long_name ?? '',
          city: addressComponents.find(field => field.types.includes(CITY))?.long_name ?? '',
          country: addressComponents.find(field => field.types.includes(COUNTRY))?.short_name ?? '',
          countryName: addressComponents.find(field => field.types.includes(COUNTRY))?.long_name ?? '',
          department: addressComponents.find(field => field.types.includes(DEPARTMENT))?.short_name ?? '',
          region: addressComponents.find(field => field.types.includes(REGION))?.short_name ?? '',
          latitude: geometry?.location.lat,
          longitude: geometry?.location.lng,
        };
      }
    }
  }
  throw undefinedAdressException;
};

export const getDistanceFromCustomer = () => {};

export const getDistanceFromShop = () => {};
