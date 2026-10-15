const {
    searchNearbyPlaces,
    getPlaceDetails,
    getDirections
} = require("../services/googleMapsService");

const SearchHistory = require("../models/SearchHistory");


const getNearbyPlaces = async (req, res) => {

    try {

        const {
            latitude,
            longitude,
            radius,
            type
        } = req.query;

        if (!latitude || !longitude) {

            return res.status(400).json({
                message: "Location is required"
            });
        }

        const radiusKm = Number(radius || 5);

        if (radiusKm < 1 || radiusKm > 50) {

            return res.status(400).json({
                message: "Radius must be between 1 and 50 km"
            });
        }

        const result = await searchNearbyPlaces({

            latitude,

            longitude,

            radius: radiusKm * 1000,

            type: type || "restaurant"

        });


        if (req.user) {

            await SearchHistory.create({

                user: req.user.id,

                searchType: type || "restaurant",

                latitude: Number(latitude),

                longitude: Number(longitude),

                radius: radiusKm

            });
        }


        res.json(result);

    } catch (error) {

        console.error(
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Failed to find nearby places"
        });
    }
};


const getDetails = async (req, res) => {

    try {

        const { placeId } = req.params;

        const result =
            await getPlaceDetails(placeId);

        res.json(result);

    } catch (error) {

        console.error(
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Failed to get place details"
        });
    }
};


const directions = async (req, res) => {

    try {

        const {
            originLat,
            originLng,
            destinationLat,
            destinationLng
        } = req.query;

        const result = await getDirections({

            originLat,
            originLng,

            destinationLat,
            destinationLng

        });

        res.json(result);

    } catch (error) {

        console.error(
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Failed to calculate directions"
        });
    }
};


module.exports = {
    getNearbyPlaces,
    getDetails,
    directions
};