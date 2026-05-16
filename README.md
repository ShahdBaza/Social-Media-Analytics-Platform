# Social Media Analytics Platform 📊

A full-stack analytics dashboard designed to track engagement, user activity, and post performance across multiple social platforms. This project focuses on **Clean Architecture**, **Design Patterns**, and **Scalable Code**.

## 🚀 Key Features
* **Real-time Analytics:** Track likes, shares, and comments using a structured processing pipeline.
* **Multi-Platform Support:** Easily integrate different social media APIs (Mocked for now).
* **Authentication & Security:** Secure login and registration using JWT and middleware protection.
* **Event-Driven Updates:** Real-time feedback using an internal Event Bus.

## 🛠️ Design Patterns Applied
This is the core strength of the project. I've implemented several **GoF Design Patterns**:

1. **Adapter Pattern:** Used in `PlatformAdapter.js` to standardize different social media API responses into a single format.
2. **Chain of Responsibility:** Implemented in `RequestChain.js` to process data through multiple stages (filtering, validation, transformation).
3. **Command Pattern:** Used for post operations (Create, Edit, Delete) to keep the logic decoupled.
4. **Observer Pattern:** Implemented via an `EventBus` to notify different services when new data is processed.
5. **Repository Pattern:** Abstracted data access logic for `Users` and `Posts` to keep the services clean.

## 💻 Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Backend:** Node.js, Express.js
* **Patterns:** SOLID Principles, Metaprogramming concepts
* **Storage:** In-Memory Store (designed for easy migration to SQL/NoSQL)

## 🏗️ Project Structure
```text
backend/
├── src/
│   ├── controllers/    # Request handling
│   ├── patterns/       # Design Pattern implementations (Adapter, Chain, etc.)
│   ├── services/       # Business logic
│   ├── repositories/   # Data access layer
│   └── utils/          # Processing pipelines

🎓 Academic Context
Developed for the Programming 3 course, focusing on advanced software design and system integration.