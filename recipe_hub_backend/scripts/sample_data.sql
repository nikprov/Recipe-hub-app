-- Sample data for Recipe Hub
-- This script assumes you have already created the following users:
-- admin, testuser1, testuser2

-- Get user IDs (adjust these if your user IDs are different)
SET @admin_id = (SELECT id FROM auth_user WHERE username = 'admin');
SET @user1_id = (SELECT id FROM auth_user WHERE username = 'testuser1');
SET @user2_id = (SELECT id FROM auth_user WHERE username = 'testuser2');

-- Recipes
INSERT INTO recipes_recipe (title, description, ingredients, instructions, cooking_time, author_id, created_at, updated_at) VALUES
-- Mediterranean Recipes
('Classic Greek Moussaka', 
 'Traditional Greek dish with layers of eggplant, spiced ground meat, and béchamel sauce',
 'Eggplants\nGround lamb\nOnions\nGarlic\nTomatoes\nCinnamon\nAllspice\nFlour\nMilk\nEggs\nNutmeg',
 '1. Slice and salt eggplants\n2. Make meat sauce with spices\n3. Prepare béchamel\n4. Layer and bake',
 90, @admin_id, NOW(), NOW()),

('Spanish Paella',
 'Authentic Spanish rice dish with seafood and saffron',
 'Rice\nSaffron\nShrimp\nMussels\nChicken\nPeas\nRed peppers\nOnion\nGarlic\nOlive oil',
 '1. Cook sofrito\n2. Add rice and saffron\n3. Add proteins\n4. Let form socarrat',
 60, @user1_id, NOW(), NOW()),

('Italian Risotto alla Milanese',
 'Creamy saffron risotto from Milan',
 'Arborio rice\nSaffron\nOnion\nWhite wine\nParmesan\nButter\nChicken stock',
 '1. Toast rice\n2. Add wine\n3. Gradually add stock\n4. Finish with cheese',
 45, @user2_id, NOW(), NOW()),

-- World Cuisine
('Japanese Ramen',
 'Rich and comforting noodle soup with pork and eggs',
 'Ramen noodles\nPork belly\nSoy sauce\nMirin\nEggs\nNori\nGreen onions\nGarlic\nGinger',
 '1. Prepare broth\n2. Cook chashu pork\n3. Boil eggs\n4. Assemble bowl',
 120, @admin_id, NOW(), NOW()),

('Indian Butter Chicken',
 'Creamy and rich North Indian curry',
 'Chicken\nYogurt\nTomatoes\nButter\nCream\nGaram masala\nFenugreek\nGinger\nGarlic',
 '1. Marinate chicken\n2. Make tomato gravy\n3. Combine and simmer',
 60, @user1_id, NOW(), NOW()),

('Thai Green Curry',
 'Aromatic coconut curry with vegetables',
 'Green curry paste\nCoconut milk\nChicken\nBamboo shoots\nThai basil\nFish sauce\nPalm sugar',
 '1. Heat curry paste\n2. Add coconut milk\n3. Cook chicken\n4. Add vegetables',
 45, @user2_id, NOW(), NOW()),

-- More Mediterranean
('Turkish Pide',
 'Boat-shaped flatbread with toppings',
 'Flour\nYeast\nWater\nGround meat\nOnions\nTomatoes\nParsley\nSpices',
 '1. Make dough\n2. Prepare filling\n3. Shape and fill\n4. Bake',
 75, @admin_id, NOW(), NOW()),

('Moroccan Tagine',
 'Slow-cooked stew with preserved lemons',
 'Lamb\nPreserved lemons\nOlives\nOnions\nGarlic\nSaffron\nGinger\nCoriander',
 '1. Brown meat\n2. Add spices\n3. Slow cook\n4. Garnish',
 90, @user1_id, NOW(), NOW()),

-- More World Cuisine
('Vietnamese Pho',
 'Traditional beef noodle soup',
 'Rice noodles\nBeef bones\nBeef slices\nOnion\nGinger\nStar anise\nCinnamon\nHerbs',
 '1. Make broth\n2. Cook noodles\n3. Slice beef\n4. Assemble',
 180, @user2_id, NOW(), NOW()),

