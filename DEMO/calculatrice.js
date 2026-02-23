function add(a, b){
    return a + b;
}

function sub (a, b){
    return a - b;
}

function mult(a, b){
    return a * b;
}

function div (a, b){
    if(b===0){
        throw new error("la division par 0 n'est pas autorisée")
    }
    return a / b;
}

//Pour exporter les fonctions de notre fichier
module.exports = {
    add,
    sub,
    mult,
    div
}