# Written section

Student number:

Answer all five questions. **Maximum 120 words each.**

Full marks need specifics from your own work: your assigned values, your deployed addresses, your
numbers, your error messages, your range.

---

## Question 1 (5 marks)

Your sheet gave you two long starting price numbers rather than one. Explain why there are two,
state which of your two tokens ended up as `currency0` and how you knew, and say what would have
gone wrong if your code in TODO 2.1 had picked the other number.

**Answer:**

The numbers are long because the currency is recorded as an integer whose value is equal to the actual value of the currency *10^18 and thus the magnitude of the prices reflect that fact.

`currency0` was token B (DRAK). We know this because currency0 is assigned to the currenccy with the lower address. My token B address was `0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47` and the token A address was `0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B`. TokenB comes alphanumerically before tokenA.

If the code had picked the other, we would have incorrect pricing. The prices would haven been reversed.
---

## Question 2 (5 marks)

You committed a predicted output before swapping. State the number you predicted, how you arrived
at it, and the output you actually received. Provide a short explanation of why the two numbers were different (if they were). (If they were the same, explain why you were able to predict it so accurately.)

**Answer:**

Token B is Currency0 (its address comes first)
Therefore the starting price for the pool is sqrtPriceIfBetaIsCurrency0 = 33405526450006390824855173542

we want to convert currency1 into currency0
i.e. convert TokenA into TokenB
We had that we provided the following tokens into the pool
currency0 = TokenB = 4175363859800372855981
currency1 = TokenA = 786101537138692676389

therefore the constant product ratio in the pool is
k = TokenB * TokenA
k = 4175363859800372855981 * 786101537138692676389
k = 3.282259948302418 * 10**42

k = TokenB * TokenA
3.282259948302418 * 10**42 = newTokenBPrice * (786101537138692676389 + (1000000000000000000 - 0.003 * 1000000000000000000))
newTokenBPrice = 3.282259948302418 * 10**42 / (786101537138692676389 + (1000000000000000000 - 0.003 * 1000000000000000000))
newTokenBPrice = 4170075020383450824704

The actual output was 5606799220113670611.

I think I calculated the wrong thing. Calculated what the AMM would price currency0 (in terms of currency1) instead of the actual amount of currency0 after the trade.

---

## Question 3 (5 marks)

Quote the exact error message you hit on your first failed attempt at adding liquidity, and explain
the cause in terms of your own tick spacing and your own live tick. If your first attempt worked,
say so, then deliberately trigger one of the checks you wrote in TODO 3.1 or 3.2, quote the message
it gave, and explain what caused it.

**Answer:**

My first attempt worked.

Inputting a tickUpper of -17274 results in the error `"tickUpper is not a multiple of the tick spacing"`. This is because `ticks` must be multiples of the `tickSpacing` and -17274 is not a multiple of 200.

---

## Question 4 (5 marks)

State the tick range you chose and why. If you had chosen a range entirely above the live tick,
explain what your Task3Liquidity contract would have done with TODO 3.2 completed correctly.
Then suppose that range-containment check were removed, with all other inputs valid: name which
of your two tokens Uniswap would have taken, which it would have left alone, and why.

**Answer:**

The `tick range` was selected with the advice from the question. Floor the current tick to the nearest `tickSpacing` then go 20 spacings on either side resulting in the range of `[-21400, -13400]` from a tick of -17274.

Given 3.2. was implemented correctly, the contract would have added liquidity to the pool and set the tick range that that liquidity is allowed to be traded in.

If the check was removed uniswap would have taken currency0 (token b) and left token A untouched

---

## Question 5 (5 marks)

Both your tokens use 18 decimals. Suppose token A had used 6 instead and token B still used 18, with the same real world
price. State what would change about the starting price number you passed in, and state what in
your pool key would be completely unaffected. Explain why the pool itself neither knows nor cares
about decimals.

**Answer:**

If token A used 6, it would have significantly decreased the number of token As the system sees, thus increasing its value in comparison to the current setup

The pool works entirely off of the number of tokens you send in, not the value. it is an AMM so it prices for you.