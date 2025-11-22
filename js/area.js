
document.addEventListener("DOMContentLoaded", () => {
    displayAreas();

    const mealsRow = document.getElementById("mealsRow");

    mealsRow.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-meal-details");
        if (btn) {
            const mealId = btn.getAttribute("data-mealid");
            if (mealId) await showMealDetails(mealId);
        }

        const areaCard = e.target.closest(".area-card");
        if (areaCard) {
            const area = areaCard.getAttribute("data-area");
            if (area) await showMealsByArea(area);
        }
    });
});

const AREAS = ["Canadian", "Italian", "American", "British", "Chinese", "French", "Japanese" , "Mexican", "Spanish", "Thai", "Tunisian", "Moroccan", 
    "Indian" , "Greek", "Russian", "Vietnamese", "Dutch", "Irish", "Cuban", "Egyptian" , "Kenyan" , "Malaysian" , "Portuguese" , "Swedish" , "Australian" , "Argentinean" , 
    "Colombian" , "Filipino" , "Indonesian" , "Jamaican" , "Lebanese" , "Peruvian" , 
    "Polish" , "Saudi Arabian" , "Singaporean" , "South African" , "Sri Lankan" , "Turkish" , "Welsh" , "Croatian" , "Hungarian" , "Icelandic" , "Israeli" , "Lithuanian" ,
    "Nigerian" , "Omani" , "Romanian" , "Serbian" , "Ukrainian" , "Uzbek" , "Bulgarian" , "Cambodian" , "Georgian" , "Haitian" , "Iranian" , "Kazakh" , "Mongolian" , "Nepalese" , "Tahitian"];

function displayAreas() {
    const row = document.getElementById("mealsRow");
    row.innerHTML = "";
    AREAS.forEach(area => {
        row.innerHTML += `
            <div class="col-md-3 mb-4 style-area">
                <div class=" area-card text-center p-3" data-area="${area}" style="cursor:pointer;">
                <i class="fa-solid fa-house-laptop fa-4x" ></i>
                    <h5>${area}</h5>
                </div>
            </div>
        `;
    });
}

async function showMealsByArea(area) {
    const row = document.getElementById("mealsRow");
    row.innerHTML = `
      <div class="col-12 mb-3">
        <button id="backToAreas" class="btn btn-secondary">← back</button>
        <h4 class="mt-2">meal in <span class="badge bg-primary">${area}</span></h4>
      </div>
    `;
    document.getElementById("backToAreas").addEventListener("click", displayAreas);

    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const meals = data.meals || [];

        if (meals.length === 0) {
            row.innerHTML += `<div class="col-12"><p class="text-center">Undfind</p></div>`;
            return;
        }

        let html = "";
        meals.forEach(meal => {
            html += `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                        <div class="card-body text-center d-flex flex-column">
                            <h6 class="card-title">${meal.strMeal}</h6>
                            <button class="btn btn-sm btn-outline-primary mt-auto btn-meal-details" data-mealid="${meal.idMeal}">تفاصيل</button>
                        </div>
                    </div>
                </div>
            `;
        });
        row.innerHTML += html;

    } catch (err) {
        console.error(err);
        row.innerHTML += `<div class="col-12"><p class="text-danger">Failed to load meals for ${area}</p></div>`;
    }
}

async function showMealDetails(mealId) {
    const row = document.getElementById("mealsRow");
    row.innerHTML = `<p class="text-center">Loading details...</p>`;

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
                ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-danger">Watch on YouTube</a>` : ''}
              </div>
            </div>
          </div>
        `;

        document.getElementById("backToMeals").addEventListener("click", () => showMealsByArea(meal.strArea));

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
