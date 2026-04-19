const HOURS = 24;
const MINUTES = 60;
const SECONDS = 60;
const MILLISECONDS = 1000;
const VALID_CAR_TYPES = new Set(["Compact", "Electric", "Cabrio", "Racer"]);
const SEASONS = {
  HIGH: "High",
  LOW: "Low",
};

const RULES = {
  YOUNG_RACER_SURCHARGE: 1.5,
  HIGH_SEASON_SURCHARGE: 1.15,
  YOUNG_DRIVERS_LICENSE_SURCHARGE: 1.3,
  WEEKEND_SURCHARGE: 1.05,
  LONG_RENTAL_DAYS: 10,
  LONG_RENTAL_DISCOUNT: 0.9,
  NEW_DRIVER_HIGH_SEASON_DAILY_FEE: 15,
  YOUNG_DRIVER_AGE: 25,
  MINIMUM_REQUIRED_DRIVERS_LICENSE_AGE: 1,
  YOUNG_DRIVERS_LICENSE_AGE: 2,
};

function price(pickupDate, dropoffDate, carType, renterAge, driversLicenseAge) {
  const validCarType = getValidCarType(carType);
  const rentalTimeInDays = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  if (renterAge < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (renterAge <= 21 && carType !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (driversLicenseAge < RULES.MINIMUM_REQUIRED_DRIVERS_LICENSE_AGE) {
    return "Driver's license too young - cannot quote the price";
  }

  return (
    "€" +
    calculateRentalPrice(
      renterAge,
      rentalTimeInDays,
      validCarType,
      season,
      pickupDate,
      driversLicenseAge,
    )
  );
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

  const HIGH_SEASON_START_MONTH = 4; // May
  const HIGH_SEASON_END_MONTH = 10; // November

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  const overlapsHighSeason =
    pickupMonth <= HIGH_SEASON_END_MONTH &&
    dropoffMonth >= HIGH_SEASON_START_MONTH;

  return overlapsHighSeason ? SEASONS.HIGH : SEASONS.LOW;
}

function isWeekend(date) {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
}

function calculateRentalPrice(
  renterAge,
  rentalDays,
  carType,
  season,
  pickupDate,
  renterDrivingLicenseAge,
) {
  let basePrice = 0;
  let multiplier = 1;

  if (
    carType === "Racer" &&
    renterAge <= RULES.YOUNG_DRIVER_AGE &&
    season === SEASONS.HIGH
  ) {
    multiplier *= RULES.YOUNG_RACER_SURCHARGE;
  }

  if (season === SEASONS.HIGH) {
    multiplier *= RULES.HIGH_SEASON_SURCHARGE;
  }

  if (rentalDays > RULES.LONG_RENTAL_DAYS && season === SEASONS.LOW) {
    multiplier *= RULES.LONG_RENTAL_DISCOUNT;
  }

  if (renterDrivingLicenseAge < RULES.YOUNG_DRIVERS_LICENSE_AGE) {
    multiplier *= RULES.YOUNG_DRIVERS_LICENSE_SURCHARGE;
  }

  // This is my TDD code based on the test.
  for (let day = 0; day < rentalDays; day++) {
    const currentDate = new Date(pickupDate);
    currentDate.setDate(currentDate.getDate() + day);

    let dailyPrice = renterAge;

    if (isWeekend(currentDate)) {
      dailyPrice *= RULES.WEEKEND_SURCHARGE;
    }

    basePrice += dailyPrice;
  }

  basePrice *= multiplier;

  if (season === SEASONS.HIGH && renterDrivingLicenseAge < 3) {
    // TODO: Figure out if the this license age check number should be a constant variable.
    basePrice += RULES.NEW_DRIVER_HIGH_SEASON_DAILY_FEE * rentalDays;
  }

  return basePrice;
}

exports.price = price;
