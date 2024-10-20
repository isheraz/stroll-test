# Question Assignment System - README

## Overview

This project implements a dynamic **Question Assignment System** where users are assigned questions based on their region and the current cycle (time period). Questions are fetched from a **PostgreSQL database** and cached using **Redis** to improve performance. The system scales to handle millions of users globally, ensuring efficient question assignment and caching strategies.

---

![System Architecture](./path-to-your-image.png)

---

## Key Concepts and Decisions

### 1. Why Cycles Data Structure?

The **Cycle** data structure is used to define the specific time periods during which questions are assigned to users. For this system, each cycle represents a week, but the duration can be configured to suit different use cases.

- **Benefits**:
  - Provides a structured way to manage time-based question assignments.
  - Allows for easy retrieval and assignment of questions by cycle number.
  - Simplifies question management over time, ensuring that users within the same region get the same questions for a particular cycle.

### 2. Why PostgreSQL and Schema Design?

**PostgreSQL** was chosen as the primary database for several reasons:
- **Relational Data**: Questions, cycles, and regions have clear relationships that are efficiently modeled in a relational database.
- **ACID Compliance**: PostgreSQL provides strong transactional guarantees, which ensures data integrity when assigning questions across regions and cycles.
- **SQL Capabilities**: Supports advanced querying to join tables (e.g., cycles, questions, regions) efficiently and scale for large datasets.

The schema design ensures data normalization and quick access to cycle-specific questions.

### 3. Why Redis Cache?

**Redis** is used as a caching layer to store frequently queried data (such as questions for specific cycles). The use of Redis dramatically reduces the need to hit the database repeatedly for the same queries, improving the performance of the system.

- **Performance Gains**:
  - **Cache Hits**: When a question is requested, Redis checks if it's available in the cache, thus avoiding an expensive database query.
  - **Cache Misses**: If the data isn't in the cache (miss), a query is made to PostgreSQL, and the result is stored in Redis for future requests.
  
- **Log Visibility**: Cache hits and misses are logged in the `server.log` file, allowing for visibility into system performance and the effectiveness of the cache layer.

### 4. Data Structures and Why They Are Used

- **Cycles**: Each cycle represents a distinct time period (e.g., a week) during which a specific question is assigned. The cycle's duration is configurable.
- **Regions**: Different geographical regions or logical user groups. Each region has a separate set of questions.
- **Questions**: The actual questions that users receive during a particular cycle.

These data structures allow for a scalable and easy-to-understand way of managing questions and cycles across various regions, ensuring future enhancements can be made seamlessly.

### 5. Future Enhancements

The current architecture was built with scalability and extensibility in mind. Some future enhancements include:
- **Support for More Regions**: Easily add more regions to the system without changing the core logic.
- **Dynamic Cycle Durations**: Support different cycle durations, such as daily or monthly, by adjusting the cycle calculation logic.
- **Advanced Caching**: Implement more granular caching strategies (e.g., user-specific caching or caching based on API requests).
- **Real-Time Updates**: Introduce real-time question updates or push notifications through WebSockets.

### 6. Available APIs

The system provides the following API endpoints:

#### **1. `/assign_question`**

This API assigns a question based on the user's region and cycle.

- **Method**: `GET`
- **Parameters**:
  - `region_name` (required): Name of the region (e.g., `Singapore`).
  - `user_id` (required): The user ID.
  - `cycle` (optional): The cycle number. If omitted, the current cycle is used.
  
**Example**:

```bash
curl -X GET "http://localhost:3000/api/assign_question?region_name=Singapore&user_id=123"
```

Response

```json
{
  "user_id": "123",
  "region": "Singapore",
  "cycle": { "number": 45, "from": "2024-10-30T19:00:00.000Z", "to": "2024-11-06T19:00:00.000Z" },
  "currentCycle": { "number": 42, "from": "2024-10-09T19:00:00.000Z", "to": "2024-10-16T19:00:00.000Z" },
  "question": { "text": "What is your opinion on remote work?" }
}
```

