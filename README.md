# Dubtrack

## Overview

Dubtrack is a URL shortener and tracker that allows users to generate QR codes for short links. The application is designed to provide analytics and insights for each QR code scanned.

## Features

- **Short URL Generation** – Create shortened URLs with automatically generated short codes.
- **QR Code Generation** – Generate a QR code for each shortened link.
- **Analytics** – Track QR code scans, including time, location, and user agent.
- **Dockerized PostgreSQL Database** – Uses PostgreSQL hosted in a Docker container for reliable data storage.
- **Custom Shortcodes (Upcoming Feature)** – Users will soon be able to define their own shortcodes for URLs instead of auto-generated ones.

## Live Application

You can access the live version of the QR Tracker at:
[https://dubtrack.xyz/](https://dubtrack.xyz/)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

### Installation & Setup

1. **Clone the Repository**
   ```sh
   git clone https://github.com/your-username/qr-tracker.git
   cd qr-tracker
   ```
2. **Start PostgreSQL Database in Docker**
   ```sh
   docker-compose up -d
   ```
3. **Install Dependencies**
   ```sh
   yarn install
   ```
4. **Run the Application**
   ```sh
   yarn dev
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following:

```ini
DATABASE_URL=postgres://user:password@localhost:5432/qr_tracker
NEXT_PUBLIC_BASE_URL=https://<customdomain>.---
AUTH_SECRET="secret"
AUTH_GOOGLE_ID=<google-client>
AUTH_GOOGLE_SECRET=<google-secret>
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL= http://localhost:3000
POSTGRES_USER=admin
POSTGRES_PASSWORD=<password>
POSTGRES_DB=qr-scanner
POSTGRES_HOST=localhost  
```

## Usage

1. Open the application and enter a long URL to generate a shortened version.
2. Use the provided QR code for scanning.
3. View analytics to track scans.

## Roadmap

- ✅ URL shortening with automatic shortcodes
- ✅ QR code generation
- ✅ Detailed scan analytics with user insights
- ✅ Admin dashboard for managing links
- 🔜 Custom user-defined shortcodes


## Contributing

Contributions are welcome! Please submit a pull request or open an issue for discussion.

## License

This project is licensed under the MIT License.

## Support

If you find Dubtrack useful and would like to help keep it running as a free service, consider supporting us through a donation. Your contributions help cover maintenance costs and ensure continued development. 

Don't feel obligated, however, if you would like to help support the costs:\
([Donation Here!](https://dubtrack.xyz/support))



---

For questions or support, reach out at [https://dubtrack.xyz/](https://dubtrack.xyz/)!

