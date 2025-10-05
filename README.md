## Local Setup Documentation

### Step-by-step Setup Instructions

1. **Clone the repository**  
```bash
git clone https://github.com/chirag079/edu.git
cd edu
```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Run the development server**
   ```bash
   npm run dev
   ```
4. **Open the app in your browser**

5. **Command Examples with Sample Output**
   ```bash
   npm run dev
   ```
   ```bash
   # Output:
    # > next dev
    # ready - started server on 0.0.0.0:3000, url: http://localhost:3000
   ```
6. **Environment Configuration**
   # NextAuth settings
   ```bash
         NEXTAUTH_URL="http://localhost:3000"
         NEXTAUTH_SECRET="fhue3243h2urhew"
   ```
   # MongoDB
   ```bash
   MONGODB_URI="mongodb+srv://jainarihantaj007:wNgY5Acr5TB58ndq@cluster69.qeyw4.mongodb.net/edustation?retryWrites=true&w=majority"
   ```

   # Cloudinary
   ```bash
   CLOUDINARY_CLOUD_NAME="dwgr4byba"
   CLOUDINARY_API_KEY="961624555633322"
   CLOUDINARY_API_SECRET="R-Ts0cwxKVIQzBEJwcpVa2f4rNs"
   ```

   # Optional auth debug/trust settings
   ```bash
   AUTH_DEBUG=false
   AUTH_TRUST_HOST=true
   ```

   # Environment
   ```bash
   NODE_ENV="development"
   ```
