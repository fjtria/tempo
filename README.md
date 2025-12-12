# Tempo - Wellness Management and Menstrual Cycle Tracking

## Description

A privacy-first mobile application for tracking medication schedules, nutrition and hydration goals, and menstrual cycles.

## Installation Guide

### Prerequisites

1. Node.js and NPM
   * Download and install [Node.js](https://nodejs.org/en).
   * After installing, verify the installation by opening terminal and running:

      ```bash
      node -v
      npm -v
      ```

2. Watchman (MacOS only)
   * Install using Homebrew:

      ```bash
      brew install watchman
      ```

   * If Homebrew is not already installed, install it using the instructions [here](https://brew.sh/).

3. Mobile Device Simulators
   * For iOS (MacOS only)
      *	Install [Xcode](https://developer.apple.com/xcode/) from the App Store.
      *	Open Xcode, ensure iOS is selected, and download and install.
   
   * For Android (MacOS, Windows, Linux)
      *	Download and install [Android Studio](https://developer.android.com/studio).
         *	During installation, ensure the Android SDK and Android Virtual Device (AVD) components are selected.
      *	Open Android Studio, navigate to Device Manager, then Create a new Virtual Device.
   
### Project Setup

1.	Navigate to Source Code Folder
   * In terminal, change directories to the unzipped source code folder.

2.	Install Dependencies
   * Run the command to install all required libraries:

      ```bash
      npm install
      ```

### Building and Launching the Application

1.	Ensure either the iOS Simulator or Android Studio is ready and open.

2.	Run the prebuild command:
   
      ```bash
      npx expo prebuild
      ```

3.	Start the application development server:
   
      ```bash
      npx expo start
      ```

4.	In the terminal window with the development server running, type `i` or `a` to install and open the application in either the iOS or Android simulators, respectively.