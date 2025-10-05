# EduStation - Next.js Project

You can access the API documentation at the `/docs` route on the root URL:


## Local Development Setup

Clone the repository:

```bash
git clone https://github.com/chirag079/edu.git
cd edu
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```


Create a .env file in the root and add the following:

```bash
# Authentication URL
AUTH_URL="http://localhost:3000/api/auth"

# MongoDB connection
MONGODB_URI="mongodb+srv://jainarihantaj007:wNgY5Acr5TB58ndq@cluster69.qeyw4.mongodb.net/edustation?retryWrites=true&w=majority"

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME="dwgr4byba"
CLOUDINARY_API_KEY="961624555633322"
CLOUDINARY_API_SECRET="R-Ts0cwxKVIQzBEJwcpVa2f4rNs"

# NextAuth configuration
NEXTAUTH_SECRET="fhue3243h2urhew"
NEXTAUTH_URL="http://localhost:3000"
AUTH_DEBUG=false
AUTH_TRUST_HOST=true

# Gemini API
GEMINI_API_KEY="AIzaSyBe3gy7Y9X6ZU1UJHXbf9TG2v-PJrtW1kQ"
```
