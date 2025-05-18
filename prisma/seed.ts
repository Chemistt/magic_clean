import { faker } from "@faker-js/faker";
import {
	AccountStatus,
	BookingStatus,
	PaymentStatus,
	PrismaClient,
	Role,
} from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
	// Fetch existing Service Categories
	const categories = await prisma.serviceCategory.findMany();
	if (categories.length === 0) {
		throw new Error(
			"No Service Categories found. Please create some before seeding."
		);
	}

	// Create Users
	const users = [];
	const cleaners = [];
	const homeOwners = [];
	for (let userIndex = 0; userIndex < 100; userIndex++) {
		const role = userIndex % 2 === 0 ? Role.CLEANER : Role.HOME_OWNER;
		const name = String(faker.person.fullName());
		const email = `${String(faker.internet.email()).toLowerCase()}.${String(userIndex)}@example.com`;
		const image = String(faker.image.avatarGitHub());
		const user = await prisma.user.create({
			data: {
				name,
				email,
				image,
				role,
				status: AccountStatus.ACTIVE,
			},
		});
		users.push(user);
		if (role === Role.CLEANER) {
			cleaners.push(user);
		} else {
			homeOwners.push(user);
		}
	}

	// Create CleanerProfiles and Services
	for (const cleaner of cleaners) {
		const profile = await prisma.cleanerProfile.create({
			data: {
				userId: cleaner.id,
				isVerified: faker.datatype.boolean(),
				askingPrice: Number(
					faker.finance.amount({ min: 20, max: 100, dec: 2 })
				),
				avalibility: faker.lorem.words(3),
				bio: faker.lorem.paragraph(),
				yearsExperience: faker.number.int({ min: 1, max: 20 }),
				age: faker.number.int({ min: 18, max: 65 }),
			},
		});
		// Each cleaner offers 1-3 services
		const numberServices = faker.number.int({ min: 1, max: 3 });
		for (let serviceIndex = 0; serviceIndex < numberServices; serviceIndex++) {
			await prisma.service.create({
				data: {
					name: faker.commerce.productName(),
					description: faker.commerce.productDescription(),
					categoryId: faker.helpers.arrayElement(categories).id,
					cleanerProfileId: profile.id,
				},
			});
		}
	}

	// Create HomeOwnerProfiles
	for (const owner of homeOwners) {
		await prisma.homeOwnerProfile.create({
			data: {
				userId: owner.id,
				isVerified: faker.datatype.boolean(),
				address: faker.location.streetAddress(),
				preferences: faker.lorem.sentence(),
			},
		});
	}

	// Fetch all services for bookings
	const allServices = await prisma.service.findMany();

	// Create Bookings
	for (let bookingIndex = 0; bookingIndex < 100; bookingIndex++) {
		const homeOwner = faker.helpers.arrayElement(homeOwners);
		const cleaner = faker.helpers.arrayElement(cleaners);
		const service = faker.helpers.arrayElement(allServices);
		const bookingTime = faker.date.soon({ days: 30 });
		const price = Number(faker.finance.amount({ min: 20, max: 200, dec: 2 }));
		const duration = faker.number.int({ min: 60, max: 240 });
		await prisma.booking.create({
			data: {
				bookingTime,
				priceAtBooking: price,
				durationMinutes: duration,
				notes: faker.lorem.sentence(),
				status: faker.helpers.arrayElement(Object.values(BookingStatus)),
				paymentStatus: faker.helpers.arrayElement(Object.values(PaymentStatus)),
				homeOwnerId: homeOwner.id,
				cleanerId: cleaner.id,
				serviceId: service.id,
			},
		});
	}

	console.log("Seed complete!");
}

await seed();
await prisma.$disconnect();
