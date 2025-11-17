<br />

![GitHub repo size](https://img.shields.io/github/repo-size/KurtSchwimmbacher/AscendAI?color=%23000000) ![GitHub watchers](https://img.shields.io/github/watchers/KurtSchwimmbacher/AscendAI?color=%23000000) ![GitHub language count](https://img.shields.io/github/languages/count/KurtSchwimmbacher/AscendAI?color=%23000000) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/KurtSchwimmbacher/AscendAI?color=%23000000) [![Instagram][instagram-shield]][instagram-url]

<!-- HEADER SECTION -->

<h3 align="center" style="padding:0;margin:0;">Kurt Schwimmbacher</h3>

<h3 align="center" style="padding:0;margin:0;">231002</h3>

<h4 align="center">DV300 2025</h4>

</br>

<p align="center">
  <a href="https://github.com/KurtSchwimmbacher/AscendAI">
    
  </a>

  <h3 align="center">AscendAI</h3>

<h4 align="center">Frontend Repo • <a href="https://github.com/KurtSchwimmbacher/AscendBackend.git">Backend Repo</a></h4>

A cross-platform mobile climbing route assistant that helps boulderers detect routes by colour, annotate holds, and estimate route grades using computer vision and AI.
<br>
<a href="https://drive.google.com/file/d/12Mv9FZuAK4SjZkUlvpzggjBInWlw0bGV/view?usp=sharing">View Demo</a>
·
<a href="https://github.com/KurtSchwimmbacher/AscendAI/issues">Report Bug</a>
·
<a href="https://github.com/KurtSchwimmbacher/AscendAI/issues">Request Feature</a>

</p>

<!-- TABLE OF CONTENTS -->

<details>
<summary><h2>Table of Contents</h2></summary>

- [About the Project](#about-the-project)

  - [Project Description](#project-description)

  - [Built With](#built-with)

- [Getting Started](#getting-started)

  - [Prerequisites](#prerequisites)

  - [How to install](#how-to-install)

- [Features and Functionality](#features-and-functionality)

- [Concept Process](#concept-process)

  - [Ideation](#ideation)

  - [Wireframes](#wireframes)

  - [User-flow](#user-flow)

- [Development Process](#development-process)

  - [Implementation Process](#implementation-process)

    - [Highlights](#highlights)

    - [Challenges](#challenges)

  - [Reviews and Testing](#reviews-and-testing)

    - [Feedback from Reviews](#feedback-from-reviews)

    - [Unit Tests](#unit-tests)

  - [Future Implementation](#future-implementation)

- [Final Outcome](#final-outcome)

  - [Mockups](#mockups)

  - [Video Demonstration](#video-demonstration)

- [Conclusion](#conclusion)

- [Roadmap](#roadmap)

- [Contributing](#contributing)

- [License](#license)

- [Contact](#contact)

- [Acknowledgements](#acknowledgements)

</details>

<!--PROJECT DESCRIPTION-->

## About the Project

<!-- header image of project -->

![ReadmeBanner][image1]

### Project Description

AscendAI is a React Native mobile app designed to help boulderers identify climbing routes by detecting holds through computer vision and AI. The app allows users to scan routes by color from a single photo, automatically annotate holds with bounding boxes, and estimate route grades with confidence scores and reasoning.

The app provides a modern solution to a common climbing problem: identifying which holds belong to a specific route. By using precise tap-to-image coordinate mapping, users can select a hold color, and the app will detect all matching holds, generate annotated images, and provide AI-powered grade estimations. All scanned routes can be saved to a personal library with notes and manual grade overrides.

Key capabilities include route detection by color with precise coordinate mapping, annotated image generation with bounding boxes, automatic route grade estimation with reasoning and confidence, persistent route storage with Firebase, and comprehensive profile management.

### Built With

**Frontend**

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/)
- [Axios](https://axios-http.com/)

**Backend**

- [FastAPI](https://fastapi.tiangolo.com/)
- [Python](https://www.python.org/)
- [Pillow](https://pillow.readthedocs.io/)
- [YOLO](https://github.com/ultralytics/ultralytics) (Hold detection service)
- [Render](https://render.com/)

**Cloud Services**

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)

**Tooling**

- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/)

<!-- GETTING STARTED -->

## Getting Started

The following instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure that you have the latest version of the following installed on your machine:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **Expo CLI** - Install via `npm install -g expo-cli`
- **iOS Simulator/Xcode** (macOS) or **Android Studio/Emulator** (Windows/macOS/Linux)
- **Firebase project** with Authentication, Firestore, and Storage enabled
- **Backend API** (FastAPI) deployed (e.g., on Render)

> **Note:** You will need to configure your Firebase project with Auth, Firestore, and Storage enabled. Additionally, ensure your backend API is deployed and accessible. The backend repository can be found at [AscendBackend](https://github.com/KurtSchwimmbacher/AscendBackend.git).

### How to install

#### Installation

Here are a couple of ways to clone this repo:

1. **Clone Repository** </br>

Run the following in the command-line to clone the project:

```sh
git clone https://github.com/KurtSchwimmbacher/AscendAI.git
cd AscendAI
```

2. **Install Dependencies** </br>

Run the following in the command-line to install all the required dependencies:

```sh
npm install
npx expo install expo-image-picker expo-image-manipulator
```

3. **Configure Environment** </br>

Set up your Firebase project and configure your environment variables:

- Set API URL in app config (Expo Constants extra) or `.env`:
  ```js
  API_URL=https://ascendbackend-b2f7.onrender.com
  ```
- Ensure `services/firebase.ts` is configured with your Firebase keys (Auth/Firestore/Storage).

4. **Run the App** </br>

Start the Expo development server:

```sh
npx expo start
```

Press 'i' for iOS simulator or 'a' for Android emulator, or scan the QR code with Expo Go on a physical device.

<!-- FEATURES AND FUNCTIONALITY-->

## Features and Functionality

![ScanRouteMockup][image2]

### Route Detection by Color

Scan climbing routes by selecting a hold color from a photo. The app uses precise tap-to-image coordinate mapping to identify the selected color, then detects all matching holds using computer vision. The detection process includes precise coordinate mapping for letterboxed images, ensuring accurate color selection regardless of image aspect ratio.

![GradeReadingMockup][image3]

### AI-Powered Grade Estimation

After route detection, the app automatically analyzes the route and provides grade estimations with confidence scores, reasoning, and key factors. The grade analysis considers hold types, route complexity, and climbing difficulty to provide accurate V-grade estimates with detailed explanations.

![PastRoutesMockup][image4]

### Past Routes Library

Save and manage all your scanned routes in a personal library. Each route includes the annotated image stored in Firebase Storage, along with metadata (grade, detection summary, timestamps, notes, and manual grade overrides) saved in Firestore. Browse your routes, view detailed information, edit notes and grades, and delete routes as needed.

![ProfileMockup][image5]

### Profile Management

Comprehensive user profile management with username and profile picture upload to Firebase Storage. Edit personal information including name, username, date of birth, and phone number. Delete account functionality removes all associated data including profile, routes, and storage files.

### Navigation

Simple, intuitive bottom tab navigation with Home, Scan, and Profile screens. Authentication and onboarding flow ensures users are properly set up before accessing the main app features.

<!-- CONCEPT PROCESS -->

## Concept Process

The `Conceptual Process` is the set of actions, activities and research that was done when starting this project.

### Ideation

The concept for AscendAI was born from a common frustration in rock climbing: needing to ask others for help identifying which holds belong to a specific route. The idea focused on creating an AI-powered solution that could automatically detect holds by color and provide grade estimations, making climbing more accessible and independent.

Key ideation points:

- Color-based hold detection from photos
- Automatic route annotation with bounding boxes
- AI-powered grade estimation with reasoning
- Personal route library for tracking progress
- Clean, intuitive mobile interface

### Wireframes

Wireframes were created to map out the user flow and interface design. The focus was on simplicity and ease of use, ensuring that users could quickly scan routes, view results, and manage their route library with minimal effort.

![AscendWireframes1][image7]

<br>

![AscendWireframes2][image8]

### User-flow

The user flow was designed to be straightforward:

1. User creates an account or logs in via Firebase Authentication
2. User navigates to the Scan screen and takes or selects a photo
3. User presses and holds on a hold to select its color
4. App processes the image and detects matching holds
5. Annotated image is displayed with detected holds
6. Grade estimation is automatically generated and displayed
7. User can save the route to their library with optional notes
8. User can browse, edit, and manage saved routes in Past Routes
9. User can manage their profile and account settings

<!-- DEVELOPMENT PROCESS -->

## Development Process

The `Development Process` is the technical implementations and functionality done in the frontend and backend of the application.

### Implementation Process

- Made use of **React Native** and **Expo** to implement a cross-platform mobile application.

- **Firebase Authentication** and **Firestore** for user authentication and data persistence.

- **Firebase Storage** for storing route images and profile pictures.

- **FastAPI backend** with computer vision integration for hold detection and grade analysis.

- **Expo Image Picker** and **Expo Image Manipulator** for image capture and processing.

- **TypeScript** for type safety and improved developer experience.

- **React Navigation** for seamless bottom tab navigation and screen transitions.

- **Axios** for robust API communication with multipart/form-data handling and extended timeouts.

#### Highlights

- **Precise Coordinate Mapping**: Successfully implemented accurate tap-to-image coordinate mapping for letterboxed images, ensuring color selection works correctly regardless of image aspect ratio.

- **Robust API Integration**: Implemented reliable multipart/form-data handling with long-running timeouts (up to 180s) to accommodate backend processing time for computer vision operations.

- **Clean Architecture**: Developed a well-structured codebase with clear separation of concerns using services, hooks, and UI components, making the codebase maintainable and scalable.

- **Full Persistence**: Implemented comprehensive data persistence with Firebase Storage for images and Firestore for metadata, ensuring all user data is securely stored and synchronized.

- **Annotated Image Generation**: Successfully integrated backend services to generate annotated images with bounding boxes, providing clear visual feedback of detected holds.

#### Challenges

- **Color Detection Fine-Tuning**: Fine-tuning color detection to accurately identify holds while filtering out similar colors in the background required extensive testing and parameter adjustment.

- **Content-Type Mismatches**: Resolved 422 errors from mismatched `Content-Type` headers and body/query parameter formats, requiring careful API request configuration.

- **Client-Side Timeouts**: Balancing client-side timeout settings with server processing time for computer vision operations required careful configuration to prevent premature timeouts while maintaining responsiveness.

- **EXIF/Rotation Issues**: Solved image rotation and EXIF orientation issues through minimal image manipulation using Expo Image Manipulator, ensuring consistent image processing across devices.

### Reviews & Testing

#### Feedback from Reviews

`User Testing` was conducted through moderated observational exploratory usability tests with unstructured tasks. Participants freely explored the app while being observed, followed by post-test surveys.

Key feedback:

- **Pain Point Resolution**: Every user felt the app was successful in solving the pain point of needing to ask others for help identifying holds.

- **Scan Screen Clarity**: The least clear screen to use was the Scan a Route screen. Users felt the app was either totally or somewhat successful in clarifying what holds were legal in a route.

- **Intuitive Design**: The rest of the app was intuitive and well-structured, with users finding navigation and route management straightforward.

- **Improvement Areas**: Key insight identified that either an onboarding mode to clarify/demonstrate the scan screen is required, or the UI must be updated to better reflect the desired behavior.

![UserTesting][image6]

#### Unit Tests

`Unit Tests` are currently not implemented. Future plans include Jest + React Native Testing Library for:

- Route detection API interactions
- Image coordinate mapping calculations
- Firebase service operations (mocked)
- Grade estimation data processing

### Future Implementation

- **Video Walkthroughs**: In-app guidance and video tutorials to help users understand the scanning process.

- **Advanced Color Filtering**: Tolerance controls for color detection to fine-tune hold identification.

- **Re-analyze Grades**: Ability to re-analyze grade for saved routes with updated AI models.

- **Batch Scans**: Support for scanning multiple routes from albums or batch processing.

- **Offline Caching**: Cache recent routes for offline access and improved performance.

- **Social Features**: Social sharing and community boards for route sharing and discussion.

- **Advanced Analytics**: More robust analytics including most common grades, gym trends, and personal climbing statistics.

<!-- MOCKUPS -->

## Final Outcome

### Mockups

![ScanRouteMockup][image2]

<br>

![GradeReadingMockup][image3]

<br>

![PastRoutesMockup][image4]

<br>

![ProfileMockup][image5]

<!-- VIDEO DEMONSTRATION -->

### Video Demonstration

To see a run through of the application, click below:

[View Demonstration](https://drive.google.com/file/d/12Mv9FZuAK4SjZkUlvpzggjBInWlw0bGV/view?usp=sharing)

<!-- CONCLUSION -->

## Conclusion

AscendAI successfully delivers a modern, intuitive solution for climbing route identification through computer vision and AI. The app combines clean design with robust backend functionality, providing boulderers with an independent tool to identify routes and estimate grades. The integration of React Native, FastAPI, Firebase, and computer vision technologies creates a reliable and scalable platform for climbing assistance.

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/KurtSchwimmbacher/AscendAI/issues) for a list of proposed features (and known issues).

Planned features include:

- Video walkthroughs and in-app guidance
- Advanced color filtering tolerance controls
- Re-analyze grade for saved routes
- Batch scans and albums
- Offline caching of recent routes
- Social sharing and community boards
- More robust analytics (most common grades, gym trends)

<!-- CONTRIBUTING -->

## Contributing

This project was developed as part of a university course requirement and is currently private and non-commercial. No external contributions are being accepted at this time.

<!-- AUTHORS -->

## Authors

- **Kurt Schwimmbacher** - [KurtSchwimmbacher](https://github.com/KurtSchwimmbacher)

<!-- LICENSE -->

## License

Distributed under the MIT License. See License for details

<!-- CONTACT -->

## Contact

- **Kurt Schwimmbacher** - [@kurts.portfolio](https://www.instagram.com/kurts.portfolio/)

- **Project Link** - https://github.com/KurtSchwimmbacher/AscendAI

- **Backend Repository** - https://github.com/KurtSchwimmbacher/AscendBackend

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

- [React Native](https://reactnative.dev/) - For providing the foundation to build cross-platform mobile applications
- [Expo](https://expo.dev/) - For simplifying the development and testing process
- [Firebase](https://firebase.google.com/) - For authentication, Firestore, and storage support
- [FastAPI](https://fastapi.tiangolo.com/) - For excellent async Python API framework
- [YOLO](https://github.com/ultralytics/ultralytics) - For computer vision and hold detection capabilities
- Open-source contributors – whose libraries, guides, and shared knowledge made development faster and more enjoyable
- **Open Window Lecturer Armand Pretorius** - For providing feedback and insight

<!-- MARKDOWN LINKS & IMAGES -->

[image1]: ./assets/banner/Frontend_Banner.png
[image2]: ./assets/mockups/Mockup_1.png
[image3]: ./assets/mockups/Mockup_4.png
[image4]: ./assets/mockups/Mockup_3.png
[image5]: ./assets/mockups/Mockup_5.png
[image6]: ./assets/userTesting/UserTesting.png
[image7]: ./assets/AscendWireframes1.png
[image8]: ./assets/AscendWireframes2.png

<!-- Refer to https://shields.io/ for more information and options about the shield links at the top of the ReadMe file -->

[instagram-shield]: https://img.shields.io/badge/-Instagram-black.svg?style=flat-square&logo=instagram&colorB=555
[instagram-url]: https://www.instagram.com/kurts.portfolio/
