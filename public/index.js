const header = document.getElementById("header");
const footer = document.getElementById("footer");
const publicBlogs = document.getElementById("public-blogs-container");
const privateBlogs = document.getElementById("private-blogs-container");
const afDiv = document.getElementById("2AF-content");

const createHeader = () => {
  header.innerHTML = `
      <header>
        <div class="menu">
          <a class="title" href="/">BLOG</a>
          <div>
            <nav>
              <a href="/">Public</a>
              <a href="/private">Privé</a>
            </nav>
          </div>
        </div>
        <div>
          <a href="/blog">Mon espace</a>
        </div>
      </header>
    `;
};

const createFooter = () => {
  footer.innerHTML = `
      <footer>Projet dev Auth</footer>
    `;
};

const createPublicBlogs = () => {
  if (!publicBlogs) return;
  fetch("/pubicBlogs")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((element) => {
        publicBlogs.innerHTML += `
        <div class="blog">
            <div class="blog-header">
                <h2>${element.title}</h2>
                <p class="blog-status-public">${element.status}</p>
            </div>
            <p>Auteur : ${element.author}</p>
            <span><h4>Résumer du blog : </h4>${element.content}</span>
            <a href="">Lire la suite</a>
        </div>
    `;
      });
    });
};

const createPrivateBlogs = () => {
  if (!privateBlogs) return;
  fetch("/privateBlogs")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((element) => {
        privateBlogs.innerHTML += `
        <div class="blog">
            <div class="blog-header">
                <h2>${element.title}</h2>
                <p class="blog-status-private">${element.status}</p>
            </div>
            <p>Auteur : ${element.author}</p>
            <span><h4>Résumer du blog : </h4>${element.content}</span>
            <a href="">Lire la suite</a>
        </div>
    `;
      });
    });
};

const fetchQRCode = () => {
  fetch("/qrcode")
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const QRCode = document.getElementById("QRCode");
      QRCode.innerHTML = "";
      QRCode.innerHTML += `<p>Scannez le QRCode ci-dessous avec votre application d'authentification</p>`;
      QRCode.innerHTML += `<img src="${data.qrCodeData}" alt="QRCode" />`;
    });
};

const createAFDiv = () => {
  if (!afDiv) return;
  afDiv.innerHTML = `
      <div class="2AF-content">
        <h3>2AF</h3>
        <p>Entrer le code donner par votre application d'authentification</p>
        <form method="POST" id="AFForm">
            <label for="token">Code secret TOTP</label>
            <input type="number" name="token" id="token">
            <input type="submit" value="Valider">
        </form>
        <div id="errorMessage"></div>
        <div>
          <h3>Si vous n'avez pas encore activé la 2AF : </h3>
          <button onclick="fetchQRCode()">Activer la 2AF</button>
          <div id="QRCode"></div>
        </div>
      </div>
    `;
};

const filBlog = (e) => {
  fetch("/personnalBlogs").then((res) =>
    res.json().then((data) => {
      const title = document.getElementById("perso-blog-title");
      const content = document.getElementById("blog-entry");
      const status = document.getElementById("perso-blog-status");
      const id = document.getElementById("perso-blog-id");
      title.value = data[0].title;
      content.value = data[0].content;
      status.textContent = data[0].status;
      id.value = data[0].id;
    })
  );
};

const getLoginForm = () => {
  window.location.href = "/login";
};

const getRegisterForm = () => {
  window.location.href = "/register";
};

const login = () => {
  const mail = document.getElementById("mail").value;
  const password = document.getElementById("password").value;
  console.log(mail, password);
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mail: mail, password: password }),
  }).then((res, err) => {
    console.log(res);
    if (err) {
      console.log(err);
    }
    res.json().then((data) => {
      if (data.token) {
        document.cookie = `token=${data.token}`;
        document.cookie = `mail=${mail}`;
        window.location.href = "/blog";
      } else {
        alert("Identifiants incorrects");
      }
    });
  });
};

createHeader();
createFooter();
createPublicBlogs();
createPrivateBlogs();
createAFDiv();
filBlog();
