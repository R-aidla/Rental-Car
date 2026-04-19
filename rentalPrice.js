const HOURS = 24;
const MINUTES = 60;
const SECONDS = 60;
const MILLISECONDS = 1000;
const VALID_CAR_TYPES = new Set(["Compact", "Electric", "Cabrio", "Racer"]);
const SEASONS = {
  HIGH: "High",
  LOW: "Low"
};

const RULES = {
  YOUNG_RACER_SURCHARGE: 1.5,
  HIGH_SEASON_SURCHARGE: 1.15,
  LONG_RENTAL_DISCOUNT: 0.9,
  LONG_RENTAL_DAYS: 10,
  YOUNG_DRIVER_AGE: 25,
};

function price(pickupDate, dropoffDate, carType, renterAge) {
  const validCarType = getValidCarType(carType);
  const rentalTimeInDays = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);
  
  if (renterAge < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (renterAge <= 21 && carType !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  return "$" + calculateRentalPrice(renterAge, rentalTimeInDays, validCarType, season);
}

function getValidCarType(type) {
  return VALID_CAR_TYPES.has(type) ? type : "Unknown";
}

function getDays(pickupDate, dropoffDate) {
  const oneDay = HOURS * MINUTES * SECONDS * MILLISECONDS;
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  if (dropoffDate < pickupDate) {
    throw new Error("Dropoff date must be after pickup date");
  }

  return Math.ceil(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  if (isNaN(pickup) || isNaN(dropoff)) {
    throw new Error("Invalid date");
  }

  const HIGH_SEASON_START = 4; // May
  const HIGH_SEASON_END = 10; // November

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  const overlapsHighSeason =
    pickupMonth <= HIGH_SEASON_END && dropoffMonth >= HIGH_SEASON_START;

  return overlapsHighSeason ? SEASONS.HIGH : SEASONS.LOW;
}

function calculateRentalPrice(renterAge, days, carType, season) {
    const basePrice = renterAge * days;
    let multiplier = 1;

    if (carType === "Racer" && renterAge <= RULES.YOUNG_DRIVER_AGE && season === SEASONS.HIGH) {
        multiplier *= RULES.YOUNG_RACER_SURCHARGE;
    }

    if (season === "High") {
        multiplier *= RULES.HIGH_SEASON_SURCHARGE;
    }

    if (days > RULES.LONG_RENTAL_DAYS && season === SEASONS.LOW) {
        multiplier *= RULES.LONG_RENTAL_DISCOUNT;
    }

    return basePrice * multiplier;
}

exports.price = price;
