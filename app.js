"use strict";

const {body, validationResult} = require("express-validator");
const express = require("express");
const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
const {v4: uuidv4} = require("uuid");
const {MongoClient} = require("mongodb");
const mongoose = require("mongoose");
const {name} = require("ejs");

const uri = "mongodb://localhost:27017/cities_app";
const client = new MongoClient(uri);
const db = client.db("cities_app");
mongoose
    .connect(uri)
    .then(() => {
        console.log("Connecté à Mongo");
    })
    .catch((err) => {
        console.log("erreur de connexion : ", err);
    });

const City = mongoose.model("City", {
    name: String,
    uuid: String,
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
    },
});

const Country = mongoose.model("Country", {
    name: String,
    uuid: String,
    cities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
        },
    ],
});

const Role = mongoose.model("Role", {
    roleName: String,
    uuid: String,
    personne: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Personne"
        }
    ]
})

const Personne = mongoose.model("Personne", {
    name: String,
    uuid: String,
    role: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }]
})

async function database() {
    await Country.deleteMany();
    await City.deleteMany();
    await Personne.deleteMany();
    await Role.deleteMany();

    const admin = new Role({
        roleName: "admin",
        uuid: uuidv4(),
    })

    const dev = new Role({
        roleName: "dev",
        uuid: uuidv4(),
    })

    const user = new Role({
        roleName: "user",
        uuid: uuidv4(),
    })

    const roger = new Personne({
        name: "Roger",
        uuid: uuidv4(),
        role: user._id
    })
    await roger.save();

    const bernard = new Personne({
        name: "Bernard",
        uuid: uuidv4(),
        role: user._id
    })
    await bernard.save();

    const jeanClaude = new Personne({
        name: "Jean-Claude",
        uuid: uuidv4(),
        role: user._id
    })
    await jeanClaude.save();

    const mael = new Personne({
        name: "Mael",
        uuid: uuidv4(),
        role: dev._id
    })
    await mael.save();

    const arthur = new Personne({
        name: "Arthur",
        uuid: uuidv4(),
        role: dev._id
    })
    await arthur.save();

    const baptiste = new Personne({
        name: "Baptiste",
        uuid: uuidv4(),
        role: dev._id
    })
    await baptiste.save();

    const david = new Personne({
        name: "David",
        uuid: uuidv4(),
        role: dev._id
    })
    await david.save();

    const kevin = new Personne({
        name: "Kevin",
        uuid: uuidv4(),
        role: admin._id
    })
    await kevin.save();

    const manuMacron = new Personne({
        name: "Emmanuel Macron",
        uuid: uuidv4(),
        role: admin._id
    })
    await manuMacron.save();

    admin.personne.push(manuMacron, kevin);
    dev.personne.push(baptiste, arthur, mael, david);
    user.personne.push(roger, bernard, jeanClaude);

    await admin.save();
    await user.save();
    await dev.save();

    const france = new Country({
        name: "France",
        uuid: uuidv4(),
    });
    const toulouse = new City({
        name: "Toulouse",
        uuid: uuidv4(),
        country: france._id,
    });
    await toulouse.save();
    const rennes = new City({
        name: "Rennes",
        uuid: uuidv4(),
        country: france._id,
    });

    const ecosse = new Country({
        name: "Ecosse",
        uuid: uuidv4()
    })

    const edimbourg = new City({
        name: 'Edimbourg',
        uuid: uuidv4(),
        country: ecosse._id
    })

    const glasgow = new City({
        name: 'Glasgow',
        uuid: uuidv4(),
        country: ecosse._id
    })


    await edimbourg.save();
    await glasgow.save();
    ecosse.cities.push(edimbourg, glasgow);
    await ecosse.save();

    await rennes.save();
    france.cities.push(toulouse);
    france.cities.push(rennes);
    await france.save();


    // await City.aggregate([
    //     {
    //         $lookup: {
    //             from: "countries",
    //             localField: "country",
    //             foreignField: "_id",
    //             as: "countryData",
    //         },
    //     },
    //     {
    //         $unwind: "$countryData",
    //     },
    // ]).then((cities) => {
    //     console.log("cities: ", cities);
    // });
}

database();

client
    .connect()
    .then(() => {
        console.log("Connexion réussie");
    })
    .catch((err) => {
        console.log("Connexion echouée: ", err);
    });

app.use((req, res, next) => {
    console.log(
        "method: ",
        req.method,
        " url: ",
        req.url,
        "user-agent: ",
        req.get("User-Agent"),
    );
    next();
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/personne", async (req, res) => {
    // Personne.find().then((personne) => {
    //     res.render("personne/index", {personne: personne});
    // })

    await Personne.aggregate([
        {
            $lookup: {
                from: "roles",
                localField: "role",
                foreignField: "_id",
                as: "role",
            }
        },
        {
            $unwind: "$role"
        },
    ]).then((people) => {
        res.render("personne/index", {personne: people});
    })
})

app.get("/personne/:uuid/roles", async (req, res) => {
    const role = await Role.findOne({uuid: req.params.uuid});
    await Personne.aggregate([
        {
            $lookup: {
                from: "roles",
                localField: "role",
                foreignField: "_id",
                as: "role",
            }
        },
        {
            $unwind: "$role"
        },
        {
            $match: {"role.uuid": req.params.uuid}
        },

    ]).then((personnes) => {
        res.render('personne/roles', {role: role, personnes: personnes})
    })
})


app.get("/cities", (req, res) => {
    City.find().then((cities) => {
        res.render("cities/index", {cities: cities});
    });
});

app.get("/countries", async (req, res) => {
    Country.find().then((countries) => {
        res.render("countries/index", {countries: countries});
    });
});

app.get("/countries/:uuid/cities", async (req, res) => {
    const country = await Country.findOne({uuid: req.params.uuid});
    await City.aggregate([
        {
            $lookup: {
                from: "countries",
                localField: "country",
                foreignField: "_id",
                as: "country",
            }
        },
        {
            $unwind: "$country"
        },
        {
            $match: {"country.uuid": req.params.uuid}
        },

    ]).then((cities) => {
        console.log("Countrycities :", cities)
        res.render('countries/cities', {cities: cities, country: country})
    });
})

app.post(
    "/cities",
    body("city")
        .isLength({min: 3})
        .withMessage("City must be at least 3 characters long"),
    async (req, res) => {
        const errors = validationResult(req);

        await City.find().then((cities) => {
            if (!errors.isEmpty()) {
                return res.status(422).render("cities.ejs", {
                    errors: errors.array(),
                    cities: cities,
                    city: req.body.city,
                });
            }
            City.create({
                name: req.body.city,
                uuid: uuidv4(),
            });
            res.redirect("/cities");
        });
    },
);

app.get("/cities/:uuid", (req, res) => {
    City.findOne({uuid: req.params.uuid})
        .populate("country")
        .then((city) => {
            if (city) {
                res.render("cities/city", {city: city});
            } else {
                res.status(404).send("Pas de ville avec cet uuid");
            }
        });
});

app.post("/cities/:uuid/delete", async (req, res) => {
    await City.findOneAndDelete(
        {uuid: req.params.uuid},
        {name: req.body.city},
    );
    res.redirect("/cities");
});

app.post("/cities/:uuid/update", async (req, res) => {
    await City.findOneAndUpdate(
        {uuid: req.params.uuid},
        {name: req.body.city},
    );

    res.redirect("/cities");
});

app.use((req, res) => {
    res.status(404).send("404 :page non trouvée");
});

app.listen(port, () => {
    console.log("l'api ecoute sur le port : ", port);
});
