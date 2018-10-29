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
    
- place
    - placeid
    - placeName
    - placeDescription
    - placeGeolocalisation
    - placePicture
    - placeCreationDate
    - placeLastModDate
    
    
-----------------------------------------------------------------

Routes :

- GET (Retrieve data)
    - /users
    - /trips
    - /places

    - /user/trips ((get all trips of a user))
    - /trip/places ((get all places of a trip))
    
    - /user/userid
    - /trip/tripid
    - /place/placeid

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

QUESTIONS :

- userid / tripid / placeid: Est-il utile de créer manuellement les ID's ?
    - Pour avoir un élément unique
    - Pour travailler avec des ID's simples
    - Si non; comment est-ce qu'on peut travailler avec les ID's automatiquement ? (routes)
    
- Expliquer "Unique Validator" => user.js / trip.js / place.js
    - Est-il permis d'utiliser: npm install mongoose-unique-validator?
      => var uniqueValidator = require('mongoose-unique-validator');
         userSchema.plugin(uniqueValidator);

- Comment on intègre photo et geolocalisation dans le schema?

- Où est-ce qu'on peut tester les conditions définies ?

- Comment on écrit DELETE et PATCH? 
- Comment on écrit les deux derniers GET?

- Quelles sont les étapes prochaines?