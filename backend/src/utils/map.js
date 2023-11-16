const openrouteservice = require('openrouteservice-js');
const axios = require('axios');

const config = require('../config');

// const getCoordinate = async (address, ward, district, province) => {
//     const Geocode = new openrouteservice.Geocode({
//         api_key: config.OPENROUTESERVICE_API_KEY,
//     });
//     const result = await Geocode.geocode({
//         text: `${address}, ${ward}, ${district}, ${province}`,
//         boundary_country: 'VN',
//         size: 1,
//     });
//     const [long, lat] = result.features[0].geometry.coordinates;
//     const coordinates = [long, lat];
//     return coordinates;
// };

const getCoordinate = async (address, ward, district, province) => {
    const detailedAddress = `${address}, ${ward}, ${district}, ${province}`;
    const result = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
            params: {
                key: config.GOOGLE_API_KEY,
                address: detailedAddress,
            },
        },
    );
    return result.data.results[0].geometry.location;
};

/**
 * Get the distance of two coordinates
 *
 * @param {float} srcLat Source latitude
 * @param {float} srcLong Source longtitude
 * @param {float} desLat Destination latitude
 * @param {float} desLong Destination longtitude
 * @returns The distance between two coordinates (in meters)
 */
const getDistance = async (srcLat, srcLong, desLat, desLong) => {
    const Directions = new openrouteservice.Directions({
        api_key: config.OPENROUTESERVICE_API_KEY,
    });
    const result = await Directions.calculate({
        coordinates: [
            [srcLong, srcLat],
            [desLong, desLat],
        ],
        profile: 'driving-car',
    });
    const { distance } = result.routes[0].summary;
    return distance;
};

// /**
//  * Get the distance of two coordinates
//  *
//  * @param {float} srcLat Source latitude
//  * @param {float} srcLong Source longtitude
//  * @param {float} desLat Destination latitude
//  * @param {float} desLong Destination longtitude
//  * @returns The distance between two coordinates (in meters)
//  */
// const getDistance = async (srcLat, srcLong, desLat, desLong) => {
//     const result = await axios.get(
//         'https://maps.googleapis.com/maps/api/distancematrix/json',
//         {
//             params: {
//                 key: config.GOOGLE_API_KEY,
//                 origins: `${srcLat},${srcLong}`,
//                 destinations: `${desLat},${desLong}`,
//             },
//         },
//     );
//     return result.data.rows[0].elements[0].distance.value;
// };

module.exports = {
    getCoordinate,
    getDistance,
};
