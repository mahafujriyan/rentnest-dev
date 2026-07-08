import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@rentnest.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentalRequest.deleteMany();
  await prisma.property.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash(adminPassword, saltRounds);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: adminEmail,
      password: adminHash,
      role: "ADMIN",
      phone: "+8801000000000"
    }
  });

  const categories = await Promise.all(
    ["Apartment", "House", "Studio", "Villa", "Office"].map((name) =>
      prisma.category.create({ data: { name, description: `${name} rentals` } })
    )
  );

  const landlordPassword = await bcrypt.hash("Landlord123!", saltRounds);
  const landlords = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          name: `Landlord ${i + 1}`,
          email: `landlord${i + 1}@rentnest.com`,
          password: landlordPassword,
          role: "LANDLORD",
          phone: `+88017${String(i + 1).padStart(8, "0")}`
        }
      })
    )
  );

  const tenantPassword = await bcrypt.hash("Tenant123!", saltRounds);
  const tenants = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.user.create({
        data: {
          name: `Tenant ${i + 1}`,
          email: `tenant${i + 1}@rentnest.com`,
          password: tenantPassword,
          role: "TENANT",
          phone: `+88018${String(i + 1).padStart(8, "0")}`
        }
      })
    )
  );

  const cities = [
    { city: "Dhaka", division: "Dhaka" },
    { city: "Chattogram", division: "Chattogram" },
    { city: "Sylhet", division: "Sylhet" },
    { city: "Rajshahi", division: "Rajshahi" },
    { city: "Khulna", division: "Khulna" }
  ];

  const properties = [];
  for (let i = 0; i < 50; i++) {
    const loc = cities[i % cities.length];
    const property = await prisma.property.create({
      data: {
        title: `Property ${i + 1} in ${loc.city}`,
        description: `Spacious rental property #${i + 1} with modern amenities.`,
        categoryId: categories[i % categories.length].id,
        price: 150 + i * 10,
        city: loc.city,
        division: loc.division,
        address: `${i + 1} Main Road, ${loc.city}`,
        bedrooms: (i % 4) + 1,
        bathrooms: (i % 3) + 1,
        area: 800 + i * 20,
        amenities: ["WiFi", "Parking", "Security"],
        images: [`https://picsum.photos/seed/rentnest-${i}/800/600`],
        landlordId: landlords[i % landlords.length].id
      }
    });
    properties.push(property);
  }

  const pendingRental = await prisma.rentalRequest.create({
    data: {
      tenantId: tenants[0].id,
      propertyId: properties[0].id,
      moveInDate: new Date(),
      message: "Interested in this property"
    }
  });

  const approvedRental = await prisma.rentalRequest.create({
    data: {
      tenantId: tenants[1].id,
      propertyId: properties[1].id,
      status: "APPROVED",
      moveInDate: new Date(),
      message: "Ready to move in"
    }
  });

  const activeRental = await prisma.rentalRequest.create({
    data: {
      tenantId: tenants[2].id,
      propertyId: properties[2].id,
      status: "ACTIVE",
      moveInDate: new Date()
    }
  });

  await prisma.payment.create({
    data: {
      rentalRequestId: activeRental.id,
      tenantId: tenants[2].id,
      transactionId: `pi_demo_${Date.now()}`,
      amount: properties[2].price,
      status: "COMPLETED",
      paidAt: new Date()
    }
  });

  const completedRental = await prisma.rentalRequest.create({
    data: {
      tenantId: tenants[3].id,
      propertyId: properties[3].id,
      status: "COMPLETED",
      moveInDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.review.create({
    data: {
      rentalRequestId: completedRental.id,
      tenantId: tenants[3].id,
      propertyId: properties[3].id,
      rating: 5,
      comment: "Great place to live!"
    }
  });

  console.log("Seed completed successfully");
  console.log({
    admin: admin.email,
    landlords: landlords.length,
    tenants: tenants.length,
    categories: categories.length,
    properties: properties.length,
    sampleRentals: { pendingRental: pendingRental.id, approvedRental: approvedRental.id }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
