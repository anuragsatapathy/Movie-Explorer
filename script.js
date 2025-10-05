const movieSearchBox = document.getElementById("movie-search-box");
const searchList = document.getElementById("search-list");
const resultGrid = document.getElementById("result-grid");

const API_KEY = "8de0663";

async function loadMovies(searchTerm) {
    const URL = `https://www.omdbapi.com/?s=${searchTerm}&apikey=${API_KEY}`;
    const res = await fetch(URL);
    const data = await res.json();
    if (data.Response == "True") displayMovieList(data.Search);
}

function findMovies() {
    let searchTerm = movieSearchBox.value.trim();
    if (searchTerm.length > 0) {
        searchList.classList.remove("hide-search-list");
        loadMovies(searchTerm);
    } else {
        searchList.classList.add("hide-search-list");
    }
}

function displayMovieList(movies) {
    searchList.innerHTML = "";
    for (let idx = 0; idx < movies.length; idx++) {
        let movieListItem = document.createElement("div");
        movieListItem.dataset.id = movies[idx].imdbID;
        movieListItem.classList.add("search-list-item");
        let moviePoster = movies[idx].Poster != "N/A" ? movies[idx].Poster : "image_not_found.png";
        movieListItem.innerHTML = `
            <div class="search-item-thumbnail">
                <img src="${moviePoster}">
            </div>
            <div class="search-item-info">
                <h3>${movies[idx].Title}</h3>
                <p>${movies[idx].Year}</p>
            </div>
        `;
        searchList.appendChild(movieListItem);
    }
    loadMovieDetails();
}

function loadMovieDetails() {
    const searchListMovies = searchList.querySelectorAll(".search-list-item");
    searchListMovies.forEach(movie => {
        movie.addEventListener("click", async () => {
            searchList.classList.add("hide-search-list");
            movieSearchBox.value = "";
            const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=${API_KEY}`);
            const movieDetails = await result.json();
            displayMovieDetails(movieDetails);
        });
    });
}

function displayMovieDetails(details) {
    resultGrid.innerHTML = `
        <div class="movie-poster">
            <img src="${details.Poster != "N/A" ? details.Poster : "image_not_found.png"}" alt="movie poster">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${details.Title}</h3>
            <ul class="movie-misc-info">
                <li class="year">Year: ${details.Year}</li>
                <li class="rated">Ratings: ${details.Rated}</li>
                <li class="released">Released: ${details.Released}</li>
            </ul>
            <p class="genre"><b>Genre:</b> ${details.Genre}</p>
            <p class="writer"><b>Writer:</b> ${details.Writer}</p>
            <p class="actors"><b>Actors:</b> ${details.Actors}</p>
            <p class="plot"><b>Plot:</b> ${details.Plot}</p>
            <p class="language"><b>Language:</b> ${details.Language}</p>
            <p class="awards"><b><i class="fas fa-award"></i></b> ${details.Awards}</p>
            <button class="fav-btn" onclick="addToFavorites('${details.imdbID}')">❤️ Add to Favorites</button>
        </div>
    `;
}

window.addEventListener("click", e => {
    if (e.target.className != "form-control") {
        searchList.classList.add("hide-search-list");
    }
});

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function addToFavorites(id) {
    const favorites = getFavorites();
    if (!favorites.includes(id)) {
        favorites.push(id);
        saveFavorites(favorites);
        displayFavorites();
    }
}

async function displayFavorites() {
    const favorites = getFavorites();
    let favoritesContainer = document.querySelector(".favorites-container");
    if (!favoritesContainer) {
        favoritesContainer = document.createElement("div");
        favoritesContainer.classList.add("favorites-container");
        document.querySelector(".wrapper .container").appendChild(favoritesContainer);
    }
    favoritesContainer.innerHTML = "<h2>⭐ Favorites</h2>";
    for (let id of favorites) {
        const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
        const movie = await res.json();
        const favItem = document.createElement("div");
        favItem.classList.add("fav-item");
        favItem.innerHTML = `
            <img src="${movie.Poster != "N/A" ? movie.Poster : "image_not_found.png"}">
            <p>${movie.Title} (${movie.Year})</p>
            <button onclick="removeFromFavorites('${id}')">Remove</button>
        `;
        favoritesContainer.appendChild(favItem);
    }
}

function removeFromFavorites(id) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav !== id);
    saveFavorites(favorites);
    displayFavorites();
}

movieSearchBox.addEventListener("keyup", findMovies);
movieSearchBox.addEventListener("click", findMovies);
document.addEventListener("DOMContentLoaded", displayFavorites);
