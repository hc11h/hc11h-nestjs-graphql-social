# 📌 Social Media Backend Platform (NestJS + GraphQL + Prisma)

It implements core social features such as posts, likes, follows, notifications, and feed ranking with hotScore, inspired by modern Instagram-style social platforms.

This project is a modular social media backend built with:

- **NestJS** - Modular Monolith
- **GraphQL**
- **Prisma ORM** (PostgreSQL)
- **JWT Authentication**
- **Clean module separation**


---

## Local Setup

### 🛠 Installation

1. Clone the repository and install dependencies  
```bash
git clone 
cd into the folder
yarn install
````

2. Set environment variables
   Create `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/socialdb"
JWT_SECRET="your-secret"
```

3. Run Prisma migrations

```bash
npx prisma migrate dev
```

4. Start the server

```bash
npm run start:dev
```

Open GraphQL Playground:
[http://localhost:3000/graphql](http://localhost:3000/graphql)

---

## Docker Setup

This guide sets up the app and PostgreSQL with Docker Compose.

### Requirements

* Docker Desktop
* A `.env` file in project root

### .env

Create `.env` with exactly two variables (no quotes):

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/app?schema=public
JWT_SECRET=change_me
```

`DATABASE_URL` points to the `db` service inside Docker.
`JWT_SECRET` is any strong string.

### Start

```bash
docker compose up --build
```

This builds the app, runs Prisma generate + migrations, and starts the server.

### Access

* GraphQL: `http://localhost:3005/graphql`

### Stop

```bash
docker compose down
```

### Remove data volume:

```bash
docker compose down -v
```


