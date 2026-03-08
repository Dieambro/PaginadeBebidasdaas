// ================= ELEMENTOS =================
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const ingredientSelect = document.getElementById("ingredientSelect");
const alcoholSelect = document.getElementById("alcoholSelect");
const resetBtn = document.getElementById("resetBtn");
const cocktailContainer = document.getElementById("cocktailContainer");
const statusMessage = document.getElementById("statusMessage");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");


// ================= CARGAR FILTROS =================
async function loadFilters() {

    // Categorías
    const catRes = await fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list");
    const catData = await catRes.json();
    catData.drinks.forEach(c => {
        const option = document.createElement("option");
        option.value = c.strCategory;
        option.textContent = c.strCategory;
        categorySelect.appendChild(option);
    });

    // Ingredientes
    const ingRes = await fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list");
    const ingData = await ingRes.json();
    ingData.drinks.slice(0, 50).forEach(i => { // limitamos a 50
        const option = document.createElement("option");
        option.value = i.strIngredient1;
        option.textContent = i.strIngredient1;
        ingredientSelect.appendChild(option);
    });
}


// ================= RENDER =================
function renderCocktails(cocktails) {

    cocktailContainer.innerHTML = "";
    statusMessage.textContent = "";

    if (!cocktails) {
        statusMessage.textContent = "No se encontraron resultados.";
        return;
    }

    document.body.classList.add("active"); // activa modo compacto

    cocktails.forEach(drink => {

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
            <h3>${drink.strDrink}</h3>
            <button class="detailsBtn" data-id="${drink.idDrink}">
                Ver receta
            </button>
        `;

        cocktailContainer.appendChild(card);
    });

    document.querySelectorAll(".detailsBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            getCocktailDetails(btn.dataset.id);
        });
    });
}


// ================= BÚSQUEDA POR NOMBRE =================
async function searchCocktail() {

    const value = searchInput.value.trim();
    if (!value) return;

    statusMessage.textContent = "Buscando...";

    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${value}`);
    const data = await res.json();

    renderCocktails(data.drinks);
}


// ================= FILTROS =================
async function filterByCategory() {
    const value = categorySelect.value;
    if (!value) return;

    clearOtherFilters("category");

    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${value}`);
    const data = await res.json();

    renderCocktails(data.drinks);
}

async function filterByIngredient() {
    const value = ingredientSelect.value;
    if (!value) return;

    clearOtherFilters("ingredient");

    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${value}`);
    const data = await res.json();

    renderCocktails(data.drinks);
}

async function filterByAlcohol() {
    const value = alcoholSelect.value;
    if (!value) return;

    clearOtherFilters("alcohol");

    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${value}`);
    const data = await res.json();

    renderCocktails(data.drinks);
}


// ================= LIMPIAR OTROS FILTROS =================
function clearOtherFilters(active) {
    if (active !== "category") categorySelect.value = "";
    if (active !== "ingredient") ingredientSelect.value = "";
    if (active !== "alcohol") alcoholSelect.value = "";
    searchInput.value = "";
}


// ================= DETALLES =================
async function getCocktailDetails(id) {

    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    const drink = data.drinks[0];

    let ingredients = "";

    for (let i = 1; i <= 15; i++) {
        const ing = drink[`strIngredient${i}`];
        const meas = drink[`strMeasure${i}`];
        if (ing) {
            ingredients += `<li>${ing} ${meas ? "- " + meas : ""}</li>`;
        }
    }

    modalBody.innerHTML = `
        <h2>${drink.strDrink}</h2>
        <img src="${drink.strDrinkThumb}" class="modal-img">
        <p><strong>Tipo:</strong> ${drink.strAlcoholic}</p>
        <p><strong>Vaso:</strong> ${drink.strGlass}</p>
        <h3>Ingredientes:</h3>
        <ul>${ingredients}</ul>
        <h3>Instrucciones:</h3>
        <p>${drink.strInstructions}</p>
    `;

    modal.style.display = "flex";
}


// ================= REINICIAR =================
function resetApp() {
    searchInput.value = "";
    categorySelect.value = "";
    ingredientSelect.value = "";
    alcoholSelect.value = "";
    cocktailContainer.innerHTML = "";
    statusMessage.textContent = "";
    document.body.classList.remove("active");
}


// ================= EVENTOS =================
searchBtn.addEventListener("click", searchCocktail);
categorySelect.addEventListener("change", filterByCategory);
ingredientSelect.addEventListener("change", filterByIngredient);
alcoholSelect.addEventListener("change", filterByAlcohol);
resetBtn.addEventListener("click", resetApp);

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
});


// ================= INICIALIZAR =================
loadFilters();