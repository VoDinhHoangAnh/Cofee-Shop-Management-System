import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config({ path: ".env.local" });
dotenv.config();

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error('Missing DATABASE_URL. Please check ".env.local".');
}

const client = new MongoClient(uri);

const productImages = [
  "/img/1778047939093.jpg",
  "/img/1778047980903.jpg",
  "/img/1778047995403.jpg",
  "/img/1778048013431.jpg",
  "/img/1778048032814.jpg",
  "/img/1778339696962.jpg",
];

function getProductImage(index: number) {
  return productImages[index % productImages.length] ?? null;
}

async function main() {
  await client.connect();

  const db = client.db();

  if (["admin", "config", "local"].includes(db.databaseName)) {
    throw new Error(
      `Refusing to seed system database "${db.databaseName}". Please check DATABASE_URL.`,
    );
  }

  console.log("[SEED] Connected database:", db.databaseName);

  const now = new Date();

  await db.collection("User").deleteMany({});
  await db.collection("Category").deleteMany({});
  await db.collection("Product").deleteMany({});
  await db.collection("Size").deleteMany({});
  await db.collection("Topping").deleteMany({});
  await db.collection("Order").deleteMany({});
  await db.collection("OrderItem").deleteMany({});
  await db.collection("AuditLog").deleteMany({});

  const adminId = new ObjectId();
  const staffId = new ObjectId();

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const staffPasswordHash = await bcrypt.hash("staff123", 10);

  await db.collection("User").insertMany([
    {
      _id: adminId,
      username: "admin",
      name: "Manager",
      passwordHash: adminPasswordHash,
      role: "MANAGER",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: staffId,
      username: "staff",
      name: "Staff User",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const categories = [
    { _id: new ObjectId(), name: "Cà phê", description: "Các loại cà phê", productIDs: [] as ObjectId[] },
    { _id: new ObjectId(), name: "Trà", description: "Các loại trà", productIDs: [] as ObjectId[] },
    { _id: new ObjectId(), name: "Đá xay", description: "Đá xay và đồ uống lạnh", productIDs: [] as ObjectId[] },
    { _id: new ObjectId(), name: "Sinh tố", description: "Sinh tố trái cây", productIDs: [] as ObjectId[] },
    { _id: new ObjectId(), name: "Nước ép", description: "Nước ép tươi", productIDs: [] as ObjectId[] },
  ];

  await db.collection("Category").insertMany(
    categories.map((category) => ({
      ...category,
      createdAt: now,
      updatedAt: now,
    })),
  );

  const categoryIds: Record<string, ObjectId> = {};

  for (const category of categories) {
    categoryIds[category.name] = category._id;
  }

  const products = [
    {
      name: "Cà phê đen",
      basePrice: 25000,
      category: "Cà phê",
      sizes: [
        { name: "S", price: 25000 },
        { name: "M", price: 30000 },
        { name: "L", price: 35000 },
      ],
    },
    {
      name: "Cà phê sữa đá",
      basePrice: 29000,
      category: "Cà phê",
      sizes: [
        { name: "S", price: 29000 },
        { name: "M", price: 34000 },
        { name: "L", price: 39000 },
      ],
    },
    {
      name: "Latte",
      basePrice: 45000,
      category: "Cà phê",
      sizes: [
        { name: "S", price: 45000 },
        { name: "M", price: 50000 },
        { name: "L", price: 55000 },
      ],
    },
    {
      name: "Cappuccino",
      basePrice: 45000,
      category: "Cà phê",
      sizes: [
        { name: "S", price: 45000 },
        { name: "M", price: 50000 },
        { name: "L", price: 55000 },
      ],
    },
    {
      name: "Mocha",
      basePrice: 50000,
      category: "Cà phê",
      sizes: [
        { name: "S", price: 50000 },
        { name: "M", price: 55000 },
        { name: "L", price: 60000 },
      ],
    },
    {
      name: "Trà đào",
      basePrice: 35000,
      category: "Trà",
      sizes: [
        { name: "M", price: 35000 },
        { name: "L", price: 40000 },
      ],
    },
    {
      name: "Trà vải",
      basePrice: 35000,
      category: "Trà",
      sizes: [
        { name: "M", price: 35000 },
        { name: "L", price: 40000 },
      ],
    },
    {
      name: "Trà xanh",
      basePrice: 30000,
      category: "Trà",
      sizes: [
        { name: "M", price: 30000 },
        { name: "L", price: 35000 },
      ],
    },
    {
      name: "Đá xay cà phê",
      basePrice: 40000,
      category: "Đá xay",
      sizes: [
        { name: "M", price: 40000 },
        { name: "L", price: 45000 },
      ],
    },
    {
      name: "Đá xay chocolate",
      basePrice: 45000,
      category: "Đá xay",
      sizes: [
        { name: "M", price: 45000 },
        { name: "L", price: 50000 },
      ],
    },
    {
      name: "Sinh tố bơ",
      basePrice: 40000,
      category: "Sinh tố",
      sizes: [
        { name: "M", price: 40000 },
        { name: "L", price: 45000 },
      ],
    },
    {
      name: "Sinh tố xoài",
      basePrice: 40000,
      category: "Sinh tố",
      sizes: [
        { name: "M", price: 40000 },
        { name: "L", price: 45000 },
      ],
    },
    {
      name: "Nước ép cam",
      basePrice: 35000,
      category: "Nước ép",
      sizes: [
        { name: "M", price: 35000 },
        { name: "L", price: 40000 },
      ],
    },
    {
      name: "Nước ép táo",
      basePrice: 35000,
      category: "Nước ép",
      sizes: [
        { name: "M", price: 35000 },
        { name: "L", price: 40000 },
      ],
    },
  ];

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const categoryId = categoryIds[product.category];

    if (!categoryId) {
      throw new Error(`Category not found: ${product.category}`);
    }

    const productId = new ObjectId();

    await db.collection("Product").insertOne({
      _id: productId,
      name: product.name,
      description: null,
      basePrice: product.basePrice,
      categoryIDs: [categoryId],
      status: "AVAILABLE",
      image: getProductImage(index),
      createdAt: now,
      updatedAt: now,
    });

    await db.collection("Size").insertMany(
      product.sizes.map((size) => ({
        name: size.name,
        price: size.price,
        productId,
        createdAt: now,
        updatedAt: now,
      })),
    );

    await db.collection("Category").updateOne(
      { _id: categoryId },
      {
        $addToSet: {
          productIDs: productId,
        },
        $set: {
          updatedAt: now,
        },
      },
    );
  }

  await db.collection("Topping").insertMany([
    {
      name: "Trân châu",
      price: 5000,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Thạch cà phê",
      price: 5000,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Kem cheese",
      price: 10000,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Pudding",
      price: 7000,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.createCollection("Order").catch(() => undefined);
  await db.createCollection("OrderItem").catch(() => undefined);

  await db.collection("AuditLog").insertOne({
    userId: adminId,
    action: "SEED_DATABASE",
    target: "Database",
    dataAfter: JSON.stringify({
      database: db.databaseName,
      users: ["admin", "staff"],
      productCount: products.length,
    }),
    timestamp: now,
  });

  console.log("[SEED] Done.");
  console.log("[SEED] Collections:");
  console.log("- User");
  console.log("- Category");
  console.log("- Product");
  console.log("- Size");
  console.log("- Topping");
  console.log("- Order");
  console.log("- OrderItem");
  console.log("- AuditLog");
  console.log("[SEED] Login accounts:");
  console.log("Manager: admin / admin123");
  console.log("Staff: staff / staff123");
}

main()
  .catch((error) => {
    console.error("[SEED_ERROR]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });