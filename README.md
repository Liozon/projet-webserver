# COMEM+ Web Development Express REST Projet Web Server

As part of the WebServer course from third and last year of Bachelor, we have created an API. This API is a travel journal.

This API groups the following tables:

### table : user

| Attributes            |
| -----------           |
| userid                |
| email                 |
| password              |
| registrationDate      |


### table : trip

| Attributes            |
| -----------           |
| tripid                |
| tripName              |
| tripDescription       |
| tripCreationDate      |
| tripLastModDate       |
| tripCreator           |


### table : place

| Attributes            |
| -----------           |
| placeid               |
| placeName             |
| placeDescription      |
| placePicture          |
| placeCreationDate     |
| placeLastModDate      |
| location              |
| placeCorrTrip         |

    
    
-----------------------------------------------------------------

### Routes :

- GET (Retrieve data)
    - /users ((get all users))
    - /trips ((get all trips))
    - /places ((get all places))
    
    - /users/:userid ((get one user))
    - /trips/:tripid ((get one trip))
    - /places/:placeid ((get one place))
    
    - /trips/:tripid/places ((get all places of a trip))
    - /trips?tripCreator=:tripCreator ((get all trips of a user))


- POST (Create a new resource)
    - /users/signup ((Create a user))
    - /users/login ((Login a user))
    - /trips
    - /places
    

- PATCH (Partially modify an existing resource)
    - /users/:userid
    - /trips/:tripid
    - /places/:placeid

    
- PUT (Modify an existing resource complet)
    - /users/:userid
    - /trips/:tripid
    - /places/:placeid


- DELETE (Delete a resource)
    - /users/:userid
    - /trips/:tripid
    - /places/:placeid


-----------------------------------------------------------------

QUESTIONS :

- models/place.js:geolocalisation automatique?

- models/place.js: How to use correct timezone for date.now in the Schema?

- Tout fonctionne sans démarrer les programmes mongo.exe et mongod.exe. Est-ce que c'est correct ? on peut pas se déconnecter à la base de données sans mongo.exe, le programme devait tourner en arrière plan (Steffi)
