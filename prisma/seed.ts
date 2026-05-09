import "dotenv/config";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient, PostStatus, PostType, Role } from "../generated/prisma";
import { hashPassword, normalizeEmail } from "../app/_lib/auth-crypto";

const tursoUrl =
  process.env.TURSO_DATABASE_URL ?? process.env["scbsedu_TURSO_DATABASE_URL"];
const tursoAuthToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env["scbsedu_TURSO_AUTH_TOKEN"];
const databaseUrl = process.env.DATABASE_URL;

if (!tursoUrl && !databaseUrl) {
  throw new Error("TURSO_DATABASE_URL or DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: tursoUrl
    ? new PrismaLibSQL({
        url: tursoUrl,
        authToken: tursoAuthToken,
      })
    : new PrismaBetterSqlite3({
        url: databaseUrl!,
      }),
});

async function main() {
  const ownerPassword = await hashPassword("Alnazem");

  await prisma.session.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const [scienceCategory, codingCategory, clubCategory] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Bilim",
        slug: "bilim",
      },
    }),
    prisma.category.create({
      data: {
        name: "Yazilim",
        slug: "yazilim",
      },
    }),
    prisma.category.create({
      data: {
        name: "Kulup",
        slug: "kulup",
      },
    }),
  ]);

  const [roboticsTag, pythonTag, aiTag, sustainabilityTag] = await Promise.all([
    prisma.tag.create({
      data: {
        name: "Robotik",
        slug: "robotik",
      },
    }),
    prisma.tag.create({
      data: {
        name: "Python",
        slug: "python",
      },
    }),
    prisma.tag.create({
      data: {
        name: "Yapay Zeka",
        slug: "yapay-zeka",
      },
    }),
    prisma.tag.create({
      data: {
        name: "Surdurulebilirlik",
        slug: "surdurulebilirlik",
      },
    }),
  ]);

  const owner = await prisma.user.create({
    data: {
      name: "Ahmed Alnazem",
      username: "ahmedalnazem",
      email: normalizeEmail("owner@school.local"),
      password: ownerPassword,
      role: Role.OWNER,
      isProtected: true,
    },
  });

  await prisma.post.create({
    data: {
      title: "Robotik Kulubu Icin Ilk Blog Yazim",
      slug: "robotik-kulubu-ilk-blog",
      content:
        "Bu donem robotik kulubunde cizgi izleyen arac, sensor kullanimi ve ekip ici gorev paylasimi uzerine calisiyoruz. Yazinin amaci yeni katilan ogrencilerin kulup surecini daha rahat anlamasini saglamak.",
      excerpt:
        "Kulup calismalarimizi ve bu donem hedeflerimizi tanitan kisa blog yazisi.",
      classLevel: "first-secondary",
      type: PostType.BLOG,
      status: PostStatus.PUBLISHED,
      authorId: owner.id,
      categoryId: clubCategory.id,
      publishedAt: new Date("2026-04-19T10:00:00.000Z"),
      createdAt: new Date("2026-04-18T08:15:00.000Z"),
      updatedAt: new Date("2026-04-19T10:00:00.000Z"),
      tags: {
        create: [{ tagId: roboticsTag.id }, { tagId: aiTag.id }],
      },
    },
  });

  await prisma.post.create({
    data: {
      title: "مشروع منصة المكتبة الصفية",
      slug: "maktaba-safiya-project",
      content:
        "هذا المشروع يركز على تنظيم محتوى المدرسة بحسب الصف الدراسي، مع فصل المشاريع عن الأكواد والأبحاث حتى يتمكن كل صف من الوصول إلى مواده مباشرة.",
      excerpt: "مشروع تجريبي لتنظيم محتوى المكتبة بحسب الصف الدراسي.",
      classLevel: "first-secondary",
      type: PostType.PROJECT,
      status: PostStatus.PUBLISHED,
      authorId: owner.id,
      categoryId: codingCategory.id,
      publishedAt: new Date("2026-04-21T09:30:00.000Z"),
      createdAt: new Date("2026-04-21T09:30:00.000Z"),
      updatedAt: new Date("2026-04-21T09:30:00.000Z"),
      tags: {
        create: [{ tagId: pythonTag.id }, { tagId: aiTag.id }],
      },
    },
  });

  await prisma.post.create({
    data: {
      title: "Yapay Zeka Destekli Sulama Sistemi Arastirmasi",
      slug: "yapay-zeka-destekli-sulama-sistemi",
      content:
        "Arastirma boyunca dusuk maliyetli sensorlerin dogruluk oranlarini, veri toplama sikligini ve otomatik sulama icin esik degerlerini inceledim. Sonuc olarak ogrenci projeleri icin basit ama aciklanabilir bir model kullanmanin daha uygun olduguna karar verdim.",
      excerpt:
        "Toprak nemi ve hava verisini birlestiren okul projesi icin arastirma notlari.",
      classLevel: "second-secondary",
      type: PostType.RESEARCH,
      status: PostStatus.PENDING,
      authorId: owner.id,
      categoryId: scienceCategory.id,
      createdAt: new Date("2026-04-20T11:45:00.000Z"),
      updatedAt: new Date("2026-04-20T11:45:00.000Z"),
      tags: {
        create: [{ tagId: aiTag.id }, { tagId: sustainabilityTag.id }],
      },
    },
  });

  await prisma.post.create({
    data: {
      title: "Python ile Not Ortalamasi Hesaplama",
      slug: "python-ile-not-ortalamasi-hesaplama",
      content:
        "def ortalama_hesapla(notlar):\n    return sum(notlar) / len(notlar)\n\nsinav_notlari = [78, 85, 92]\nprint(ortalama_hesapla(sinav_notlari))",
      excerpt: "Fonksiyon yapisini gosteren basit bir kod paylasimi.",
      classLevel: "third-secondary",
      type: PostType.CODE,
      status: PostStatus.DRAFT,
      authorId: owner.id,
      categoryId: codingCategory.id,
      createdAt: new Date("2026-04-22T13:10:00.000Z"),
      updatedAt: new Date("2026-04-22T13:10:00.000Z"),
      tags: {
        create: [{ tagId: pythonTag.id }],
      },
    },
  });

  await prisma.post.create({
    data: {
      title: "Enerji Verimliligi Sunumu Taslagi",
      slug: "enerji-verimliligi-sunumu-taslagi",
      content:
        "Sunumda okul binasi icindeki enerji tuketim noktalarini siniflandirdim ancak bazi tablo kaynaklarini henuz eklemedim. Yayina alinmadan once kaynakca ve yontem bolumu guclendirilmeli.",
      excerpt:
        "Veri kaynagi eksik oldugu icin revizyon bekleyen arastirma paylasimi.",
      classLevel: "second-secondary",
      type: PostType.RESEARCH,
      status: PostStatus.REJECTED,
      authorId: owner.id,
      categoryId: scienceCategory.id,
      createdAt: new Date("2026-04-16T09:00:00.000Z"),
      updatedAt: new Date("2026-04-17T14:30:00.000Z"),
      tags: {
        create: [{ tagId: sustainabilityTag.id }],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
