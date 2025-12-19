import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // ----------- Categories -----------
  const cat1 = await prisma.category.upsert({
    where: { slug: 'programming' },
    update: {},
    create: { name: 'Programming', slug: 'programming', icon: 'CodeRounded' },
  });

  const cat2 = await prisma.category.upsert({
    where: { slug: 'design' },
    update: {},
    create: { name: 'Design', slug: 'design', icon: 'DesignServicesRounded' },
  });

  // ----------- Courses -----------
  const course1 = await prisma.course.upsert({
    where: { slug: 'intro-to-javascript' },
    update: {},
    create: {
      title: 'Intro to JavaScript',
      slug: 'intro-to-javascript',
      description: 'Learn JavaScript basics',
      imagePublicId: 'programming-course-forest-adventure_s60czu',
      isFree: true,
      isPublished: true,
      categoryId: cat1.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: 'design-basics' },
    update: {},
    create: {
      title: 'Design Basics',
      slug: 'design-basics',
      description: 'Learn design fundamentals',
      imagePublicId: 'programming-course-learn-through-drawing_v7d9yy',
      isFree: false,
      priceBaht: 500,
      isPublished: true,
      categoryId: cat2.id,
    },
  });

  // ----------- Lessons -----------
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Variables and Types',
      content: 'Introduction to JS variables and types.',
      position: 1,
      courseId: course1.id,
      isPreview: true,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Functions',
      content: 'Learn JS functions.',
      position: 2,
      courseId: course1.id,
      isPreview: false,
    },
  });

  // ----------- PDFs -----------
  await prisma.pdf.create({
    data: {
      name: 'JS Basics PDF',
      lessonId: lesson1.id,
      publicId: 'GoodCV1_r1mmjt',
    },
  });

  console.log({
    cat1,
    cat2,
    course1,
    course2,
    lesson1,
    lesson2,
  });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
