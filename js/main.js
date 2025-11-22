document.addEventListener("DOMContentLoaded", () => {
    getMeals();
});

async function getMeals() {
    const API = "https://www.themealdb.com/api/json/v1/1/search.php?f=a";

    try {
        let response = await fetch(API);
        let data = await response.json();

        displayMeals(data.meals);
    } catch (error) {
        console.error("API Error:", error);
    }
}

function displayMeals(meals) {
    let row = document.getElementById("mealsRow");

    row.innerHTML = ""; // مسح اللي موجود

    meals.forEach(meal => {
        row.innerHTML += `
            <div class="col-md-3 mb-4">
                <div class="card ">
                    <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                    <div class="card-body">
                        <h5 class="card-title">${meal.strMeal}</h5>
                    </div>
                </div>
            </div>
        `;
    });
}
