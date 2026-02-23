let cities = "Rennes, Nantes, Quimper";
cities = cities.split(', '); //transforme la String en tableau

console.log(cities);
//
console.log(cities.map((city)=>city.toUpperCase()));
