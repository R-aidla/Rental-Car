const HOURS = 24;
const MINUTES = 60;
const SECONDS = 60;
const MILLISECONDS = 1000;
const VALID_CAR_TYPES = new Set(["compact", "electric", "cabrio", "racer"]);
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
  HIGH_SEASON_YOUNG_DRIVERS_LICENSE_AGE: 3
};

function price(pickupDate, dropoffDate, carType, renterAge, driversLicenseAge) {
  const validCarType = getValidCarType(carType.toLowerCase());
  const rentalTimeInDays = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  if (renterAge < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (renterAge <= 21 && carType !== "compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (driversLicenseAge < RULES.MINIMUM_REQUIRED_DRIVERS_LICENSE_AGE) {
    return "Driver's license too young - cannot quote the price";
  }

  if (validCarType === "unknown") {
   return "Invalid car type";
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

function getValidCarType(carType) {
  return VALID_CAR_TYPES.has(carType) ? carType : "unknown";
}

function getDays(pickupDate, dropoffDate) {
  const oneDay = HOURS * MINUTES * SECONDS * MILLISECONDS;
  const firstDate = new Date(pickupDate);
  const lastDate = new Date(dropoffDate);

  if (lastDate < firstDate) {
    throw new Error("Dropoff date must be after pickup date");
  }

  if (isNaN(firstDate) || isNaN(lastDate)) {
    throw new Error("Invalid date");
  }

  return Math.ceil(Math.abs((firstDate - lastDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const firstDate = new Date(pickupDate);
  const lastDate = new Date(dropoffDate);

  if (isNaN(firstDate) || isNaN(lastDate)) {
    throw new Error("Invalid date");
  }

  const HIGH_SEASON_START_MONTH = 3; // April
  const HIGH_SEASON_END_MONTH = 9; // October

  const pickupMonth = firstDate.getMonth();
  const dropoffMonth = lastDate.getMonth();

  const overlapsHighSeason =
    pickupMonth <= HIGH_SEASON_END_MONTH &&
    dropoffMonth >= HIGH_SEASON_START_MONTH;

  return overlapsHighSeason ? SEASONS.HIGH : SEASONS.LOW;
}

function isWeekend(date) {
  const day = date.getDay();
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
  let subtotal = 0;
  let pricingMultiplier = 1;

  if (
    carType === "racer" &&
    renterAge <= RULES.YOUNG_DRIVER_AGE &&
    season === SEASONS.HIGH
  ) {
    pricingMultiplier *= RULES.YOUNG_RACER_SURCHARGE;
  }

  if (season === SEASONS.HIGH) {
    pricingMultiplier *= RULES.HIGH_SEASON_SURCHARGE;
  }

  if (rentalDays > RULES.LONG_RENTAL_DAYS && season === SEASONS.LOW) {
    pricingMultiplier *= RULES.LONG_RENTAL_DISCOUNT;
  }

  if (renterDrivingLicenseAge < RULES.YOUNG_DRIVERS_LICENSE_AGE) {
    pricingMultiplier *= RULES.YOUNG_DRIVERS_LICENSE_SURCHARGE;
  }

  // This is my TDD code based on the test.
  for (let day = 0; day < rentalDays; day++) {
    const currentDate = new Date(pickupDate);
    currentDate.setDate(currentDate.getDate() + day);

    let dailyPrice = renterAge;

    if (isWeekend(currentDate)) {
      dailyPrice *= RULES.WEEKEND_SURCHARGE;
    }

    subtotal += dailyPrice;
  }

  subtotal *= pricingMultiplier;

  if (season === SEASONS.HIGH && renterDrivingLicenseAge < RULES.HIGH_SEASON_YOUNG_DRIVERS_LICENSE_AGE) {
    subtotal += RULES.NEW_DRIVER_HIGH_SEASON_DAILY_FEE * rentalDays;
  }

  return subtotal;
}

exports.price = price;
exports.getDays = getDays;
exports.getSeason = getSeason;
