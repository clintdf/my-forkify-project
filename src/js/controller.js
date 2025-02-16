import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginatonView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlRecipes = async function () {
    try {
        const id = window.location.hash.slice([1]);
        if (!id) return;
        recipeView.renderSpinner();
        // 1) Update results view to mark selected search result
        resultsView.update(model.getSeaechResultsPage());
        // 2) Updating bookmarks view
        bookmarksView.update(model.state.bookmarks);
        // 3) Loading recipe
        await model.loadRecipe(id);
        // 4) Redering recipe
        recipeView.render(model.state.recipe);
    } catch (err) {
        recipeView.renderError();
    }
};

const controlSearchResults = async function () {
    try {
        resultsView.renderSpinner();
        console.log(resultsView);
        // 1) Get search query
        const query = searchView.getQuery();
        if (!query) return;
        // 2) Load search query
        await model.loadSearchResults(query);
        // 3) Render results
        resultsView.render(model.getSeaechResultsPage());
        // 4) Render initial pagination buttons
        paginatonView.render(model.state.search);
    } catch (err) {
        console.log(err);
    }
};

const controlPagination = function (gotoPage) {
    // 1) Render new results
    resultsView.render(model.getSeaechResultsPage(gotoPage));
    // 2) Render new pagination
    paginatonView.render(model.state.search);
};

const controlServings = function (newServings) {
    // Update recipe servings (in state)
    model.updateServings(newServings);
    // Update the recipe view
    recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
    // 1) Add/remove bookmark
    if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);
    // 2) Update recipe view
    recipeView.update(model.state.recipe);
    // 3) Render bookmarks
    bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function() {
    bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe) {
    try {
        // Show loading spinner
        addRecipeView.renderSpinner();
        // Upload new recipe data
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);
        // Render recipe
        recipeView.render(model.state.recipe);
        // Success message
        addRecipeView.renderMessage();
        // Render bookmark view
        bookmarksView.render(model.state.bookmarks);
        // Change id in url
        window.history.pushState(null, '', `#${model.state.recipe.id}`);
        // Close form window
        setTimeout(function() {
            addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);
    } catch(err) {
        console.error('😣', err);
        addRecipeView.renderError(err.message);
    }
}

const init = function () {
    bookmarksView.addHandlerRender(controlBookmarks)
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerBookmark(controlAddBookmark)
    searchView.addHandlerSearch(controlSearchResults);
    paginatonView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
