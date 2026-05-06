# KD Frontend Demo - Site

This is the frontend for the Site Monitoring application, built with React Native and Expo.

To allow someone else to run this project on their machine, they should follow these steps. You can share this list with them:

### 1. Prerequisites
Ensure **Node.js** (LTS version recommended) and **npm** are installed.

### 2. Setup and Installation
Navigate to the project folder in the terminal and run:

```bash
# Install all project dependencies
npm install
```

### 3. Running the Project
To start the development server with the recent configuration changes, they should run:

```bash
# Start the Expo server and clear the bundler cache
npx expo start --clear
```

### 4. Choosing a Platform
Once the server is running, they can choose where to view the app:

*   Press **w** to run in the **Web Browser**.
*   Press **a** to run on an **Android Emulator** or device.
*   Press **i** to run on an **iOS Simulator**.
*   Scan the **QR Code** with the **Expo Go** app (Android/iOS) to run on a physical device.

### Summary of common commands:

| Task | Command |
| :--- | :--- |
| **Install** | `npm install` |
| **Start (Clean)** | `npx expo start --clear` |
| **Web Only** | `npx expo start --web` |
| **Android Only** | `npx expo start --android` |
| **iOS Only** | `npx expo start --ios` |
