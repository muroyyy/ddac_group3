# Local MySQL Database Setup

## 1. Update Connection String

Edit `backend/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=bloodline_db;User=root;Password=YOUR_PASSWORD;"
  }
}
```

Replace `YOUR_PASSWORD` with your MySQL root password.

## 2. Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE bloodline_db;
USE bloodline_db;
```

## 3. Run Migrations

```bash
mysql -u root -p bloodline_db < backend/migrations/001_create_donor_tables.sql
```

## 4. Start Backend

```bash
cd backend
dotnet run
```

Backend runs on: http://localhost:5000

## Connection String Format

```
Server=localhost;Port=3306;Database=bloodline_db;User=root;Password=your_password;
```

- **Server**: localhost (or 127.0.0.1)
- **Port**: 3306 (default MySQL port)
- **Database**: bloodline_db
- **User**: root (or your MySQL user)
- **Password**: your MySQL password
