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
//import de mongoose
const mongoose = require('mongoose');

//Gestion de la connexion à la BDD : on dit qu'on veut du mongoDB, qu'on cherche l'adresse localhost et que le port est 27017
const uri = "mongodb://localhost:27017/cities_app";
//instanciation du client : permet d'intérroger MongoDB
const client = new MongoClient(uri);
//Base de donnée à atteindre : cities_app qu'on a créé préalablement dans MongoDB
const db = client.db("cities_app")

//connexion à l'ODM
mongoose.connect(uri).then(() => {
    console.log('connecté à Mongo')
}).catch((err) => {
    console.log('erreur de connexion : ', err);
});
//création du modèle de donné pour mongoose
const City = mongoose.model("City", {
    name: String,
    uuid: String,
    country: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    }]
});

//Création d'un deuxième model pour les relations entre objets (il référence le premier)
const Country = mongoose.model("Country", {
    name: String,
    uuid: String,
    cities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "City"
    }]
})

async function database() {
    //On vide la fonction pour le mock
    await Country.deleteMany();
    await City.deleteMany();

    //instanciation d'un nouveau pays et sauvegarde en BDD à la main
    const france = new Country({
        name: 'France',
        uuid: uuidv4(),
    })


//instanciation d'une ville et sauvegarde en BDD à la main
    const toulouse = new City({
        name: 'Toulouse',
        uuid: uuidv4(),
        country: france._id,
    })

    const rennes = new City({
        name: 'Rennes',
        uuid: uuidv4(),
        country: france._id,
    })
    await rennes.save();
    await toulouse.save();
    france.cities.push(toulouse, rennes)//On passe toulouse en param de cities de france
    await france.save();

    //Jointure mais gourmand en ressources
    Country.findOne({name: 'France'})
        .populate("cities")//Jointure NoSQL => on cherche un pays france et on joint la table cities pour celles qui existent pour ne pas avoir [Object object]
        .then((country) => {
            // console.log("Country : ", country);
            // console.log("Country cities : ", country.cities)
        }).catch((err) => {
        console.log("pas de pays : ", err)
    })

    //agrégat et jointures filtrées : on facilite la jointure
    await City.aggregate([
        {
            $lookup: {
                from: 'countries', //from -> table qu'on veut joindre
                localField: 'country', //locafield -> colonne de City qui fait la jointure
                foreignField: '_id', //foreignField -> comment le retrouver dans la table
                as: 'countryData'//as -> alias
            },
        }, {
            $unwind: //Permet d'applatir l'objet pour qu'il s'affiche
                '$countryData'
        }
    ]).then((cities) => {
        console.log("cities: ", cities)
    })
}

database();


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

//Suppression du tableau mock et utilisation de la BDD
//const cities = ["Nantes", "Rennes", "Paris", "Lorient", "Bordeaux"];


//récupération des données de cities.
app.get('/cities', (req, res) => {
    //On va chercher dans la base de donnée (qu'on transforme en tableau plutôt que dans le tableau mock :
    db.collection('cities')
    City.find().then(//On appelle le modèle de Mongoose
        (cities) => {
            // res.send(cities.join(', ')) (sans fichier ejs)
            res.render("cities/index", {cities: cities}) //Pour lui dire que la variable cities est celle qu'on a déclaré juste avant
            //et qu'on va l'envoyer dans le fichier index.ejs
        }
    )


})

//gestion d'envoi du formulaire
app.post("/cities",
    body('city') //Avant de push, on va vérifier que le corps de la requête correspond bien à ce qu'on attends
        .isLength({min: 3, max: 255})
        .withMessage("le nom de ville doit être compris entre 3 et 255 caractères"),
    async (req, res) => { //précise que c'est une fct asynch pour l'ajout dans la BDD NoSQL
        const errors = validationResult(req)//Est-ce qu'on a des messages d'erreur

        //Si j'ai des erreurs, renvoie le fichier cities.ejs avec le message d'erreur
        await City.find().then((cities) => {
            if (!errors.isEmpty()) {
                return res.status(422).render('cities.ejs', {
                    errors: errors.array(),
                    cities: cities,
                    city: req.body.city
                });
            }
            //A supprimer quand on passe du tableau mock à la BDD pour l'ajout en Base DD
            //cities.push(req.body.city)//on va chercher l'input du form dans le corps de la requête, donc req.body
            // le '.city' vient du name de l'input.

            //création de la table MongoDB -> ici on a une promesse qui peut prendre du temps : donc await (cf async au dessus)
            //await db.collection('cities').insertOne({ //syntaxe sans mongoose

            City.create({//syntaxe avec mongoose
                name: req.body.city, //objet à rajouter dans la table
                uuid: uuidv4(), //id de l'objet
            });
            res.redirect("/cities") //Une fois le push fait, on rafraichit la page.
        })
    })


//Récupération de l'id et d'une seule ville
app.get('/cities/:uuid', (req, res) => {
    //On interroge la BDD pour trouver les villes dont l'uuid correspond à celui passé en paramètre de la requête http
    db.collection('cities').findOne({uuid: req.params.uuid}).then((city) => {
        if (city) { //Si on a une ville, fait du rendu à partir de l'html passé en param (cities/city)
            res.render('cities/city', {city: city})
        } else {
            res.status(404).send('Pas de ville avec cet uuid')
        }
    })
//On supprime ce qui était mis en place pour la tableau mock
    // if (req.params.id < 1 || req.params.id > cities.length) {
    //     return res.status(404).send("ville non trouvée")
    // }
    // res.send(cities[req.params.id - 1])
})

//Route pour la suppression
app.post('/cities/:uuid/delete', async (req, res) => {
    await City.findOneAndDelete(
        {uuid: req.params.uuid},
        {name: req.body.city}
    );
    res.redirect("/cities");

//Syntaxe sans Mongoose
    // await db.collection('cities').deleteOne(
    //     {uuid: req.params.uuid}).then((response) => {
    //     if (response.deletedCount === 1) { //Si on a bien un objet supprimé, on redirige vers cities
    //         res.redirect('/cities');
    //         console.log("coucou")
    //     } else {
    //         res.status(404).send('Pas de ville à supprimer avec cet uuid')
    //     }
    // }
})

//Route de l'update
app.post('/cities/:uuid/update', async (req, res) => {

        await City.findOneAndUpdate(
            {uuid: req.params.uuid},
            {name: req.body.city}
        )
        res.redirect("/cities");

        //Syntaxe sans Mongoose
        // await db.collection('cities').updateOne(
        //     {uuid: req.params.uuid},
        //     {$set: {name: req.body.city}}
        // );
        // res.redirect('/cities');
    }
)

//Si la page est non trouvée
app.use((req, res) => {
    res.status(404).send("404 : page non trouvée")
})

//Lancement du serveur
app.listen(port, () => {
    console.log("l'api écoute sur le port : " + port)
}) //On va écouter le port et on renvoie une fonction anonyme avec un log pour informer que l'API fonctionne