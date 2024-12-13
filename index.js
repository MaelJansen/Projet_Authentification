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
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const JWT_SECRET = "mysecretkey";

const filePathBlog = path.join(__dirname, "db", "blogs.json");
const filePathUser = path.join(__dirname, "db", "users.json");
let blogCache = blogs;
let userCache = registeredUsers;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
  const token = req.session?.token;
  if (!token) {
    return res.sendFile(path.join(__dirname, "public", "login_form.html"));
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.sendFile(path.join(__dirname, "public", "login_form.html"));
    }
    next();
  });
};

const loadBlogsCache = () => {
  fs.readFile(filePathBlog, "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      blogCache = JSON.parse(data);
    }
  });
};

const getUserFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.user;
  } catch (err) {
    return null;
  }
};

const getActivated2AFFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.active2AF;
  } catch (err) {
    return null;
  }
};

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", isAuthenticated, (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "blog.html"));
});

app.post("/login", (req, res) => {
  const mail = req.body.mail;
  const password = req.body.password;
  const user = userCache.users.find(
    (user) => user.email === mail && user.password === password
  );
  if (user) {
    const token = jwt.sign(
      { user: user.email, active2AF: user.active2AFs },
      JWT_SECRET
    );
    req.session.token = token;
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

app.get("/register", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "register_form.html"));
});

app.post("/register", (req, res) => {
  const mail = req.body.mail;
  const password = req.body.password;
  const user = userCache.users.find((user) => user.email === mail);
  if (user) {
    return res.status(400).send("L'utilisateur existe déjà");
  }
  userCache.users.push({ email: mail, password: password, active2AF: false });
  fs.writeFileSync(filePathUser, JSON.stringify(userCache));
  blogCache.blogs.push({
    id: blogCache.blogs.length + 1,
    author: mail,
    title: "",
    content: "",
    status: req.body.status,
  });
  fs.writeFileSync(filePathBlog, JSON.stringify(blogCache));
  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "logout.html"));
});

app.get("/logoutThisEquipment", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

app.post("/logoutAllEquipments", async (req, res) => {
  //partie 1 : invalider les jwt.
  if (req.user) {
    registeredUsers.users = registeredUsers.users.map((u) =>
      u.email === req.user.email
        ? { ...u, sessionVersion: u.sessionVersion + 1 }
        : u
    );

    fs.writeFileSync(filePathUser, JSON.stringify(registeredUsers, null, 2));
  }

  //partie 2 : suppression de la session
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

app.get("/blog", isAuthenticated, (req, res) => {
  loadBlogsCache();
  return res.sendFile(path.join(__dirname, "public", "blog.html"));
});

app.post("/blog", isAuthenticated, (req, res) => {
  const active2AF = getActivated2AFFromToken(req.session.token);
  if (!res.cookie("2AF") && !active2AF) {
    res.redirect("/activate2AF");
  } else {
    const rawData = fs.readFileSync(filePathBlog);
    let blogJson = JSON.parse(rawData);
    let blogs = blogJson.blogs;
    blogs.forEach((blog) => {
      if (blog.id == req.body.id) {
        blog.title = req.body.title;
        blog.content = req.body.content;
      }
    });
    fs.writeFileSync(filePathBlog, JSON.stringify(blogJson));
    res.redirect("/");
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
  //const username = req.cookies?.mail;
  const username = getUserFromToken(req.session.token);
  if (!username) {
    return res
      .status(401)
      .send(
        "Vous devez être connecté pour activer l'authentification à deux facteurs"
      );
  }
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
    res.cookie("2AF", "true");
    req.session.active2AF = true;
    req.session.save((err) => {
      const user = userCache.users.find((user) => user.email === username);
      user.active2AF = true;
      fs.writeFileSync(filePathUser, JSON.stringify(userCache));
      res.redirect("/blog");
    });
  }
});

app.get("/qrcode", isAuthenticated, (req, res) => {
  const username = getUserFromToken(req.session.token);
  if (!username) {
    return res
      .status(401)
      .send(
        "Vous devez être connecté pour activer l'authentification à deux facteurs"
      );
  }
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

app.get("/privateBlogs", isAuthenticated, (req, res) => {
  loadBlogsCache();
  const privateBlogs = blogCache.blogs.filter(
    (blog) => blog.status === "privé"
  );
  res.json(privateBlogs);
});

app.get("/personnalBlogs", isAuthenticated, (req, res) => {
  loadBlogsCache();
  const personnalBlogs = blogCache.blogs.filter(
    (blog) => blog.author === getUserFromToken(req.session.token)
  );
  if (!personnalBlogs) {
    return res.status(404).send("Pas de blog trouvé");
  }
  res.json(personnalBlogs);
});

app.listen(3000, () => {
  console.log("👌 Server is running on port 3000");
});
