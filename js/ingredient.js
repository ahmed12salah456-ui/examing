// js/ingredient.js

document.addEventListener("DOMContentLoaded", () => {
    loadAllIngredients();

    const mealsRow = document.getElementById("mealsRow");

    // Event delegation لأي زر أو صورة
    mealsRow.addEventListener("click", async (e) => {
        // الضغط على أي وجبة
        const btn = e.target.closest(".btn-meal-details");
        if (btn) {
            const mealId = btn.getAttribute("data-mealid");
            if (mealId) await showMealDetails(mealId);
        }

        // الضغط على أي مكون
        const ingredientCard = e.target.closest(".ingredient-card");
        if (ingredientCard) {
            const ingredient = ingredientCard.getAttribute("data-ingredient");
            if (ingredient) await showMealsByIngredient(ingredient);
        }
    });
});

// 1️⃣ جلب كل المكونات
async function loadAllIngredients() {
    const row = document.getElementById("mealsRow");
    row.innerHTML = `<p class="text-center">Loading ingredients...</p>`;

    try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const ingredients = data.meals || [];

        if (ingredients.length === 0) {
            row.innerHTML = `<p class="text-center">No ingredients found.</p>`;
            return;
        }

        let html = "";
        ingredients.forEach(ing => {
            html += `
                <div class="col-md-3 mb-4 style-area">
                    <div class=" ingredient-card text-center p-3" style="cursor:pointer;" data-ingredient="${ing.strIngredient}">
                        <i class="fa-solid fa-drumstick-bite fa-4x mb-2"></i>
                        <h5>${ing.strIngredient}</h5>
                        <p>${ing.strDescription ? ing.strDescription.substring(0, 80) + "..." : "No description"}</p>
                    </div>
                </div>
            `;
        });
        row.innerHTML = html;

    } catch (err) {
        console.error(err);
        row.innerHTML = `<p class="text-center text-danger">Failed to load ingredients</p>`;
    }
}

async function showMealsByIngredient(ingredient) {
    const row = document.getElementById("mealsRow");
    row.innerHTML = `
      <div class="col-12 mb-3">
        <button id="backToIngredients" class="btn btn-secondary">←back all</button>
        <h4 class="mt-2">Meals with: <span class="badge bg-primary">${ingredient}</span></h4>
      </div>
    `;

    document.getElementById("backToIngredients").addEventListener("click", loadAllIngredients);

    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const meals = data.meals || [];

        if (meals.length === 0) {
            row.innerHTML += `<div class="col-12"><p class="text-center">No meals found for this ingredient.</p></div>`;
            return;
        }

        let html = "";
        meals.forEach(meal => {
            html += `
                <div class="col-md-4 mb-4 ">
                    <div class="card h-100">
                        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                        <div class="card-body d-flex flex-column text-center">
                            <h6>${meal.strMeal}</h6>
                            <button class="btn btn-sm btn-outline-primary mt-auto btn-meal-details" data-mealid="${meal.idMeal}">Details</button>
                        </div>
                    </div>
                </div>
            `;
        });
        row.innerHTML += html;

    } catch (err) {
        console.error(err);
        row.innerHTML += `<div class="col-12"><p class="text-center text-danger">Failed to load meals for ${ingredient}</p></div>`;
    }
}

async function showMealDetails(mealId) {
    const row = document.getElementById("mealsRow");
    row.innerHTML = `<p class="text-center">Loading meal details...</p>`;

    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const meal = data.meals[0];

        if (!meal) {
            row.innerHTML = `<p class="text-center text-danger">Meal not found</p>`;
            return;
        }

        row.innerHTML = `
          <div class="col-12 mb-3">
            <button id="backToMeals" class="btn btn-secondary">← back meal</button>
          </div>
          <div class="col-md-8">
            <div class="card shadow-sm mb-3">
              <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
              <div class="card-body">
                <h2>${meal.strMeal}</h2>
                <p><strong>Category:</strong> ${meal.strCategory}</p>
                <p><strong>Area:</strong> ${meal.strArea}</p>
                <h5>Ingredients:</h5>
                <ul>
                  ${getIngredientsList(meal).map(i => `<li>${i}</li>`).join('')}
                </ul>
                <h5>Instructions:</h5>
                <p>${meal.strInstructions}</p>
                ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-danger mt-2">Watch on YouTube</a>` : ''}
              </div>
            </div>
          </div>
        `;

        document.getElementById("backToMeals").addEventListener("click", () => showMealsByIngredient(meal.strIngredient || meal.strCategory));

    } catch (err) {
        console.error(err);
        row.innerHTML = `<p class="text-center text-danger">Failed to load meal details</p>`;
    }
}

// استخراج المكونات
function getIngredientsList(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") ingredients.push(`${ingredient} - ${measure}`);
    }
    return ingredients;
}
