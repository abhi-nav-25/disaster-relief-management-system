import {
    findAllCamps,
    findCampById,
    findNearestCamps,
} from "../repositories/campRepository";

export const getAllCamps = async () => {
    return findAllCamps();
};

export const getCampById = async (id: number) => {
    const camp = await findCampById(id);

    if (!camp) {
        throw new Error("Relief camp not found");
    }

    return camp;
};

export const getNearestCamps = async (
    latitude: number,
    longitude: number
) => {
    if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error("Invalid latitude or longitude");
    }

    return findNearestCamps(latitude, longitude);
};