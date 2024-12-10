const header = document.getElementById("header");
const footer = document.getElementById("footer");
const publicBlogs = document.getElementById("public-blogs-container");
const privateBlogs = document.getElementById("private-blogs-container");
const afDiv = document.getElementById("2AF-content");

let aVirer = ["a", "b", "c", "d", "e"];

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
          <a href="/logout">Se déconnecter</a>
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
  aVirer.forEach((element) => {
    publicBlogs.innerHTML += `
        <div class="blog">
            <div class="blog-header">
                <h2>Titre du blog</h2>
                <p class="blog-status-public">Public</p>
            </div>
            <span><h4>Résumer du blog : </h4>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>
            <a href="">Lire la suite</a>
        </div>
    `;
  });
};

const createPrivateBlogs = () => {
  if (!privateBlogs) return;
  aVirer.forEach((element) => {
    privateBlogs.innerHTML += `
        <div class="blog">
            <div class="blog-header">
                <h2>Titre du blog</h2>
                <p class="blog-status-private">Privé</p>
            </div>
            <span><h4>Résumer du blog : </h4>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>
            <a href="">Lire la suite</a>
        </div>
    `;
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

createHeader();
createFooter();
createPublicBlogs();
createPrivateBlogs();
createAFDiv();
