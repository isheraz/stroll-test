### Problem - Dynamic Question Assignment

Let’s assume you have N questions stored in a database, and each question needs to be assigned to a specific cycle. Each cycle spans 1 week, after which a new question is assigned to the next cycle. The question assignments are region-specific, meaning users in different regions receive different questions. For example, users in Singapore get question X, while users in the US receive question Y. All users in the same region will get the same question.

Singapore question set: [1, 2, 3, 4, 5, ..., N]

- Cycle 1 (Week 1): Assign question 1
- Cycle 2 (Week 2): Assign question 2
- Cycle N (Week N): Assign question N

US question set: [6, 7, 8, 9, 10, ..., N]

- Cycle 1 (Week 1): Assign question 6
- Cycle 2 (Week 2): Assign question 7
- Cycle N (Week N): Assign question N

Consideration:

The duration of each cycle is configurable and can vary (e.g., 1 day, 7 days, 14 days, 30 days).
For a start - we will set the question cycle duration every 7 days, at monday 7pm SGT weekly

#### Task

1. Design & Implement: Build a question rotation system and design an efficient architecture to solve the problem. Consider any potential improvements to enhance the product.

2. Writeup: Provide a detailed explanation of your strategy, outlining the pros and cons of your design and implementation.

3. Submission: Share a link to a GitHub/GitLab repository with your solution. The README.md file should contain the writeup.

4. Scalability Requirement: The solution should be capable of handling 100k daily active users (DAU) and scale to support millions of global users, ensuring efficient question assignment and rotation based on region and cycle configuration.
