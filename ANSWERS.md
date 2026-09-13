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

---

## Question 2 (5 marks)

You committed a predicted output before swapping. State the number you predicted, how you arrived
at it, and the output you actually received. Provide a short explanation of why the two numbers were different (if they were). (If they were the same, explain why you were able to predict it so accurately.)

**Answer:**

---

## Question 3 (5 marks)

Quote the exact error message you hit on your first failed attempt at adding liquidity, and explain
the cause in terms of your own tick spacing and your own live tick. If your first attempt worked,
say so, then deliberately trigger one of the checks you wrote in TODO 3.1 or 3.2, quote the message
it gave, and explain what caused it.

**Answer:**

---

## Question 4 (5 marks)

State the tick range you chose and why. If you had chosen a range entirely above the live tick,
explain what your Task3Liquidity contract would have done with TODO 3.2 completed correctly.
Then suppose that range-containment check were removed, with all other inputs valid: name which
of your two tokens Uniswap would have taken, which it would have left alone, and why.

**Answer:**

---

## Question 5 (5 marks)

Both your tokens use 18 decimals. Suppose token A had used 6 instead and token B still used 18, with the same real world
price. State what would change about the starting price number you passed in, and state what in
your pool key would be completely unaffected. Explain why the pool itself neither knows nor cares
about decimals.

**Answer:**
