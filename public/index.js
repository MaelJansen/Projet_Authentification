const header = document.getElementById("header");
const footer = document.getElementById("footer");
const publicBlogs = document.getElementById("public-blogs-container");
const privateBlogs = document.getElementById("private-blogs-container");

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

createHeader();
createFooter();
createPublicBlogs();
createPrivateBlogs();
