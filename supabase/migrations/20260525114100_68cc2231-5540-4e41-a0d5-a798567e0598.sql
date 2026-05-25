-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 4),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 4),
    subject_name TEXT NOT NULL,
    subject_color TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'BookOpen',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 4),
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    lesson_content TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    key_points TEXT[] DEFAULT '{}',
    story TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D'))
);

-- Create student_progress table
CREATE TABLE public.student_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    score INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(student_id, lesson_id)
);

-- Create worksheets table
CREATE TABLE public.worksheets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    worksheet_content TEXT NOT NULL,
    answer_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Subjects policies (public read, admin write)
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert subjects" ON public.subjects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Lessons policies (public read, admin write)
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert lessons" ON public.lessons FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Quizzes policies (public read, admin write)
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Student progress policies
CREATE POLICY "Users can view own progress" ON public.student_progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own progress" ON public.student_progress FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update own progress" ON public.student_progress FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete own progress" ON public.student_progress FOR DELETE USING (auth.uid() = student_id);

-- Worksheets policies (public read, admin write)
CREATE POLICY "Anyone can view worksheets" ON public.worksheets FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert worksheets" ON public.worksheets FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, grade)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'grade')::integer, 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed subjects data
INSERT INTO public.subjects (grade, subject_name, subject_color, icon_name) VALUES
(1, 'Mathematics', '#7C3AED', 'Calculator'),
(1, 'English', '#06B6D4', 'BookOpen'),
(1, 'Science', '#22C55E', 'FlaskConical'),
(1, 'EVS', '#F97316', 'Globe'),
(1, 'Hindi', '#EC4899', 'MessageSquare'),
(1, 'Computer', '#14B8A6', 'Monitor'),
(2, 'Mathematics', '#7C3AED', 'Calculator'),
(2, 'English', '#06B6D4', 'BookOpen'),
(2, 'Science', '#22C55E', 'FlaskConical'),
(2, 'EVS', '#F97316', 'Globe'),
(2, 'Hindi', '#EC4899', 'MessageSquare'),
(2, 'Computer', '#14B8A6', 'Monitor'),
(3, 'Mathematics', '#7C3AED', 'Calculator'),
(3, 'English', '#06B6D4', 'BookOpen'),
(3, 'Science', '#22C55E', 'FlaskConical'),
(3, 'EVS', '#F97316', 'Globe'),
(3, 'Hindi', '#EC4899', 'MessageSquare'),
(3, 'Computer', '#14B8A6', 'Monitor'),
(4, 'Mathematics', '#7C3AED', 'Calculator'),
(4, 'English', '#06B6D4', 'BookOpen'),
(4, 'Science', '#22C55E', 'FlaskConical'),
(4, 'EVS', '#F97316', 'Globe'),
(4, 'Hindi', '#EC4899', 'MessageSquare'),
(4, 'Computer', '#14B8A6', 'Monitor');

-- Seed sample lessons for Grade 1
INSERT INTO public.lessons (grade, subject, topic, lesson_content, duration_minutes, key_points, story) VALUES
(1, 'Mathematics', 'Counting 1 to 20', 'Welcome to counting! Let us learn how to count from 1 to 20. We use numbers every day to count our toys, friends, and even cookies! Start with 1 (one), then 2 (two), 3 (three), and keep going until you reach 20 (twenty). Try counting your fingers and toes — you have 20 in total!', 30, ARRAY['Numbers go from 1 to 20', 'Count objects around you', 'Practice counting backwards too'], 'Once there was a little rabbit named Ruby who loved to count. She counted 5 carrots for breakfast, 7 flowers in the garden, and 10 stars at night. Ruby became the best counter in the forest!'),
(1, 'Mathematics', 'Shapes Around Us', 'Shapes are everywhere! A circle is round like a ball. A square has four equal sides like a building block. A triangle has three sides like a pizza slice. A rectangle is long like a book. Look around your room — how many shapes can you find?', 30, ARRAY['Circle is round', 'Square has 4 equal sides', 'Triangle has 3 sides', 'Rectangle has 4 sides'], 'Tommy the triangle wanted to roll down the hill like his friend Cici the circle. But Tommy learned that being a triangle was special too — he could make the best sandwiches!'),
(1, 'English', 'The Alphabet A-M', 'Let us learn the first half of the alphabet! A is for Apple, B is for Ball, C is for Cat, and so on until M for Moon. Practice writing each letter and saying words that start with it.', 30, ARRAY['A-M are the first 13 letters', 'Each letter makes a special sound', 'Practice writing letters'], 'Amy the ant wanted to read a book. She started with letter A and slowly learned B, C, D... By the time she reached M, she could read "Amazing Moon"!'),
(1, 'English', 'My Family', 'Your family is special! We have a mother (Mummy), father (Papa), brothers, sisters, grandparents, and sometimes pets too. Each family is different and beautiful. Let us learn words to describe our family members.', 30, ARRAY['Family members have special names', 'We love our family', 'Draw your family tree'], 'Little Zara drew a big tree and put pictures of all her family on it. She realized her family was like a strong tree — everyone connected and supporting each other!'),
(1, 'Science', 'Plants Around Us', 'Plants are living things! They need water, sunlight, and soil to grow. Plants have roots, stem, leaves, and flowers. Some plants give us food like apples and carrots. Trees give us shade and clean air.', 30, ARRAY['Plants need water, sun, and soil', 'Parts of a plant: roots, stem, leaves', 'Plants give us food and oxygen'], 'Sammy the seed was buried in the ground. He felt scared at first, but then rain gave him water and sun gave him warmth. Sammy grew into a tall sunflower!'),
(1, 'Science', 'Animals and Their Homes', 'Every animal has a special home. Birds live in nests. Dogs live in kennels. Bees live in beehives. Rabbits live in burrows. Fish live in water. Where do you live?', 30, ARRAY['Different animals have different homes', 'Homes keep animals safe', 'Humans live in houses'], 'Benny the bird could not find a home. He tried a burrow (too dark!), a pond (he cannot swim!), and finally built a cozy nest in a tree. It was perfect!'),
(1, 'EVS', 'My School', 'School is a wonderful place! We come to school to learn, play, and make friends. Our school has classrooms, a playground, a library, and a canteen. We say hello to our teachers and classmates every day.', 30, ARRAY['School is for learning and fun', 'We have teachers and friends', 'Respect school property'], 'Mia was scared on her first day. But her teacher Mrs. Sharma gave her a warm smile and her classmate Ravi shared his crayons. Now Mia loves school!'),
(1, 'EVS', 'Good Habits', 'Good habits make us better people! We should brush our teeth twice a day, wash our hands before eating, say "please" and "thank you", and help our parents. Good habits keep us healthy and happy!', 30, ARRAY['Brush teeth twice daily', 'Wash hands before eating', 'Be polite and helpful'], 'Timmy the tiger had bad manners. He never said thank you and left his toys everywhere. One day, his friends stopped playing with him. Timmy learned good manners and became the most popular tiger!');