('Mexican Mole',
 'Complex sauce with chocolate and chilies',
 'Chilies\nChocolate\nNuts\nSpices\nTomatoes\nChicken\nSesame seeds',
 '1. Toast ingredients\n2. Blend sauce\n3. Cook chicken\n4. Combine',
 120, @admin_id, NOW(), NOW()),

('Korean Bibimbap',
 'Rice bowl with vegetables and egg',
 'Rice\nSpinach\nCarrots\nBean sprouts\nBeef\nEggs\nGochujang\nSesame oil',
 '1. Cook rice\n2. Prepare vegetables\n3. Cook egg\n4. Assemble bowl',
 45, @user1_id, NOW(), NOW()),

('French Coq au Vin',
 'Classic chicken braised in wine',
 'Chicken\nRed wine\nMushrooms\nPearl onions\nBacon\nThyme\nBay leaves',
 '1. Brown chicken\n2. Cook vegetables\n3. Braise in wine\n4. Reduce sauce',
 90, @user2_id, NOW(), NOW());

-- Store recipe IDs in variables
SET @moussaka_id = LAST_INSERT_ID();
SET @paella_id = @moussaka_id + 1;
SET @risotto_id = @moussaka_id + 2;
SET @ramen_id = @moussaka_id + 3;
SET @butter_chicken_id = @moussaka_id + 4;
SET @thai_curry_id = @moussaka_id + 5;
SET @pide_id = @moussaka_id + 6;
SET @tagine_id = @moussaka_id + 7;
SET @pho_id = @moussaka_id + 8;
SET @mole_id = @moussaka_id + 9;
SET @bibimbap_id = @moussaka_id + 10;
SET @coq_au_vin_id = @moussaka_id + 11;

-- Comments for each recipe
INSERT INTO recipes_comment (content, author_id, recipe_id, created_at, updated_at) VALUES
-- Moussaka Comments
('Absolutely authentic! Reminds me of my Greek grandmother''s recipe.', @admin_id, @moussaka_id, NOW(), NOW()),
('The béchamel sauce was perfect. Great instructions!', @user1_id, @moussaka_id, NOW(), NOW()),
('Made this for a dinner party - everyone loved it!', @user2_id, @moussaka_id, NOW(), NOW()),

-- Paella Comments
('The socarrat at the bottom was perfect!', @admin_id, @paella_id, NOW(), NOW()),
('Best paella recipe I''ve tried so far.', @user1_id, @paella_id, NOW(), NOW()),
('The saffron really makes a difference.', @user2_id, @paella_id, NOW(), NOW()),

-- Risotto Comments
('Creamy and delicious!', @admin_id, @risotto_id, NOW(), NOW()),
('Perfect consistency achieved.', @user1_id, @risotto_id, NOW(), NOW()),
('Simple yet elegant dish.', @user2_id, @risotto_id, NOW(), NOW()),

-- Ramen Comments
('The broth is so rich and flavorful!', @admin_id, @ramen_id, NOW(), NOW()),
('Takes time but worth the effort.', @user1_id, @ramen_id, NOW(), NOW()),
('Better than restaurant ramen!', @user2_id, @ramen_id, NOW(), NOW()),

-- Butter Chicken Comments
('Perfect balance of spices.', @admin_id, @butter_chicken_id, NOW(), NOW()),
('My family''s new favorite curry.', @user1_id, @butter_chicken_id, NOW(), NOW()),
('Creamy and not too spicy.', @user2_id, @butter_chicken_id, NOW(), NOW()),

-- Thai Curry Comments
('So fresh and aromatic!', @admin_id, @thai_curry_id, NOW(), NOW()),
('Love the authentic taste.', @user1_id, @thai_curry_id, NOW(), NOW()),
('Quick and delicious weeknight meal.', @user2_id, @thai_curry_id, NOW(), NOW()),

-- Turkish Pide Comments
('Reminds me of Istanbul!', @admin_id, @pide_id, NOW(), NOW()),
('The shape was tricky but came out great.', @user1_id, @pide_id, NOW(), NOW()),
('Great alternative to pizza.', @user2_id, @pide_id, NOW(), NOW()),

-- Tagine Comments
('The preserved lemons are key.', @admin_id, @tagine_id, NOW(), NOW()),
('Meat was so tender.', @user1_id, @tagine_id, NOW(), NOW()),
('Amazing depth of flavor.', @user2_id, @tagine_id, NOW(), NOW()),

