"use strict"
//Gérer les chemins d'images
const path = require("path");

//Import d'express-validator, pour les regex
const {body, validationResult} = require("express-validator");
//Import d'express
const express = require("express");
// créer une instance d'express
const app = express();
// Dit à Nodemon regarder les fichiers '.ejs'
app.set("view engine", "ejs");
// Gère l'encodage url
app.use(express.urlencoded({extended: true}));

//------------------------------------------------------------------------------
//Import de la librairie UUID pour le hash d'ID
const {v4: uuidv4} = require("uuid");
//Import de la libraire MongoDB
const {MongoClient} = require("mongodb");

//Gestion de la connexion à la BDD : on dit qu'on veut du mongoDB, qu'on cherche l'adresse localhost et que le port est 27017
const uri = "mongodb://localhost:27017/cities_app";
//instanciation du client : permet d'intérroger MongoDB
const client = new MongoClient(uri);
//Base de donnée à atteindre : cities_app qu'on a créé préalablement dans MongoDB
const db = client.db("cities_app")

//Vérification de la connexion au lancement de l'app
client.connect().then(
    () => {
        console.log("Connexion réussie")
    }
).catch((err) => {
    console.log("Connexion échouée: ", err)
})
//-----------------------------------------------------------------------------
const port = 3000;
//ou est-ce qu'on va chercher son image
app.use(express.static("public"));


//Middleware pour valider la requête, gérer authentification, les logs, etc.
app.use((req, res, next) => {
    console.log(
        "method : ", req.method,
        " url : ", req.url,
        " user-agent : ", req.get("User-Agent"));
    next(); //next dit : une fois que app.use est fini, tu peux traiter la requête
});

app.get('/', (req, res) => {
    res.send("Hello World")
})//route par défaut, accueil du site. En gros : sur la route '/' voilà la requête et va me chercher la réponse

const cities = ["Nantes", "Rennes", "Paris", "Lorient", "Bordeaux"];


//récupération des données de cities.
app.get('/cities', (req, res) => {
    // res.send(cities.join(', ')) (sans fichier ejs)
    res.render("cities/index", {cities: cities}) //Pour lui dire que la variable cities est celle qu'on a déclaré juste avant
    //et qu'on va l'envoyer dans le fichier index.ejs
})

//gestion d'envoi du formulaire
app.post("/cities",
    body('city') //Avant de push, on va vérifier que le corps de la requête correspond bien à ce qu'on attends
        .isLength({min: 3, max: 255})
        .withMessage("le nom de ville doit être compris entre 3 et 255 caractères"),
    (req, res) => {
        const errors = validationResult(req)//Est-ce qu'on a des messages d'erreur

        //Si j'ai des erreurs, renvoie le fichier cities.ejs avec le message d'erreur
        if (!errors.isEmpty()) {
            return res.status(422).render('cities.ejs', {
                errors: errors.array(),
                cities: cities,
                city: req.body.city
            })
        }
        cities.push(req.body.city)//on va chercher l'input du form dans le corps de la requête, donc req.body
        // le '.city' vient du name de l'input.
        res.redirect("/cities") //Une fois le push fait, on rafraichit la page.
    })


//Récupération de l'id et d'une seule ville
app.get('/cities/:id', (req, res) => {
    if (req.params.id < 1 || req.params.id > cities.length) {
        return res.status(404).send("ville non trouvée")
    }
    res.send(cities[req.params.id - 1])
})

//Si la page est non trouvée
app.use((req, res) => {
    res.status(404).send("404 : page non trouvée")
})

//Lancement du serveur
app.listen(port, () => {
    console.log("l'api écoute sur le port : " + port)
}) //On va écouter le port et on renvoie une fonction anonyme avec un log pour informer que l'API fonctionne