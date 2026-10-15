const axios = require("axios");

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const searchNearbyPlaces = async ({
    latitude,
    longitude,
    radius,
    type
}) => {

    const response = await axios.post(
        "https://places.googleapis.com/v1/places:searchNearby",

        {
            includedTypes: [type],

            maxResultCount: 20,

            locationRestriction: {
                circle: {
                    center: {
                        latitude: Number(latitude),
                        longitude: Number(longitude)
                    },

                    radius: Number(radius)
                }
            },

            rankPreference: "DISTANCE"
        },

        {
            headers: {
                "Content-Type": "application/json",

                "X-Goog-Api-Key": API_KEY,

                "X-Goog-FieldMask":
                    "places.id," +
                    "places.displayName," +
                    "places.formattedAddress," +
                    "places.location," +
                    "places.rating," +
                    "places.userRatingCount," +
                    "places.googleMapsUri"
            }
        }
    );

    return response.data;
};


const getPlaceDetails = async (placeId) => {

    const response = await axios.get(
        `https://places.googleapis.com/v1/places/${placeId}`,

        {
            headers: {
                "X-Goog-Api-Key": API_KEY,

                "X-Goog-FieldMask":
                    "id," +
                    "displayName," +
                    "formattedAddress," +
                    "location," +
                    "rating," +
                    "userRatingCount," +
                    "reviews," +
                    "regularOpeningHours," +
                    "googleMapsUri"
            }
        }
    );

    return response.data;
};


const getDirections = async ({
    originLat,
    originLng,
    destinationLat,
    destinationLng
}) => {

    const response = await axios.post(
        "https://routes.googleapis.com/directions/v2:computeRoutes",

        {
            origin: {
                location: {
                    latLng: {
                        latitude: Number(originLat),
                        longitude: Number(originLng)
                    }
                }
            },

            destination: {
                location: {
                    latLng: {
                        latitude: Number(destinationLat),
                        longitude: Number(destinationLng)
                    }
                }
            },

            travelMode: "DRIVE",

            routingPreference: "TRAFFIC_AWARE",

            computeAlternativeRoutes: false
        },

        {
            headers: {
                "Content-Type": "application/json",

                "X-Goog-Api-Key": API_KEY,

                "X-Goog-FieldMask":
                    "routes.duration," +
                    "routes.distanceMeters," +
                    "routes.polyline.encodedPolyline"
            }
        }
    );

    return response.data;
};


module.exports = {
    searchNearbyPlaces,
    getPlaceDetails,
    getDirections
};