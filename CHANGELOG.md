# DAW Base App - Changes Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).


## 2.3.4

* Feature addition
    * Adds functionality to edit device details in the frontend.
    * Implements delete functionality for devices, allowing easy removal.
* UI improvement
    * Displays devices using Materialize Cards for a more intuitive and visually appealing interface.
    * Improves icon handling based on device type for better visual differentiation. For now, device type management is done directly from the database.

## 2.3.3

* Backend improvement
    * Integrates connection to MySQL database for dynamic device data management.
    * Improves error handling for database operations, ensuring a smoother user experience.

## 2.3.2

* UI enhancement
    * Refines the display of device information in Cards, making the interface more responsive.
    * Adjusts icon rendering for different device types, adding support for more icon variations.

## 2.3.1

* Feature addition
    * Adds initial support for CRUD operations (Create, Read, Update, Delete) on devices from the frontend.

## 2.3.0

* Feature prototype
    * Drafts the edit and delete functionalities, allowing users to interact with the device data temporarily in the frontend. This is based on classroom examples.
    * Prepares frontend structure for future connection to MySQL backend.

## 2.2.0

* Project modification
    * Adds TypeScript compiler service to Docker Compose
    * Reestructures frontend folder for TypeScript
    * Adds new info to README accordingly
    * Changes project architecture image

## 2.1.0

* Project modification
    * Enhaces README accordingly to Goto IoT
    * Adds example of finished application
    * Removes unnecessary frontend images
    * Changes src code folders names

## 2.0.0

* Project modification
    * Changes project and organization names
    * Removes Typescript container
    * Removes Typescript Code
    * Executes Javascript code directly
    * Changes licence to MIT
    * Modifies README accordingly

## 1.0.0

* Project creation
    * Docker Compose implementation for whole project.
    * Typescript compilation into docker-compose.
    * MySQL 5.7 DB Server.
    * PHPMyAdmin.
    * NodeJS backend application.
    * Materialize CSS framework.
