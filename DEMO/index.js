//Importer les librairies exportées du fichier calculatrice.js

// import {add, div, sub, mult} from "./calculatrice.js"; quand on est sur un framework ou qu'on utilise des modules

const calc = require("./calculatrice.js")
calc.add(20, 32)
calc.div(2, 0)