
document.addEventListener("DOMContentLoaded", () => {
    getCategories();

    const mealsRow = document.getElementById("mealsRow");
    mealsRow.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-meal-details");
        if (btn) {
            const mealId = btn.getAttribute("data-mealid");
            if (mealId) {
                await showMealCategory(mealId);
            }
        }
    });
});

const CATEGORIES_API = "https://www.themealdb.com/api/json/v1/1/categories.php";
const FILTER_API_BASE = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const LIST_CATEGORIES_API = "https://www.themealdb.com/api/json/v1/1/list.php?c=list";
const LOOKUP_MEAL_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

async function getCategories() {
    try {
        const res = await fetch(CATEGORIES_API);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        displayCategories(data.categories);
    } catch (err) {
        console.error(err);
        document.getElementById("mealsRow").innerHTML = `<p class="text-danger">Failed to load categories.</p>`;
    }
}

function displayCategories(categories) {
    const row = document.getElementById("mealsRow");
    row.innerHTML = "";
    categories.forEach(cat => {
        row.innerHTML += `
            <div class="col-md-3 mb-4">
                <div class="card category-card" data-category="${cat.strCategory}" style="cursor:pointer;">
                    <img src="${cat.strCategoryThumb}" class="card-img-top" alt="${cat.strCategory}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${cat.strCategory}</h5>
                        <p>${escapeHtml((cat.strCategoryDescription || "").substring(0, 80))}...</p>
                    </div>
                </div>
            </div>
        `;
    });
    attachCategoryClickHandlers();
}

function attachCategoryClickHandlers() {
    const cards = document.querySelectorAll(".category-card");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const category = card.getAttribute("data-category");
            if (category) showMealsByCategory(category);
        });
    });
}

async function showMealsByCategory(categoryName) {
    const row = document.getElementById("mealsRow");
    row.innerHTML = `
      <div class="col-12 mb-3">
        <button id="backToCategories" class="btn btn-secondary">← back</button>
        <h4 class="mt-2">meal in <span class="badge bg-primary">${escapeHtml(categoryName)}</span></h4>
      </div>
    `;
    document.getElementById("backToCategories").addEventListener("click", getCategories);

    try {
        const res = await fetch(FILTER_API_BASE + encodeURIComponent(categoryName));
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const meals = data.meals || [];

        if (meals.length === 0) {
            row.innerHTML += `<div class="col-12"><p class="text-center">Do not Find.</p></div>`;
            return;
        }

        let html = "";
        meals.forEach(meal => {
            html += `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <img src="${meal.strMealThumb}" class="card-img-top" alt="${escapeHtml(meal.strMeal)}">
                        <div class="card-body text-center d-flex flex-column">
                            <h6 class="card-title">${escapeHtml(meal.strMeal)}</h6>
                            <button class="btn btn-sm btn-outline-primary mt-auto btn-meal-details" data-mealid="${meal.idMeal}">تفاصيل</button>
                        </div>
                    </div>
                </div>
            `;
        });
        row.innerHTML += html;

    } catch (err) {
        console.error(err);
        row.innerHTML += `<div class="col-12"><p class="text-danger">Failed to load meals.</p></div>`;
    }
}

async function showMealCategory(mealId) {
    const row = document.getElementById("mealsRow");
    row.innerHTML = `<p class="text-center">Loading details...</p>`;

    try {
        const resMeal = await fetch(LOOKUP_MEAL_API + encodeURIComponent(mealId));
        const dataMeal = await resMeal.json();
        const meal = dataMeal.meals[0];

        if (!meal) throw new Error("Meal not found");

        const resList = await fetch(LIST_CATEGORIES_API);
        const dataList = await resList.json();
        const categories = dataList.meals.map(c => c.strCategory);

        row.innerHTML = `
          <div class="col-12 mb-3">
            <button id="backToMeals" class="btn btn-secondary">← back meal</button>
          </div>
          <div class="col-md-8">
            <div class="card shadow-sm mb-3">
              <img src="${meal.strMealThumb}" class="card-img-top" alt="${escapeHtml(meal.strMeal)}">
              <div class="card-body">
                <h2 class="card-title">${escapeHtml(meal.strMeal)}</h2>
                <p><strong>Category:</strong> ${escapeHtml(meal.strCategory)} ${categories.includes(meal.strCategory) ? "(Valid category)" : "(Unknown)"}</p>
                <p><strong>Area:</strong> ${meal.strArea}</p>
                <h5>Ingredients:</h5>
                <ul>
                  ${getIngredientsList(meal).map(i => `<li>${i}</li>`).join('')}
                </ul>
                <h5>Instructions:</h5>
                <p>${meal.strInstructions}</p>
                ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-danger">Watch on YouTube</a>` : ''}
              </div>
            </div>
          </div>
        `;

        document.getElementById("backToMeals").addEventListener("click", () => {
            showMealsByCategory(meal.strCategory);
        });

    } catch (err) {
        console.error(err);
        row.innerHTML = `<p class="text-danger text-center">Failed to load meal details.</p>`;
    }
}

function getIngredientsList(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") ingredients.push(`${ingredient} - ${measure}`);
    }
    return ingredients;
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
