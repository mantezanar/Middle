//Configuracion de Supabase
/*import { createClient } from "@supabase/supabase-js";
import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { GoTrueClient } from '@supabase/gotrue-js';


const supabaseUrl = "https://tzscatlgcubfpvmcykrh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2NhdGxnY3ViZnB2bWN5a3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODE2MDQ0NDksImV4cCI6MTk5NzE4MDQ0OX0.X4va-55G7_wn7BFWSCNOQQH6S6mUdT8aJGcsyy8MLhs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/api", (req, res) => {
    res.json({
        mensaje: "Estas en la api, debes ir a /login o /posts",
    });
});

app.post("/api/login",  (req, res) => {
    
    const user = {
        id: 1,
        nombre: "Katia",
        email: "katialayi@gmail.com"
    }
    jwt.sign({user: user}, 'secretkey', {expiresIn: '50s'}, (err, token) => {
        res.json({
            token
        });
    });
});

app.post("/api/posts", verifyToken, async (req, res) => {
    const { email, password } = req.body;

    const { user, session, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error || !user) {
        res.status(401).send({ error: "Autenticación fallida" });
        return;
    }
    // En este punto, el token es válido y los datos del usuario están en req.userData
    // Redirecciona al lobby
    res.redirect("/Lobby");
});

async function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;

        // Verifica el token de Supabase
        const { data: user, error } = await supabase.auth.api.getUser(
            bearerToken
        );

        if (error || !user) {
            res.status(403).send({ error: "Token inválido" });
            return;
        }

        // Almacena los datos del usuario en la solicitud para su uso posterior
        req.userData = {
            id: currentUser.id,
            email: currentUser.email,
        };
        next();
    } else {
        res.status(403).send({ error: "Token inválido" });
    }
}

app.listen(3000, function () {
    console.log("Esta corriendo :)");
});

/*app.post("/api/login", (req, res) => {
    const user = {
        id: 1,
        nombre: "Katia",
        email: "katialayi@gmail.com"
    }
    jwt.sign({user: user}, 'secretkey', {expiresIn: '50s'}, (err, token) => {
        res.json({
            token
        });
    });
})
*/