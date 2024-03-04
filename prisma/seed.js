const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const defaultTags = [
  { name: "⛰️" },
  { name: "🏕️" },
  { name: "🏞️" },
  { name: "🌳" },
  { name: "🏖️" },
  { name: "🏟️" },
  { name: "🏛️" },
  { name: "☀️" },
  { name: "🌙" },
  { name: "🌈" },
  { name: "🌊" },
  { name: "🌧️" },
  { name: "🌦️" },
];

async function main() {
  const createTags = defaultTags.map(async (tag) => {
    try {
      return await prisma.tag.create({
        data: tag,
      });
    } catch (e) {
      console.log(`Error: ${e.code === "P2002" ? "Tag already exists" : e.message}`);
    }
  });

  const tagResults = await Promise.all(createTags);
  return tagResults
    .filter((result) => result !== undefined)
    .sort((a, b) => a.id - b.id)
    .map((result) => `Tag "${result.name}" created with id: ${result.id}`);
}

main()
  .then((res) => {
    console.log(res);
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
