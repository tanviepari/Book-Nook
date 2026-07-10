# BookNook

BookNook is a book recommendation web application that helps readers discover books based on their preferences. Users select a **Genre**, **Reading Style**, and **Author Type**, and BookNook recommends books that best match their choices.

## Features

* Interactive preference selection
* Rule-based recommendation engine
* Dynamic book recommendations from the Open Library API
* Book covers, author details, publication year, genres, and descriptions
* Responsive and clean user interface
* Smooth scrolling and animated interactions

## Tech Stack

* HTML5
* CSS3
* JavaScript
* Open Library API

## API Update

This project was originally built using the **Google Books API**.
During deployment, the public Google Books API requests consistently returned quota-related errors (`429 RESOURCE_EXHAUSTED` with a daily quota of `0`), even for unauthenticated requests. Since the application is a static site hosted on GitHub Pages and does not use a backend, migrating to the **Open Library API** provided a more reliable and completely free solution without requiring API keys.
The application's recommendation logic remains API-driven, with recommendations generated using the Open Library Subjects API rather than hardcoded book data.

