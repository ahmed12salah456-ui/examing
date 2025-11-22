// js/search.js

const input1 = document.getElementById('full-name');   
const input2 = document.getElementById('only-char'); 
const resultsRow = document.getElementById('resultsRow') ||
    (document.querySelectorAll('.row').length > 0
        ? document.querySelectorAll('.row')[document.querySelectorAll('.row').length - 1]
        : null);

if (!resultsRow) {
    console.error('No results container found. Add <div class="row" id="resultsRow"> to your HTML.');
}

function showMessage(html) {
    if (!resultsRow) return;
    resultsRow.innerHTML = `<div class="col-12">${html}</div>`;
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * @param {Array} meals
 */
function displayMeals(meals) {
    if (!resultsRow) return;
    if (!meals || meals.length === 0) {
        showMessage('<p class="text-light">No results.</p>');
        return;
    }

    let container = '';
    for (let i = 0; i < meals.length; i++) {
        const meal = meals[i];
        const img = meal.strMealThumb || 'image/placeholder.jpg';
        const title = meal.strMeal || 'No title';
        container += `
      <div class="col-md-3 mb-4">
        <div class="card">
          <img src="${escapeHtml(img)}" class="w-100" alt="${escapeHtml(title)}">
          <div class="card-body">
            <h5 class="card-title">${escapeHtml(title)}</h5>
          </div>
        </div>
      </div>
    `;
    }
    resultsRow.innerHTML = container;
}


/**
 * @param {string} query
 */
async function searchMeals(query) {
    if (!resultsRow) return;
    if (!query || query.trim().length === 0) {
        resultsRow.innerHTML = '';
        return;
    }

    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;

    try {
        //spinner.classList.replace('d-none', 'd-block');

        showMessage('<p class="text-muted">Loading...</p>');
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        //spinner.classList.replace('d-block', 'd-none');

        displayMeals(data.meals || []);
    } catch (err) {
        console.error('Search error:', err);
        showMessage('<p class="text-danger">Error fetching results.</p>');
    }
}


async function loadInitialMeals() {
    await searchMeals('a');
}


input1 && input1.addEventListener('keyup', function () {
    const v = input1.value.trim();
    if (v.length >= 3) {
        searchMeals(v);
    } else {
        if (resultsRow) resultsRow.innerHTML = '';
    }
});

let debounceTimer = null;
input2 && input2.addEventListener('keyup', function () {
    const v = input2.value.trim();

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (v.length === 0) {
            if (resultsRow) resultsRow.innerHTML = '';
        } else {
            searchMeals(v);
        }
    }, 300);
});

