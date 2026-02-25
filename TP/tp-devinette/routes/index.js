var express = require('express');
var router = express.Router();
const {body, validationResult} = require("express-validator");

//Création du nb aléatoire
function entierAleatoire(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let nbAlea = entierAleatoire(1, 100);

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: "Le turbo devinator de l'espace"});
});

router.post('/devine', body("devine").isInt().withMessage("Saisissez un nombre !"),
    body("devine").custom((value) => {
        if (parseInt(value) === nbAlea) {
            throw new Error("Bravo !")//renvoie le message
        }
        return true; // Pour passer à la vérif suivante si le if est faux
    }), body("devine").custom((value) => {
        if (parseInt(value) > nbAlea) {
            throw new Error("trop haut !")
        }
        return true;
    }), body("devine").custom((value) => {
        if (parseInt(value) < nbAlea) {
            throw new Error("Trop bas !")
        }
        return true;
    }), (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render("index.ejs", {
                title: "Express Brains",
                errors: errors.array(),
                guess: req.body.guess,
            });
        }
        res.redirect("/");
    }
)

// , body("devine").custom((value) => { if (parseInt(value) === nbAlea) {throw new Error("Bravo !")}})
//Custom permet de créer une fonction pour définir un comportement.
//On récupère la value de l'input html, qu'on parse en int et qu'on compare à nbAlea : en cas d'égalité, on renvoie un message bravo.


module.exports = router;