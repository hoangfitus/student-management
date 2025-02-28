import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // List of faculties
  const faculties = [
    'Khoa Luật',
    'Khoa Tiếng Anh thương mại',
    'Khoa Tiếng Nhật',
    'Khoa Tiếng Pháp',
  ];

  for (const name of faculties) {
    await prisma.faculty.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // List of student statuses
  const statuses = ['Đang học', 'Đã tốt nghiệp', 'Đã thôi học', 'Tạm dừng học'];

  for (const name of statuses) {
    await prisma.studentStatus.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const programs = ['Đại trà', 'Chất lượng cao', 'Việt Nhật', 'Việt Hàn'];

  for (const name of programs) {
    await prisma.program.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
