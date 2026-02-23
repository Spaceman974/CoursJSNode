"use strict"
//génère une érreur en cas de variable non déclarée,
//utilisation de this dans une fonction qui n'a pas de contexte

//Importer les librairies exportées du fichier calculatrice.js
// import {add, div, sub, mult} from "./calculatrice.js"; quand on est sur un framework ou qu'on utilise des modules
const calc = require("./calculatrice.js")


//utilisation des fonctions
calc.add(20, 32)
calc.div(2, 0)