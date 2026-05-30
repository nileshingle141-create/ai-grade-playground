-- =====================================================================
-- AI TEACHING STUDIO - ALL GRADES QUIZZES SEED SCRIPT
-- =====================================================================
-- Copy and paste this entire script into your Supabase SQL Editor 
-- (https://supabase.com -> Project -> SQL Editor) and click "Run".
-- This will instantly seed the quiz questions for ALL 55 lessons across
-- Grades 1, 2, 3, and 4, making them fully active immediately.
-- =====================================================================

DO $$
DECLARE
  rec RECORD;
  new_lesson_id uuid;
  q_data jsonb;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      -- (grade, subject, topic, content, story, duration, key_points jsonb, quizzes jsonb)
      (1,'Mathematics','Counting 1 to 20','Learn to count from 1 to 20 using fingers, toys and pictures. Practice writing each number.','Riya counted 20 colorful balloons at her birthday party!',20,
        '["Count slowly","Use your fingers","Write each number","Numbers go in order"]'::jsonb,
        '[{"q":"What number comes after 7?","a":"6","b":"8","c":"9","d":"10","correct":"B"},
          {"q":"How many fingers on one hand?","a":"4","b":"5","c":"6","d":"3","correct":"B"},
          {"q":"Which is the biggest number?","a":"12","b":"5","c":"19","d":"8","correct":"C"}]'::jsonb),
      (1,'Mathematics','Simple Addition','Add small numbers together using objects. 2 apples + 3 apples = 5 apples.','Ravi had 2 candies and got 3 more from mom. Now he has 5 candies!',25,
        '["Plus means add","Count both groups","The total is the sum","Use objects to help"]'::jsonb,
        '[{"q":"2 + 3 = ?","a":"4","b":"5","c":"6","d":"7","correct":"B"},
          {"q":"1 + 4 = ?","a":"5","b":"3","c":"6","d":"4","correct":"A"},
          {"q":"6 + 2 = ?","a":"7","b":"8","c":"9","d":"10","correct":"B"}]'::jsonb),

      (1,'English','The Alphabet','Learn 26 letters from A to Z. Practice writing capital and small letters.','Anu the ant walked along letters A, B, C, all the way to Z!',25,
        '["26 letters","Capital and small","Say each sound","Practice writing"]'::jsonb,
        '[{"q":"Which letter comes after B?","a":"A","b":"C","c":"D","d":"E","correct":"B"},
          {"q":"How many letters in alphabet?","a":"24","b":"25","c":"26","d":"27","correct":"C"},
          {"q":"Last letter of alphabet?","a":"X","b":"Y","c":"Z","d":"W","correct":"C"}]'::jsonb),
      (1,'English','Vowels and Consonants','A, E, I, O, U are vowels. All other letters are consonants.','Vowels are the singing letters that make every word smile!',20,
        '["5 vowels: A E I O U","21 consonants","Every word needs a vowel"]'::jsonb,
        '[{"q":"Which is a vowel?","a":"B","b":"E","c":"K","d":"M","correct":"B"},
          {"q":"How many vowels?","a":"3","b":"4","c":"5","d":"6","correct":"C"},
          {"q":"Is T a vowel?","a":"Yes","b":"No","c":"Sometimes","d":"Maybe","correct":"B"}]'::jsonb),

      (1,'Science','My Body Parts','Learn names of body parts: head, eyes, ears, nose, mouth, hands, legs.','Sona pointed to her nose and giggled — every body part has a special job!',20,
        '["Eyes to see","Ears to hear","Nose to smell","Hands to touch"]'::jsonb,
        '[{"q":"What do we use to see?","a":"Ears","b":"Eyes","c":"Nose","d":"Mouth","correct":"B"},
          {"q":"How many ears do you have?","a":"1","b":"2","c":"3","d":"4","correct":"B"},
          {"q":"What do we smell with?","a":"Eyes","b":"Hands","c":"Nose","d":"Feet","correct":"C"}]'::jsonb),
      (1,'Science','Living and Non-living','Living things grow and breathe. Non-living things do not.','A plant grows tall, but a stone stays the same forever!',20,
        '["Living: plants animals","Non-living: rocks toys","Living things need food"]'::jsonb,
        '[{"q":"Which is living?","a":"Chair","b":"Dog","c":"Pen","d":"Cup","correct":"B"},
          {"q":"Which is non-living?","a":"Tree","b":"Fish","c":"Stone","d":"Bird","correct":"C"},
          {"q":"Do plants grow?","a":"Yes","b":"No","c":"Never","d":"Rarely","correct":"A"}]'::jsonb),

      (1,'EVS','My Family','Family includes mother, father, brothers, sisters and grandparents.','Meet Aisha — she lives with mom, dad, dada and dadi in one happy home!',20,
        '["Family loves us","Parents care for us","Grandparents tell stories"]'::jsonb,
        '[{"q":"Mother of your father is?","a":"Aunt","b":"Dadi","c":"Nani","d":"Sister","correct":"B"},
          {"q":"Who teaches at home?","a":"Stranger","b":"Family","c":"Pet","d":"TV","correct":"B"},
          {"q":"Brother of father is?","a":"Uncle","b":"Aunt","c":"Cousin","d":"Friend","correct":"A"}]'::jsonb),
      (1,'EVS','Safe and Clean','Wash hands, brush teeth and stay away from danger.','Tarun washed his hands before lunch and kept germs away!',20,
        '["Wash hands often","Brush twice a day","Cross road carefully"]'::jsonb,
        '[{"q":"When do we wash hands?","a":"Never","b":"Before eating","c":"Once a year","d":"Only Sunday","correct":"B"},
          {"q":"How many times to brush?","a":"1","b":"2","c":"5","d":"0","correct":"B"},
          {"q":"Red traffic light means?","a":"Go","b":"Stop","c":"Run","d":"Dance","correct":"B"}]'::jsonb),

      (1,'Hindi','स्वर सीखें','अ आ इ ई उ ऊ ए ऐ ओ औ - ये हिंदी के स्वर हैं।','नन्ही गुड़िया ने अ से अनार पढ़ा और खुश हो गई!',20,
        '["13 स्वर","रोज़ अभ्यास","ज़ोर से बोलें"]'::jsonb,
        '[{"q":"अ के बाद कौन सा स्वर?","a":"इ","b":"आ","c":"उ","d":"ए","correct":"B"},
          {"q":"अ से क्या?","a":"आम","b":"अनार","c":"इमली","d":"उल्लू","correct":"B"},
          {"q":"कुल कितने स्वर?","a":"10","b":"13","c":"15","d":"5","correct":"B"}]'::jsonb),
      (1,'Hindi','व्यंजन परिचय','क ख ग घ - व्यंजन सीखें और शब्द बनाएं।','कबूतर कूऽ कूऽ करता है, क से क-ब-ऊ-तर!',20,
        '["33 व्यंजन","स्वर के साथ बनते शब्द","रोज़ लिखें"]'::jsonb,
        '[{"q":"क के बाद?","a":"ग","b":"ख","c":"घ","d":"च","correct":"B"},
          {"q":"क से क्या?","a":"कमल","b":"आम","c":"इमली","d":"ऊंत","correct":"A"},
          {"q":"ग से क्या?","a":"गाय","b":"शेर","c":"बकरी","d":"मोर","correct":"A"}]'::jsonb),

      (1,'Computer','Parts of Computer','A computer has a monitor, keyboard, mouse and CPU.','The monitor is like a TV screen that shows everything you type!',20,
        '["Monitor shows","Keyboard types","Mouse points","CPU thinks"]'::jsonb,
        '[{"q":"What shows pictures?","a":"Mouse","b":"Monitor","c":"CPU","d":"Wire","correct":"B"},
          {"q":"What do we type with?","a":"Keyboard","b":"Screen","c":"Speaker","d":"Mouse","correct":"A"},
          {"q":"Brain of computer?","a":"Mouse","b":"CPU","c":"Monitor","d":"Cable","correct":"B"}]'::jsonb),
      (1,'Computer','Using the Mouse','Mouse has left and right buttons. Click to select, double-click to open.','Click click! The mouse helps you choose anything on the screen.',20,
        '["Left click selects","Right click options","Double click opens","Move gently"]'::jsonb,
        '[{"q":"How many main buttons?","a":"1","b":"2","c":"3","d":"4","correct":"B"},
          {"q":"To open a file?","a":"Single click","b":"Double click","c":"Right click","d":"No click","correct":"B"},
          {"q":"To select something?","a":"Left click","b":"Shake","c":"Throw","d":"Press all","correct":"A"}]'::jsonb),

      -- GRADE 2
      (2,'Mathematics','Numbers to 100','Count, read and write numbers up to 100. Understand tens and ones.','Lucky counted 100 stars in the night sky!',25,
        '["Tens and ones","Place value","Count by tens"]'::jsonb,
        '[{"q":"What is 45 in words?","a":"Forty-five","b":"Fifty-four","c":"Fourteen","d":"Four","correct":"A"},
          {"q":"How many tens in 60?","a":"5","b":"6","c":"7","d":"60","correct":"B"},
          {"q":"Number after 99?","a":"98","b":"100","c":"101","d":"90","correct":"B"}]'::jsonb),
      (2,'Mathematics','Subtraction','Take away one number from another. 8 - 3 = 5.','Mira had 8 mangoes, gave 3 to friend. 5 left!',25,
        '["Minus means take away","Bigger first","Count back"]'::jsonb,
        '[{"q":"10 - 4 = ?","a":"5","b":"6","c":"7","d":"8","correct":"B"},
          {"q":"15 - 5 = ?","a":"10","b":"9","c":"11","d":"20","correct":"A"},
          {"q":"20 - 8 = ?","a":"10","b":"12","c":"14","d":"8","correct":"B"}]'::jsonb),

      (2,'English','Nouns','A noun is a name of a person, place, animal or thing.','Riya, Delhi, dog, ball — every name we use is a noun!',25,
        '["Person place animal thing","Start capital for names"]'::jsonb,
        '[{"q":"Which is a noun?","a":"Run","b":"Apple","c":"Quickly","d":"Big","correct":"B"},
          {"q":"Name of a city is?","a":"Verb","b":"Noun","c":"Adverb","d":"Number","correct":"B"},
          {"q":"Is dog a noun?","a":"Yes","b":"No","c":"Sometimes","d":"Never","correct":"A"}]'::jsonb),
      (2,'English','This and That','Use this for near, that for far.','This pen is in my hand. That bag is on the shelf.',20,
        '["This = near","That = far","These/those for many"]'::jsonb,
        '[{"q":"___ is my book (near).","a":"This","b":"That","c":"Those","d":"Them","correct":"A"},
          {"q":"___ is a star (far).","a":"This","b":"That","c":"These","d":"Their","correct":"B"},
          {"q":"That means?","a":"Near","b":"Far","c":"Many","d":"Few","correct":"B"}]'::jsonb),

      (2,'Science','Plants Around Us','Plants need sun, water and air to grow. Trees, shrubs and herbs.','A tiny seed becomes a tall tree with sunshine and water!',25,
        '["Roots take water","Leaves make food","Sun gives energy"]'::jsonb,
        '[{"q":"What do plants need?","a":"Only soil","b":"Sun water air","c":"Only water","d":"Nothing","correct":"B"},
          {"q":"Leaves make?","a":"Sound","b":"Food","c":"Money","d":"Light","correct":"B"},
          {"q":"Roots take?","a":"Water","b":"Sound","c":"Air","d":"Light","correct":"A"}]'::jsonb),
      (2,'Science','Animals and Their Homes','Birds live in nests, dogs in kennels, fish in water.','Every animal has a special home that keeps it safe!',20,
        '["Nest for birds","Burrow for rabbits","Water for fish"]'::jsonb,
        '[{"q":"Birds live in?","a":"Nest","b":"Pond","c":"Cave","d":"Tree only","correct":"A"},
          {"q":"Fish live in?","a":"Air","b":"Water","c":"Sand","d":"Tree","correct":"B"},
          {"q":"Bee lives in?","a":"Web","b":"Hive","c":"Nest","d":"Den","correct":"B"}]'::jsonb),

      (2,'EVS','Food We Eat','We eat fruits, vegetables, grains and milk to stay healthy.','Eat the rainbow — colorful fruits and veggies make you strong!',25,
        '["Eat balanced meal","Drink water","Avoid junk food"]'::jsonb,
        '[{"q":"Which is healthy?","a":"Chips","b":"Apple","c":"Candy","d":"Soda","correct":"B"},
          {"q":"Milk comes from?","a":"Plant","b":"Cow","c":"Tree","d":"Sand","correct":"B"},
          {"q":"What gives energy?","a":"Sleep only","b":"Food","c":"TV","d":"Toys","correct":"B"}]'::jsonb),
      (2,'EVS','Means of Transport','Buses, trains, planes and ships help us travel.','From cycle to rocket — humans love to go places!',20,
        '["Land water air","Helps reach school","Follow safety rules"]'::jsonb,
        '[{"q":"Which flies?","a":"Bus","b":"Plane","c":"Boat","d":"Bike","correct":"B"},
          {"q":"Which goes on water?","a":"Car","b":"Ship","c":"Train","d":"Cycle","correct":"B"},
          {"q":"Which has 2 wheels?","a":"Bus","b":"Bicycle","c":"Truck","d":"Train","correct":"B"}]'::jsonb),

      (2,'Hindi','मात्राएँ','आ की मात्रा (ा), इ की मात्रा (ि) आदि सीखें।','मात्राओं से शब्द जादू बन जाते हैं — क + ा = का!',25,
        '["स्वर की मात्रा","शब्द बनाना","रोज़ अभ्यास"]'::jsonb,
        '[{"q":"क + ा = ?","a":"कि","b":"का","c":"की","d":"कु","correct":"B"},
          {"q":"म + ी = ?","a":"मा","b":"मि","c":"मी","d":"मु","correct":"C"},
          {"q":"बा में कौन सी मात्रा?","a":"इ","b":"आ","c":"उ","d":"ए","correct":"B"}]'::jsonb),
      (2,'Hindi','सरल शब्द','दो और तीन अक्षर वाले शब्द बनाएं।','कमल, मटर, नमक — आसान शब्द रोज़ बोलो!',20,
        '["दो अक्षर शब्द","तीन अक्षर शब्द","अर्थ समझें"]'::jsonb,
        '[{"q":"नल कितने अक्षर का?","a":"1","b":"2","c":"3","d":"4","correct":"B"},
          {"q":"कमल किसका नाम?","a":"फूल","b":"पशु","c":"फल","d":"रंग","correct":"A"},
          {"q":"घर का अर्थ?","a":"House","b":"Tree","c":"Fish","d":"Star","correct":"A"}]'::jsonb),

      (2,'Computer','Keyboard Keys','Letters, numbers, space and enter keys help us type.','Tap-tap-tap — the keyboard is your magic writing tool!',25,
        '["Letter keys A-Z","Number keys 0-9","Space bar","Enter key"]'::jsonb,
        '[{"q":"Biggest key?","a":"A","b":"Space bar","c":"Enter","d":"Shift","correct":"B"},
          {"q":"To go new line?","a":"Space","b":"Enter","c":"Shift","d":"Tab","correct":"B"},
          {"q":"How many letter keys?","a":"10","b":"20","c":"26","d":"30","correct":"C"}]'::jsonb),
      (2,'Computer','Starting a Computer','Press the power button. Wait for desktop to appear.','Press the button — your computer wakes up like magic!',20,
        '["Power button on","Wait patiently","Use mouse to start"]'::jsonb,
        '[{"q":"To start, press?","a":"Mouse","b":"Power button","c":"Screen","d":"Wire","correct":"B"},
          {"q":"Main screen called?","a":"Desktop","b":"Laptop","c":"Tablet","d":"Phone","correct":"A"},
          {"q":"After starting we should?","a":"Hit it","b":"Wait","c":"Run","d":"Shout","correct":"B"}]'::jsonb),

      -- GRADE 3
      (3,'Mathematics','Multiplication Tables','Learn tables of 2, 3, 4 and 5. Multiplication is repeated addition.','Five rows of 4 candies = 20 candies. That is 5 × 4!',30,
        '["Times means multiply","Memorize tables","Practice daily"]'::jsonb,
        '[{"q":"3 × 4 = ?","a":"7","b":"12","c":"10","d":"15","correct":"B"},
          {"q":"5 × 5 = ?","a":"10","b":"20","c":"25","d":"30","correct":"C"},
          {"q":"2 × 9 = ?","a":"18","b":"16","c":"20","d":"11","correct":"A"}]'::jsonb),
      (3,'Mathematics','Division','Sharing equally is division. 10 ÷ 2 = 5.','10 chocolates shared between 2 friends — 5 each!',30,
        '["Divide means share","Inverse of multiplication","Use groups"]'::jsonb,
        '[{"q":"10 ÷ 2 = ?","a":"4","b":"5","c":"6","d":"3","correct":"B"},
          {"q":"15 ÷ 3 = ?","a":"3","b":"4","c":"5","d":"6","correct":"C"},
          {"q":"20 ÷ 4 = ?","a":"4","b":"5","c":"6","d":"10","correct":"B"}]'::jsonb),

      (3,'English','Verbs','Verbs are action words like run, jump, eat, sleep.','See Sam run, jump and sing — every action is a verb!',25,
        '["Action words","Has tenses","Subject + verb"]'::jsonb,
        '[{"q":"Which is a verb?","a":"Table","b":"Run","c":"Red","d":"Quickly","correct":"B"},
          {"q":"Is dance a verb?","a":"Yes","b":"No","c":"Sometimes","d":"Never","correct":"A"},
          {"q":"Past of go?","a":"Goed","b":"Went","c":"Going","d":"Gone","correct":"B"}]'::jsonb),
      (3,'English','Adjectives','Adjectives describe nouns: big, small, red, happy.','The fluffy white kitten — fluffy and white describe the kitten!',25,
        '["Describe nouns","Color size shape","Before the noun"]'::jsonb,
        '[{"q":"Which is an adjective?","a":"Run","b":"Big","c":"Apple","d":"Quickly","correct":"B"},
          {"q":"Describe a lemon?","a":"Sour","b":"Run","c":"Sing","d":"Eat","correct":"A"},
          {"q":"Tall is a/an?","a":"Verb","b":"Adjective","c":"Noun","d":"Number","correct":"B"}]'::jsonb),

      (3,'Science','States of Matter','Matter is solid, liquid or gas.','Ice melts to water, water boils to steam — same stuff, different forms!',30,
        '["Solid has shape","Liquid flows","Gas spreads"]'::jsonb,
        '[{"q":"Water is?","a":"Solid","b":"Liquid","c":"Gas","d":"Plasma","correct":"B"},
          {"q":"Ice is?","a":"Solid","b":"Liquid","c":"Gas","d":"None","correct":"A"},
          {"q":"Air is?","a":"Solid","b":"Liquid","c":"Gas","d":"Wood","correct":"C"}]'::jsonb),
      (3,'Science','Our Solar System','Sun is at center; 8 planets revolve around it.','Earth is the third planet — our blue home in space!',30,
        '["Sun is a star","8 planets","Earth has life"]'::jsonb,
        '[{"q":"How many planets?","a":"7","b":"8","c":"9","d":"10","correct":"B"},
          {"q":"Closest to Sun?","a":"Earth","b":"Mercury","c":"Mars","d":"Venus","correct":"B"},
          {"q":"Earth is which planet?","a":"1st","b":"2nd","c":"3rd","d":"4th","correct":"C"}]'::jsonb),

      (3,'EVS','Water and Its Uses','Water for drinking, washing, farming. Save every drop.','One bucket saved every day = lakhs of liters in a year!',30,
        '["Drink clean water","Save water","Reuse water"]'::jsonb,
        '[{"q":"Drink ___ water.","a":"Dirty","b":"Clean","c":"Salty","d":"Hot","correct":"B"},
          {"q":"What grows with water?","a":"Crops","b":"Stones","c":"Plastic","d":"Iron","correct":"A"},
          {"q":"Turn off tap means?","a":"Waste","b":"Save","c":"Drink","d":"Spill","correct":"B"}]'::jsonb),
      (3,'EVS','Our National Symbols','Tiger, peacock, lotus, mango and tricolour flag.','Three colors stand proud — saffron, white and green!',25,
        '["National animal: tiger","Bird: peacock","Flower: lotus"]'::jsonb,
        '[{"q":"National animal?","a":"Lion","b":"Tiger","c":"Cat","d":"Cow","correct":"B"},
          {"q":"National bird?","a":"Crow","b":"Peacock","c":"Parrot","d":"Sparrow","correct":"B"},
          {"q":"National flower?","a":"Rose","b":"Lotus","c":"Sunflower","d":"Lily","correct":"B"}]'::jsonb),

      (3,'Hindi','वचन','एक के लिए एकवचन, अनेक के लिए बहुवचन।','एक लड़का, दो लड़के — गिनने से वचन बदलता है!',25,
        '["एकवचन = एक","बहुवचन = अनेक","अंत में बदलाव"]'::jsonb,
        '[{"q":"लड़का का बहुवचन?","a":"लड़की","b":"लड़के","c":"लड़कियाँ","d":"बच्चा","correct":"B"},
          {"q":"पुस्तक का बहुवचन?","a":"पुस्तकें","b":"पुस्तक","c":"किताब","d":"पन्ने","correct":"A"},
          {"q":"फूल का बहुवचन?","a":"फूल","b":"फूलों","c":"फूले","d":"फूली","correct":"B"}]'::jsonb),
      (3,'Hindi','विलोम शब्द','विलोम का अर्थ है उल्टा शब्द — दिन/रात।','हर शब्द का एक उल्टा साथी होता है!',25,
        '["उल्टा अर्थ","जोड़ी याद करें","रोज़ बोलें"]'::jsonb,
        '[{"q":"दिन का विलोम?","a":"शाम","b":"रात","c":"सुबह","d":"दोपहर","correct":"B"},
          {"q":"अच्छा का विलोम?","a":"बुरा","b":"बढ़िया","c":"सुंदर","d":"प्यारा","correct":"A"},
          {"q":"ऊपर का विलोम?","a":"नीचे","b":"पास","c":"दूर","d":"आगे","correct":"A"}]'::jsonb),

      (3,'Computer','MS Paint Basics','Paint app lets you draw and color on the computer.','Click, drag and color — Paint makes you a digital artist!',30,
        '["Brush to draw","Eraser to remove","Save your art"]'::jsonb,
        '[{"q":"Tool to draw lines?","a":"Brush","b":"Eraser","c":"Text","d":"Save","correct":"A"},
          {"q":"To remove mistakes?","a":"Brush","b":"Eraser","c":"Color","d":"Bucket","correct":"B"},
          {"q":"To fill color?","a":"Pencil","b":"Bucket","c":"Eraser","d":"Line","correct":"B"}]'::jsonb),
      (3,'Computer','Files and Folders','Files store work; folders group files together.','A folder is like a school bag holding many files inside!',25,
        '["Files hold data","Folders group files","Give clear names"]'::jsonb,
        '[{"q":"What holds files?","a":"Folder","b":"Mouse","c":"Cable","d":"Screen","correct":"A"},
          {"q":"To open a folder?","a":"Shout","b":"Double click","c":"Throw","d":"Press power","correct":"B"},
          {"q":"Files should have?","a":"No name","b":"Clear name","c":"Numbers only","d":"Symbols","correct":"B"}]'::jsonb),

      -- GRADE 4
      (4,'Mathematics','Fractions','A fraction shows parts of a whole. 1/2 means one of two equal parts.','Cut a pizza in 4 slices — each slice is 1/4 of the whole!',30,
        '["Numerator on top","Denominator below","Equal parts only"]'::jsonb,
        '[{"q":"1/2 means?","a":"One whole","b":"Half","c":"Quarter","d":"Three","correct":"B"},
          {"q":"3/4 + 1/4 = ?","a":"1","b":"4/4","c":"Both A and B","d":"1/2","correct":"C"},
          {"q":"Bigger fraction?","a":"1/2","b":"1/4","c":"1/8","d":"1/10","correct":"A"}]'::jsonb),
      (4,'Mathematics','Geometry Shapes','Triangles, squares, circles and rectangles — learn sides and corners.','A square has 4 equal sides and 4 right corners!',30,
        '["Count sides","Count corners","Classify shapes"]'::jsonb,
        '[{"q":"Sides of a triangle?","a":"2","b":"3","c":"4","d":"5","correct":"B"},
          {"q":"Sides of a square?","a":"3","b":"4","c":"5","d":"6","correct":"B"},
          {"q":"A circle has?","a":"4 sides","b":"No sides","c":"3 sides","d":"2 sides","correct":"B"}]'::jsonb),

      (4,'English','Tenses','Past, present and future tell us when an action happens.','Yesterday I played, today I play, tomorrow I will play!',30,
        '["Past: did","Present: do","Future: will do"]'::jsonb,
        '[{"q":"Past of eat?","a":"Eated","b":"Ate","c":"Eating","d":"Eaten","correct":"B"},
          {"q":"Future of go?","a":"Went","b":"Going","c":"Will go","d":"Goes","correct":"C"},
          {"q":"Present of sing?","a":"Sang","b":"Sings","c":"Sung","d":"Singing","correct":"B"}]'::jsonb),
      (4,'English','Reading Comprehension','Read a passage and answer questions about it.','A good reader thinks while reading — every clue matters!',30,
        '["Read slowly","Find key words","Re-read if needed"]'::jsonb,
        '[{"q":"To understand text we?","a":"Skip","b":"Read carefully","c":"Throw book","d":"Sleep","correct":"B"},
          {"q":"Title tells us?","a":"Main topic","b":"Author age","c":"Price","d":"Date","correct":"A"},
          {"q":"Best way to learn meaning?","a":"Ignore","b":"Use dictionary","c":"Guess wildly","d":"Skip","correct":"B"}]'::jsonb),

      (4,'Science','Food Chain','Plants make food. Animals eat plants and each other.','Grass → grasshopper → frog → snake — life passes energy around!',30,
        '["Producers: plants","Consumers: animals","Decomposers recycle"]'::jsonb,
        '[{"q":"Producers are?","a":"Plants","b":"Lions","c":"Stones","d":"Rivers","correct":"A"},
          {"q":"Plant eaters called?","a":"Carnivores","b":"Herbivores","c":"Omnivores","d":"None","correct":"B"},
          {"q":"Meat eaters called?","a":"Herbivores","b":"Carnivores","c":"Plants","d":"Insects","correct":"B"}]'::jsonb),
      (4,'Science','Force and Motion','Push and pull are forces that move objects.','A ball stays still until you kick it — force makes it move!',30,
        '["Push or pull","Friction slows","Gravity pulls down"]'::jsonb,
        '[{"q":"Force can?","a":"Move things","b":"Eat","c":"Sleep","d":"Sing","correct":"A"},
          {"q":"Gravity pulls things?","a":"Up","b":"Down","c":"Sideways","d":"Nowhere","correct":"B"},
          {"q":"Friction is?","a":"Helpful only","b":"A resisting force","c":"Food","d":"Light","correct":"B"}]'::jsonb),

      (4,'EVS','Our Environment','Air, water, land and living things make our environment.','Trees give shade and clean air — protect them every day!',30,
        '["Keep clean","Plant trees","Save resources"]'::jsonb,
        '[{"q":"Plant trees to?","a":"Cut later","b":"Get clean air","c":"Block road","d":"Hide","correct":"B"},
          {"q":"What pollutes air?","a":"Plants","b":"Smoke","c":"Rain","d":"Sun","correct":"B"},
          {"q":"3 Rs are?","a":"Run rest read","b":"Reduce reuse recycle","c":"Read write run","d":"None","correct":"B"}]'::jsonb),
      (4,'EVS','Festivals of India','Diwali, Eid, Christmas, Holi and Pongal unite India.','Every festival is a rainbow of joy across our country!',25,
        '["Many religions","Many languages","One India"]'::jsonb,
        '[{"q":"Festival of lights?","a":"Holi","b":"Diwali","c":"Eid","d":"Pongal","correct":"B"},
          {"q":"Festival of colors?","a":"Diwali","b":"Holi","c":"Onam","d":"Eid","correct":"B"},
          {"q":"Christmas is in?","a":"December","b":"July","c":"March","d":"May","correct":"A"}]'::jsonb),

      (4,'Hindi','संज्ञा','व्यक्ति, स्थान, वस्तु के नाम संज्ञा कहलाते हैं।','मोहन, दिल्ली, कुर्सी — सब संज्ञा हैं!',30,
        '["व्यक्ति वस्तु स्थान","नाम पहचानें","प्रकार समझें"]'::jsonb,
        '[{"q":"कौन सी संज्ञा?","a":"दौड़ना","b":"राम","c":"तेज़","d":"लाल","correct":"B"},
          {"q":"शहर का नाम क्या है?","a":"क्रिया","b":"संज्ञा","c":"विशेषण","d":"संख्या","correct":"B"},
          {"q":"पुस्तक एक?","a":"क्रिया","b":"संज्ञा","c":"विशेषण","d":"सर्वनाम","correct":"B"}]'::jsonb),
      (4,'Hindi','मुहावरे','मुहावरे विशेष अर्थ देने वाले वाक्यांश हैं।','आँखों का तारा का मतलब बहुत प्यारा होता है!',25,
        '["सटीक अर्थ","कहानी में प्रयोग","रोचक बनाते हैं"]'::jsonb,
        '[{"q":"आँखों का तारा?","a":"दुश्मन","b":"बहुत प्यारा","c":"उदास","d":"दूर","correct":"B"},
          {"q":"नाक में दम करना?","a":"खुश करना","b":"परेशान करना","c":"सोना","d":"गाना","correct":"B"},
          {"q":"हाथ बँटाना?","a":"मदद करना","b":"लड़ना","c":"भागना","d":"रोना","correct":"A"}]'::jsonb),

      (4,'Computer','MS Word Basics','Type and format documents with bold, italic and colors.','Type your story, make it bold — Word is your digital notebook!',30,
        '["Bold for stress","Italic for style","Save your work"]'::jsonb,
        '[{"q":"B button makes text?","a":"Bold","b":"Italic","c":"Big","d":"Red","correct":"A"},
          {"q":"I button makes text?","a":"Big","b":"Italic","c":"Bold","d":"Small","correct":"B"},
          {"q":"To keep work safe?","a":"Print","b":"Save","c":"Close","d":"Delete","correct":"B"}]'::jsonb),
      (4,'Computer','Internet Safety','Never share password. Tell parents about strangers online.','The internet is huge — stay smart, stay safe!',30,
        '["Keep password secret","No personal info","Tell adults"]'::jsonb,
        '[{"q":"Share password with?","a":"Everyone","b":"No one","c":"Strangers","d":"Anyone online","correct":"B"},
          {"q":"Stranger online asks address?","a":"Tell quickly","b":"Tell parent","c":"Reply","d":"Share photo","correct":"B"},
          {"q":"Safe sites usually have?","a":"http","b":"https","c":"htp","d":"www only","correct":"B"}]'::jsonb)
    ) AS t(grade, subject, topic, content, story, duration, key_points, quizzes)
  LOOP
    -- Match the existing lesson
    SELECT id INTO new_lesson_id FROM public.lessons 
    WHERE grade=rec.grade AND subject=rec.subject AND topic=rec.topic;

    -- If the lesson doesn't exist, insert it
    IF new_lesson_id IS NULL THEN
      INSERT INTO public.lessons (grade, subject, topic, lesson_content, story, duration_minutes, key_points)
      VALUES (
        rec.grade, rec.subject, rec.topic, rec.content, rec.story, rec.duration,
        ARRAY(SELECT jsonb_array_elements_text(rec.key_points))
      )
      RETURNING id INTO new_lesson_id;
    END IF;

    -- Delete any existing quizzes for this lesson to prevent duplicates
    DELETE FROM public.quizzes WHERE lesson_id = new_lesson_id;

    -- Insert the quizzes
    FOR q_data IN SELECT * FROM jsonb_array_elements(rec.quizzes)
    LOOP
      INSERT INTO public.quizzes (lesson_id, question, option_a, option_b, option_c, option_d, correct_answer)
      VALUES (
        new_lesson_id,
        q_data->>'q',
        q_data->>'a',
        q_data->>'b',
        q_data->>'c',
        q_data->>'d',
        q_data->>'correct'
      );
    END LOOP;
  END LOOP;
END $$;
