const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.codexLaw.count();
  if (count === 0) {
    await prisma.codexLaw.createMany({
      data: [
        { title: "Law1", description: "Default Codex Law 1" },
        { title: "Law2", description: "Default Codex Law 2" },
        { title: "Law3", description: "Default Codex Law 3" },
      ]
    });
    console.log("Seeded default Codex Laws");
  } else {
    console.log("Codex Laws already exist");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
