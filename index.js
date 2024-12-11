const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const fs = require("node:fs");
const registeredUsers = require("./db/users.json");
const blogs = require("./db/blogs.json");
const { authenticator } = require("otplib");
const qrcode = require("qrcode");

const filePathBlog = path.join(__dirname, "db", "blogs.json");
let blogCache = blogs;

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "Message secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    store: new FileStore({ path: "./sessions" }),
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

const isAuthenticated = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

const loadBlogsCache = () => {
  console.log("Chargement du cache");
  fs.readFile(filePathBlog, "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      blogCache = JSON.parse(data);
    }
  });
};

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  if (!req.session.user) {
    return res.sendFile(path.join(__dirname, "public", "login_form.html"));
  } else {
    return res.sendFile(path.join(__dirname, "public", "blog.html"));
  }
});

app.post("/login", (req, res) => {
  const mail = req.body.mail;
  const password = req.body.password;
  if (
    registeredUsers.users.find(
      (user) => user.email === mail && user.password === password
    )
  ) {
    req.session.loggedIn = true;
    req.session.user = mail;
    req.session.save((err) => {
      if (err) {
        return res.status(500).send("Erreur serveur");
      }
      res.redirect("/blog");
    });
  } else {
    res.status(401).send("Identifiants incorrects");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/blog", isAuthenticated, (req, res) => {
  loadBlogsCache();
  return res.sendFile(path.join(__dirname, "public", "blog.html"));
});

app.post("/blog", isAuthenticated, (req, res) => {
  if (!req.session.twoFactorAuthenticated) {
    res.redirect("/activate2AF");
  } else {
    const rawData = fs.readFileSync(filePathBlog);
    let blogJson = JSON.parse(rawData);
    let blogs = blogJson.blogs;
    blogs.forEach((blog) => {
      if (blog.id == req.body.id) {
        console.log("Entrée dans le if");
        blog.title = req.body.title;
        blog.content = req.body.content;
        blog.status = "public";
      }
    });
    fs.writeFileSync(filePathBlog, JSON.stringify(blogJson));
    res.redirect("/blog");
  }
});

app.get("/private", isAuthenticated, (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "private.html"));
});

app.get("/activate2AF", isAuthenticated, (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "activate2AF.html"));
});

app.post("/activate2AF", isAuthenticated, (req, res) => {
  const token = req.body.token;
  const username = req.session.user;
  const guessableFileName = Buffer.from(username)
    .toString("base64")
    .substring(0, 6);
  const directoryName = path.join(__dirname, "db", "otpkeys");
  if (!fs.existsSync(directoryName)) {
    fs.mkdirSync(directoryName);
  }
  const authenticatorSecret = fs.readFileSync(
    path.join(directoryName, guessableFileName),
    "utf-8"
  );
  const isValid = authenticator.check(token, authenticatorSecret);
  if (isValid) {
    req.session.twoFactorAuthenticated = true;
    res.redirect("/blog");
  }
});

app.get("/qrcode", isAuthenticated, (req, res) => {
  const username = req.session.user;
  const service = "ProjetDevAuth";
  const secret = authenticator.generateSecret();
  const guessableFileName = Buffer.from(username)
    .toString("base64")
    .substring(0, 6);
  const directoryName = path.join(__dirname, "db", "otpkeys");
  if (!fs.existsSync(directoryName)) {
    fs.mkdirSync(directoryName);
  }
  fs.writeFileSync(path.join(directoryName, guessableFileName), secret);
  const keyURI = authenticator.keyuri(username, service, secret);
  qrcode.toDataURL(keyURI, (err, data_url) => {
    if (err) {
      return res.status(500).send("Erreur serveur");
    }
    res.json({ qrCodeData: data_url });
  });
});

app.get("/pubicBlogs", (req, res) => {
  loadBlogsCache();
  //const publicBlogs = blogs.blogs.filter((blog) => blog.status === "public");
  const publicBlogs = blogCache.blogs.filter(
    (blog) => blog.status === "public"
  );
  res.json(publicBlogs);
});

app.get("/privateBlogs", (req, res) => {
  loadBlogsCache();
  //const privateBlogs = blogs.blogs.filter((blog) => blog.status === "privé");
  const privateBlogs = blogCache.blogs.filter(
    (blog) => blog.status === "privé"
  );
  res.json(privateBlogs);
});

app.get("/personnalBlogs", isAuthenticated, (req, res) => {
  loadBlogsCache();
  const personnalBlogs = blogs.blogs.filter(
    (blog) => blog.author === req.session.user
  );
  res.json(personnalBlogs);
});

app.listen(3000, () => {
  console.log("👌 Server is running on port 3000");
});
