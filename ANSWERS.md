# Written section

Student number:

Answer all five questions. **Maximum 120 words each.** Each is worth 5 marks, awarded as nothing,
half or full.

Full marks need specifics from your own work: your assigned values, your deployed addresses, your
numbers, your error messages, your range. A correct general description of how Uniswap works
scores nothing on any of these questions.

---

## Question 1 (5 marks)

Your sheet gave you a starting price. Show how you turned it into `sqrtPriceX96`, and state which
of your two tokens ended up as `currency0` and how you knew. Give both of the values you put in
your two constants and explain why the second one is not simply the first one negated.

**Answer:**

---

## Question 2 (5 marks)

You committed a predicted output before swapping. State the number you predicted, how you arrived
at it, and the output you actually received. Account for the whole difference between the two.

**Answer:**

---

## Question 3 (5 marks)

Quote the exact error you hit on your first failed attempt at adding liquidity, and explain the
root cause in terms of your own assigned tick spacing. If your first attempt succeeded, say so and
instead force one of your three validation errors, quote it, and explain what triggered it.

**Answer:**

---

## Question 4 (5 marks)

State the tick range you chose and why. Then answer this: if you had chosen a range that sits
entirely above the live tick, what would have happened? Name which of your two tokens the pool
would have taken, which it would have left alone, and why.

**Answer:**

---

## Question 5 (5 marks)

Both your tokens use 18 decimals. Suppose one of them had used 6 instead, with the same economic
price. State what would change in your `sqrtPriceX96`, and state what in your pool key would be
completely unaffected. Explain why the pool neither knows nor cares about decimals.

**Answer:**
