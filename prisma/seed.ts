import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // ----------- Users -----------
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      name: 'Student User',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'STUDENT',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // ----------- Categories -----------
  const cat1 = await prisma.category.upsert({
    where: { slug: 'programming' },
    update: {},
    create: { name: 'Programming', slug: 'programming', icon: 'code' },
  });

  const cat2 = await prisma.category.upsert({
    where: { slug: 'design' },
    update: {},
    create: { name: 'Design', slug: 'design', icon: 'design' },
  });

  // ----------- Tags -----------
  const tag1 = await prisma.tag.upsert({
    where: { name: 'JavaScript' },
    update: {},
    create: { name: 'JavaScript' },
  });

  const tag2 = await prisma.tag.upsert({
    where: { name: 'Web' },
    update: {},
    create: { name: 'Web' },
  });

  // ----------- Courses -----------
  const course1 = await prisma.course.upsert({
    where: { slug: 'intro-to-js' },
    update: {},
    create: {
      title: 'Intro to JavaScript',
      slug: 'intro-to-js',
      description: 'Learn JavaScript basics',
      imageUrl: 'https://picsum.photos/200/300',
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
      imageUrl: 'https://picsum.photos/200/300',
      isFree: false,
      priceBaht: 500,
      isPublished: true,
      categoryId: cat2.id,
    },
  });

  // ----------- Course Tags -----------
  await prisma.courseTag.createMany({
    data: [
      { courseId: course1.id, tagId: tag1.id },
      { courseId: course1.id, tagId: tag2.id },
    ],
    skipDuplicates: true,
  });

  // ----------- Lessons -----------
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Variables and Types',
      content: 'Introduction to JS variables and types.',
      position: 1,
      courseId: course1.id,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Functions',
      content: 'Learn JS functions.',
      position: 2,
      courseId: course1.id,
    },
  });

  // ----------- PDFs -----------
  await prisma.pdf.create({
    data: {
      name: 'JS Basics PDF',
      lessonId: lesson1.id,
      resourceUrl: 'https://example.com/js-basics.pdf',
    },
  });

  // ----------- User Progress -----------
  await prisma.progress.create({
    data: {
      userId: user1.id,
      lessonId: lesson1.id,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // ----------- User Activities -----------
  await prisma.userActivity.create({
    data: {
      userId: user1.id,
      date: new Date(),
    },
  });

  // ----------- Course Purchases -----------
  await prisma.coursePurchase.create({
    data: {
      userId: user1.id,
      courseId: course2.id,
      paid: false,
    },
  });

  console.log({
    user1,
    user2,
    cat1,
    cat2,
    tag1,
    tag2,
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
