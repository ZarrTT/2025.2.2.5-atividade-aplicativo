let db;

// Abrir / criar banco
const request = indexedDB.open("FilmesDB", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const store = db.createObjectStore("filmes", {
    keyPath: "id",
    autoIncrement: true
  });
};

request.onsuccess = (event) => {
  db = event.target.result;
  listarFilmes();
};

request.onerror = () => {
  console.error("Erro ao abrir IndexedDB");
};

// Adicionar filme
document.getElementById("formFilme").addEventListener("submit", (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const avaliacao = document.getElementById("avaliacao").value;

  const tx = db.transaction("filmes", "readwrite");
  const store = tx.objectStore("filmes");

  store.add({ titulo, avaliacao });

  tx.oncomplete = () => {
    e.target.reset();
    listarFilmes();
  };
});

// Listar filmes dinamicamente
function listarFilmes() {
  const lista = document.getElementById("listaFilmes");
  lista.innerHTML = "";

  const tx = db.transaction("filmes", "readonly");
  const store = tx.objectStore("filmes");

  store.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const filme = cursor.value;

      const div = document.createElement("div");
      div.className = "filme";
      div.innerHTML = `
        <h3>${filme.titulo}</h3>
        <p>Avaliação: ${"⭐".repeat(filme.avaliacao)}</p>
      `;

      lista.appendChild(div);
      cursor.continue();
    }
  };
}
