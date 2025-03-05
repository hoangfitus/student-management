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
  const statuses = [
    'Đang theo học',
    'Đã hoàn thành chương trình, chờ xét tốt nghiệp',
    'Đã tốt nghiệp',
    'Bảo lưu',
    'Đình chỉ học tập',
    'Tình trạng khác',
  ];

  for (const name of statuses) {
    await prisma.studentStatus.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const programs = ['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ'];

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