-- Pho Comments
('The broth is everything!', @admin_id, @pho_id, NOW(), NOW()),
('Worth the long cooking time.', @user1_id, @pho_id, NOW(), NOW()),
('So comforting and delicious.', @user2_id, @pho_id, NOW(), NOW()),

-- Mole Comments
('Complex and delicious sauce.', @admin_id, @mole_id, NOW(), NOW()),
('Love the chocolate addition.', @user1_id, @mole_id, NOW(), NOW()),
('Authentic taste achieved!', @user2_id, @mole_id, NOW(), NOW()),

-- Bibimbap Comments
('Love the variety of vegetables.', @admin_id, @bibimbap_id, NOW(), NOW()),
('The gochujang makes it perfect.', @user1_id, @bibimbap_id, NOW(), NOW()),
('Great healthy meal prep option.', @user2_id, @bibimbap_id, NOW(), NOW()),

-- Coq au Vin Comments
('Classic French comfort food.', @admin_id, @coq_au_vin_id, NOW(), NOW()),
('The sauce was divine.', @user1_id, @coq_au_vin_id, NOW(), NOW()),
('Perfect for special occasions.', @user2_id, @coq_au_vin_id, NOW(), NOW());

-- Difficulty Ratings for each recipe
INSERT INTO recipes_difficultyrating (rating, rating_author_id, recipe_id, created_at, updated_at) VALUES
-- Moussaka Ratings
(4, @admin_id, @moussaka_id, NOW(), NOW()),
(5, @user1_id, @moussaka_id, NOW(), NOW()),
(4, @user2_id, @moussaka_id, NOW(), NOW()),

-- Paella Ratings
(4, @admin_id, @paella_id, NOW(), NOW()),
(3, @user1_id, @paella_id, NOW(), NOW()),
(4, @user2_id, @paella_id, NOW(), NOW()),

-- Risotto Ratings
(3, @admin_id, @risotto_id, NOW(), NOW()),
(2, @user1_id, @risotto_id, NOW(), NOW()),
(3, @user2_id, @risotto_id, NOW(), NOW()),

-- Ramen Ratings
(5, @admin_id, @ramen_id, NOW(), NOW()),
(5, @user1_id, @ramen_id, NOW(), NOW()),
(4, @user2_id, @ramen_id, NOW(), NOW()),

-- Butter Chicken Ratings
(3, @admin_id, @butter_chicken_id, NOW(), NOW()),
(2, @user1_id, @butter_chicken_id, NOW(), NOW()),
(3, @user2_id, @butter_chicken_id, NOW(), NOW()),

-- Thai Curry Ratings
(2, @admin_id, @thai_curry_id, NOW(), NOW()),
(2, @user1_id, @thai_curry_id, NOW(), NOW()),
(3, @user2_id, @thai_curry_id, NOW(), NOW()),

-- Turkish Pide Ratings
(3, @admin_id, @pide_id, NOW(), NOW()),
(4, @user1_id, @pide_id, NOW(), NOW()),
(3, @user2_id, @pide_id, NOW(), NOW()),

-- Tagine Ratings
(4, @admin_id, @tagine_id, NOW(), NOW()),
(3, @user1_id, @tagine_id, NOW(), NOW()),
(4, @user2_id, @tagine_id, NOW(), NOW()),

-- Pho Ratings
(5, @admin_id, @pho_id, NOW(), NOW()),
(4, @user1_id, @pho_id, NOW(), NOW()),
(5, @user2_id, @pho_id, NOW(), NOW()),

-- Mole Ratings
(5, @admin_id, @mole_id, NOW(), NOW()),
(4, @user1_id, @mole_id, NOW(), NOW()),
(5, @user2_id, @mole_id, NOW(), NOW()),

-- Bibimbap Ratings
(2, @admin_id, @bibimbap_id, NOW(), NOW()),
(2, @user1_id, @bibimbap_id, NOW(), NOW()),
(3, @user2_id, @bibimbap_id, NOW(), NOW()),

-- Coq au Vin Ratings
(4, @admin_id, @coq_au_vin_id, NOW(), NOW()),
(3, @user1_id, @coq_au_vin_id, NOW(), NOW()),
(4, @user2_id, @coq_au_vin_id, NOW(), NOW());