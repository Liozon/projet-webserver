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
    - (placeGeolocalisation)
    - placePicture
    - placeCreationDate
    - placeLastModDate
    - placeLatitude
    - placeLongitude
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
    
    - /user/:userid/trips ((get all trips of a user))
    - /trip/:tripid/places ((get all places of a trip))


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
    
- PUT (Modify an existing resource complet)
    - /user/userid
    - /trip/tripid
    - /place/placeid


-----------------------------------------------------------------

ToDo:

- REST: HTTP methods, headers and status codes, consistent URL hierarchy and/or naming structure ((Céline))

- Reread Evaluation constraints ((Céline))


-----------------------------------------------------------------

QUESTIONS :

- models/place.js:geolocalisation automatique?

- models/place.js: How to use correct timezone for date.now in the Schema?

- Tout fonctionne sans démarrer les programmes mongo.exe et mongod.exe. Est-ce que c'est correct ? on peut pas se déconnecter à la base de données sans mongo.exe, le programme devait tourner en arrière plan (Steffi)

- Heroku: 'https://comem-webserv-2018-2019-e.herokuapp.com' ne fonctionne pas comme 'http://localhost:3000/'! Update? 
  

