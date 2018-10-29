# COMEM+ Web Development Express REST Projet Web Server

Dans le cadre du cours WebServer de troisième et denière année de Bachelor, nous avons créé une API. Cette API est un journal de voyage.

Cette API regroupe les tables suivantes :

- user
    - userid
    - email
    - password
    - registrationDate
    
- trip
    - tripid
    - tripName
    - tripDescription
    - tripCreationDate
    - tripLastModDate
    - tripCreator
    
- place
    - placeid
    - placeName
    - placeDescription
    - placeGeolocalisation
    - placePicture
    - placeCreationDate
    - placeLastModDate
    - placeCorrTrip
    
    
-----------------------------------------------------------------

Routes :

- GET (Retrieve data)
    - /users ((get all users))
    - /trips ((get all trips))
    - /places ((get all places))
    
    - /user/userid ((get one user))
    - /trip/tripid ((get one trip))
    - /place/placeid ((get one place))
    
=>  - /user/trips ((get all trips of a user))
=>  - /trip/places ((get all places of a trip))


- POST (Create a new resource)
    - /user
    - /trip
    - /place


- DELETE (Delete a resource)
    - /user/userid
    - /trip/tripid
    - /place/placeid
    

- PATCH (Partially modify an existing resource)
    - /user/userid
    - /trip/tripid
    - /place/placeid


-----------------------------------------------------------------

ToDo:

- last two GET routes

- Aggregated data

- Sensitive data

- Documentation

- REST: HTTP methods, headers and status codes, consistent URL hierarchy and/or naming structure

- Reread Evaluation constraints


-----------------------------------------------------------------

QUESTIONS :

- models/place.js:geolocalisation automatique?

- models/place.js: How to use correct timezone for date.now in the Schema?

