const http = require("http"); // Constante qui va faire le lien avec le package

const hostName = "127.0.0.1"; //ici on donne l'adresse IP du serveur à contacter (la machine qui porte le serveur)
const port = 3000;// et son port

// Création du serveur
const server = http.createServer( (req, res) => {
    //Réponse :
    res.statusCode = 200; // Statut de la réponse
    res.setHeader("Content-Type", "text/plain") // En-tête de la réponse en format texte
    res.end("Hello World")//Corp de la réponse
} );

//Permet de lancer le serveur
server.listen(port, hostName, () => {
    console.log(`Le serveur est en cours sur http://${hostName} : ${port}`)//Juste pour renvoyer un msg de validation lors du lancement.
})