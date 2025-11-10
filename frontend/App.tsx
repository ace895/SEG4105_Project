import MealDetails from './src/app/Meal';
import { Ingredient } from './src/components/IngredientCard';

export default function App() {
  //Just using App to test pages
  const mealIngredients: Ingredient[] = [
    { name: 'Fish', calories: 200, weight: 225, proteins: 20, fats: 10, carbs: 0 },
    { name: 'Beans', calories: 50, weight: 60, proteins: 15, fats: 2, carbs: 40 },
    { name: 'Pie', calories: 50, weight: 100, proteins: 2, fats: 15, carbs: 45 },
  ];

  const mealPhoto =
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

  return <MealDetails ingredients={mealIngredients} imageUri={mealPhoto} />;
}