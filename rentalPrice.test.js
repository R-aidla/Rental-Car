const { price, getSeason } = require('./rentalPrice')

test("Rejects drivers under 18", () => {
  expect(price("2026-05-01", "2026-05-05", "Compact", 17, 5))
    .toBe("Driver too young - cannot quote the price");
});

test("Rejects too young license age", () => {
  expect(price("2026-05-01", "2026-05-05", "Compact", 25, 0))
    .toBe("Driver's license too young - cannot quote the price");
});

test("Restricts young drivers to Compact", () => {
  expect(price("2026-05-01", "2026-05-05", "Racer", 21, 3))
    .toBe("Drivers 21 y/o or less can only rent Compact vehicles");
});

test("Applies racer + high season + young driver rules", () => {
  const result = price("2026-06-01", "2026-06-05", "Racer", 22, 5);
  const numeric = parseFloat(result.replace("€", ""));

  expect(numeric).toBeCloseTo(189.75, 3);
});

test("Applies long rental discount in low season", () => {
  const result = price("2026-01-01", "2026-01-15", "Compact", 30, 5);
  const numeric = parseFloat(result.replace("€", ""));

  expect(numeric).toBeCloseTo(410.40, 3);
});

test("Adds young driver license fee in high season", () => {
  const result = price("2026-06-01", "2026-06-05", "Compact", 30, 2);
  const numeric = parseFloat(result.replace("€", ""));

  expect(numeric).toBeCloseTo(247.5, 3);
});

test("Adds fresh driver license fee", () => {
  const result = price("2026-03-01", "2026-03-05", "Compact", 30, 1);
  const numeric = parseFloat(result.replace("€", ""));

  expect(numeric).toBeCloseTo(196.95, 3);
});

test("Calculates normal price", () => {
  const result = price("2026-03-01", "2026-03-05", "Compact", 30, 5);
  const numeric = parseFloat(result.replace("€", ""));

  expect(numeric).toBeCloseTo(151.5, 3);
});

test("Check incorrectly assigned rental dates", () => {
  expect(() => price("2026-03-05", "2026-03-01", "Compact", 30, 5)).toThrow();
});

test("Check invalid rental dates", () => {
  expect(() => price("2026/2/3", "march 1st", "Compact", 30, 5)).toThrow();
});

test("Reject on an unknown car type", () => {
  expect(price("2026-03-01", "2026-03-05", "Truck", 30, 5)).toBe("Invalid car type");
});


// THIS IS THE TDD EXAMPLE TESTS
test("Weekday only rental has normal pricing", () => {
  const result = price("2026-01-05", "2026-01-07", "Compact", 50, 10);
  const numeric = parseFloat(result.replace("€", ""));

  expect(numeric).toBeCloseTo(150, 3);
});

test("Weekend days have 5 percent higher price", () => {
  const result = price("2026-01-08", "2026-01-10", "Compact", 50, 10);
  const numeric = parseFloat(result.replace("€", ""));

  expect(numeric).toBeCloseTo(152.5, 3);
});
