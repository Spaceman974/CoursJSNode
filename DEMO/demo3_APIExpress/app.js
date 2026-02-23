"use strict"

//Import d'express
const express = require("express");
const app = express();// créer une instance d'express
const port = 3000;


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
    res.send(cities.join(', '))
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