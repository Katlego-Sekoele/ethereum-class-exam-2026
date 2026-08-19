// Optional. Turns a price into the two sqrtPriceX96 values used in Task 2.
//
// Your parameter sheet already gives you both values, so you do not need this to
// finish the exam. Run it if you want to see where they come from, or to check them.
//
// Put the price from your sheet in the line below, then right click this file and
// choose "Run".
//
// Your sheet says something like "1 CAPE is worth 5.625 MARU". The number you want
// is that second figure, so you would write "5.625".

// ---------------------------------------------------------------------------
const PRICE = "7.5";
// ---------------------------------------------------------------------------
//
// Accepted forms, all exact:
//     "7.5"        a plain decimal
//     "15/2"       a fraction
//     "1/7.5"      a fraction, which is how you would write a reciprocal
//
// Use quotes. A bare 1/7.5 is worked out by JavaScript before this script sees it,
// which rounds it, and a rounded price gives you the wrong constant.

const TWO = BigInt(2);

// 2**192, written out in full. Remix compiles this file with an older JavaScript
// target, which rewrites the ** operator into Math.pow and refuses to use it on a
// BigInt. So there is no exponent operator anywhere in this file.
const TWO_TO_THE_192 = BigInt("6277101735386680763835789423207666416102355444464034512896");

/** Integer square root. Floating point cannot hold these numbers, so everything stays exact. */
function isqrt(value) {
  if (value < BigInt(2)) return value;
  let x = value;
  let y = (x + BigInt(1)) / TWO;
  while (y < x) {
    x = y;
    y = (x + value / x) / TWO;
  }
  return x;
}

/** "5.625" becomes the exact fraction 5625/1000. No rounding anywhere. */
function decimalToFraction(text) {
  const trimmed = String(text).trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`"${text}" is not a plain positive number`);
  }
  const [whole, fraction] = trimmed.split(".");
  const digits = fraction || "";
  return {
    numerator: BigInt(whole + digits),
    denominator: BigInt("1" + "0".repeat(digits.length)),
  };
}

/** Accepts "7.5" or "15/2" or "1/7.5" and returns one exact fraction. */
function parsePrice(input) {
  const text = String(input).trim();

  if (text.includes("/")) {
    const parts = text.split("/");
    if (parts.length !== 2) throw new Error(`"${input}" has too many slashes`);
    const top = decimalToFraction(parts[0]);
    const bottom = decimalToFraction(parts[1]);
    return {
      numerator: top.numerator * bottom.denominator,
      denominator: top.denominator * bottom.numerator,
    };
  }

  return decimalToFraction(text);
}

/** sqrtPriceX96 = floor(sqrt(price) * 2**96), done entirely in integers. */
function sqrtPriceX96(numerator, denominator) {
  if (numerator <= BigInt(0) || denominator <= BigInt(0)) {
    throw new Error("the price has to be greater than zero");
  }
  return isqrt((numerator * TWO_TO_THE_192) / denominator);
}

/** Only used to suggest a tick range. Your pool is the authority on the real tick. */
function approximateTick(numerator, denominator) {
  const price = Number(numerator) / Number(denominator);
  return Math.floor(Math.log(price) / Math.log(1.0001));
}

function simplify(numerator, denominator) {
  let a = numerator;
  let b = denominator;
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return { numerator: numerator / a, denominator: denominator / a };
}

(function () {
  try {
    if (typeof PRICE === "number") {
      const rendered = String(PRICE);
      if (rendered.replace(/^\d*\./, "").length > 12) {
        console.log("");
        console.log("WARNING -------------------------------------------------------");
        console.log(`PRICE came through as the rounded number ${rendered}.`);
        console.log("Write it in quotes as a fraction instead, for example \"1/7.5\",");
        console.log("otherwise your constant will be very slightly wrong and the");
        console.log("marking harness will not accept it.");
        console.log("---------------------------------------------------------------");
        console.log("");
      }
    }

    const parsed = parsePrice(PRICE);
    const forward = simplify(parsed.numerator, parsed.denominator);
    const reverse = { numerator: forward.denominator, denominator: forward.numerator };

    const forwardSqrt = sqrtPriceX96(forward.numerator, forward.denominator);
    const reverseSqrt = sqrtPriceX96(reverse.numerator, reverse.denominator);

    console.log("");
    console.log(`Price you entered: ${PRICE}, held exactly as ${forward.numerator}/${forward.denominator}`);
    console.log("sqrtPriceX96 = floor(sqrt(price) * 2**96)");
    console.log("");
    console.log("The figure on your sheet is the price when your token A is currency0.");
    console.log("When your token B is currency0 the price is the reciprocal instead.");
    console.log("You need both constants, and the second is not the first negated.");
    console.log("");
    console.log("These are the last two constructor values when you deploy Task2Pool.");
    console.log("They are already printed on your parameter sheet, so this is only here if");
    console.log("you want to check them or see where they come from.");
    console.log("");
    console.log(`  _sqrtPriceIfAlphaIsCurrency0   ${forwardSqrt}      (price ${forward.numerator}/${forward.denominator})`);
    console.log(`  _sqrtPriceIfBetaIsCurrency0    ${reverseSqrt}      (price ${reverse.numerator}/${reverse.denominator})`);
    console.log("");
    console.log("Roughly where these sit on the tick scale, useful when you pick a liquidity");
    console.log("range. Read the real tick off your pool before you report anything.");
    console.log(`  alpha as currency0, near tick ${approximateTick(forward.numerator, forward.denominator)}`);
    console.log(`  beta  as currency0, near tick ${approximateTick(reverse.numerator, reverse.denominator)}`);
    console.log("");
  } catch (error) {
    console.error("Could not read that price.");
    console.error(error.message || error);
    console.error('Write it in quotes, for example "7.5" or "15/2" or "1/7.5".');
  }
})();
