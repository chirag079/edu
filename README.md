Local Setup Documentation

● Step-by-step setup instructions

Clone the repository

git clone https://github.com/chirag079/edu.git
cd edu


Install dependencies

npm install


Run the development server

npm run dev


Open the app in your browser
Visit http://localhost:3000
 to see your project in action.

● Command examples with sample output

npm run dev
# Output:
# > next dev
# 
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000


● Environment configuration guide

Create a .env.local file in the project root with the following variables:

# NextAuth settings
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="fhue3243h2urhew"

# MongoDB
MONGODB_URI="mongodb+srv://jainarihantaj007:wNgY5Acr5TB58ndq@cluster69.qeyw4.mongodb.net/edustation?retryWrites=true&w=majority"

# Cloudinary
CLOUDINARY_CLOUD_NAME="dwgr4byba"
CLOUDINARY_API_KEY="961624555633322"
CLOUDINARY_API_SECRET="R-Ts0cwxKVIQzBEJwcpVa2f4rNs"

# Gemini AI API key (server-side only)
GEMINI_API_KEY="AIzaSyA8PGJZKIKEx0yV3MBh8eCoyrJwfC8LpoY"

# Optional auth debug/trust settings
AUTH_DEBUG=false
AUTH_TRUST_HOST=true

# Environment
NODE_ENV="development"
