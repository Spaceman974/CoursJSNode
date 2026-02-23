const fs = require('fs'); //Va chercher la librairie fs


//fonction de lecture de fichier
function readCities(){

    let cities = "";

    try{
        //On lit le fichier cities.csv et on stock le resultat dans la variable cities
        cities = fs.readFileSync("cities.csv", "utf8"); //Fonction de la librairie fs qui permet de lire un fichier. On lui fournit l'emplacement et l'encodage
    } catch (err){
        //Ici on va gérer le cas ou le fichier est introuvable (code particulier qui s'appelle ENOENT
        if(err.code==='ENOENT'){
            console.error("Le fichier n'existe pas.");
        } else { //Erreur par défaut, on affiche juste le message d'erreur
            console.error(err)
        }

    }
    return cities.split("\n");
}

let cities = ["Nantes", "Rennes", "Quimper", "Paris", "Prout-sur-Pouet"]

//Création d'un nouveau fichier depuis le code :
fs.writeFileSync("cities.csv", cities.join("\n"))//fonction de la librairie fs, avec paramètres : nom + à la ligne à chaque séparateur.

//On vide la variable et on stock le résultat du fichier créé précédemment dedans.
cities = readCities();
cities.forEach(city => console.log("ville : "+ city));


//modifier un fichier existant :
fs.appendFileSync("cities.csv", "\nLorient", "utf8")//En param : nom du fichier, la donnée à rajouter et l'encodage

cities = readCities();
cities.forEach(city => console.log("ville : "+ city));