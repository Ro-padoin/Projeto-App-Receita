import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { fetchDrinkId } from '../../services/fetchApiDrink';
import getmeasureAndIngredients from '../../services/measureAndIngredients';
import recipesInProgress from '../../services/recipesInProgress';
import './styles.css';

const TYPE = 'cocktails';

function DrinksInProgress() {
  const { id } = useParams();
  const [drinkInProgress, setDrinkInProgress] = useState(undefined);
  const [ingredients, setIngredients] = useState(undefined);

  async function getRecipesDrinkInProgress() {
    const response = await fetchDrinkId(id);
    setDrinkInProgress(response.drinks[0]);
    const ingredientsAndMeasures = getmeasureAndIngredients(response.drinks[0]);
    const ingredientsWithDone = Object.values(ingredientsAndMeasures)
      .map((ingredient) => ({ ingredient, done: false }));

    const recipeInLocalStorage = recipesInProgress.get(id, TYPE);
    if (recipeInLocalStorage) {
      ingredientsWithDone.forEach((ingredient) => {
        const exists = recipeInLocalStorage
          .some((inLocalStorage) => inLocalStorage === ingredient.ingredient);
        if (exists) {
          ingredient.done = true;
        }
      });
    }
    setIngredients(ingredientsWithDone);
  }

  useEffect(() => {
    getRecipesDrinkInProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ingredients) {
      const ingredientsDone = ingredients.filter((ingredient) => ingredient.done)
        .map((ingredient) => ingredient.ingredient);
      recipesInProgress.add(id, ingredientsDone, TYPE);
    }
  }, [ingredients, id]);

  function handleDone(index) {
    setIngredients((prevState) => {
      prevState[index].done = !prevState[index].done;
      return [...prevState];
    });
  }

  return (
    <div>
      { drinkInProgress !== undefined && (
        <>
          <img
            src={ drinkInProgress.strDrinkThumb }
            alt="profile"
            data-testid="recipe-photo"
          />
          <input
            type="button"
            data-testid="share-btn"
            value="share"
          />
          <input
            type="button"
            data-testid="favorite-btn"
            value="favorite"
          />
          <h3
            data-testid="recipe-category"
          >
            {drinkInProgress.strCategory}

          </h3>
          <h1
            data-testid="recipe-title"
          >
            {drinkInProgress.strDrink}
          </h1>
          <div>
            {ingredients !== undefined && ingredients
              .map(({ ingredient, done }, index) => (
                <label
                  htmlFor={ `ingredient${index}` }
                  key={ index }
                  data-testid={ `${index}-ingredient-step` }
                  className={ done ? 'done' : '' }
                >
                  <input
                    id={ `ingredient${index}` }
                    type="checkbox"
                    checked={ done }
                    onChange={ () => handleDone(index) }
                  />
                  {ingredient}
                </label>
              ))}
          </div>
          <p
            data-testid="instructions"
          >
            {drinkInProgress.strInstructions}
          </p>
          <input type="button" data-testid="finish-recipe-btn" value="Finish Recipe" />
        </>)}
    </div>
  );
}

export default DrinksInProgress;
