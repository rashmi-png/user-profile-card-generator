const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;
const db = new sqlite3.Database("./profiles.db");

db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        bio TEXT,
        skills TEXT,
        github TEXT,
        linkedin TEXT
    )
`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/profile", (req, res) => {
    const { name, bio, skills, github, linkedin } = req.body;

    db.run(
        `INSERT INTO profiles (name, bio, skills, github, linkedin)
         VALUES (?, ?, ?, ?, ?)`,
        [name, bio, skills, github, linkedin],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send("Error saving profile");
            }

            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Profile Card</title>
                    <link rel="stylesheet" href="/css/style.css">
                </head>

                <body>
                    <h1>User Profile Card</h1>

                    <div class="profile-card">
                        <h2>${name}</h2>
                        <p>${bio}</p>

                        <h3>Skills</h3>
                        <p>${skills}</p>

                        <h3>Social Links</h3>
                        <p>GitHub: ${github}</p>
                        <p>LinkedIn: ${linkedin}</p>
                    </div>

                    <br>
                    <a href="/">Create Another Profile</a>
                </body>
                </html>
            `);
        }
    );
});
app.get("/profiles", (req, res) => {
    db.all("SELECT * FROM profiles", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error retrieving profiles");
        }

        let profilesHTML = rows.map(profile => `
            <div class="profile-card">
                <h2>${profile.name}</h2>
                <p>${profile.bio}</p>
                <h3>Skills</h3>
                <p>${profile.skills}</p>
                <p>GitHub: ${profile.github}</p>
                <p>LinkedIn: ${profile.linkedin}</p>
                <form action="/delete/${profile.id}" method="POST">
    <button type="submit">Delete Profile</button>
</form>
            </div>
            <br>
        `).join("");

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Saved Profiles</title>
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body>
                <h1>Saved Profiles</h1>
                ${profilesHTML}
                <a href="/">Create New Profile</a>
            </body>
            </html>
        `);
    });
});
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;

    db.run("DELETE FROM profiles WHERE id = ?", [id], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).send("Error deleting profile");
        }

        res.redirect("/profiles");
    });
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});