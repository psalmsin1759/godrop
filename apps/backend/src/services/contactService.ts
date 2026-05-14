import { prisma } from "../lib/prisma";
import { ContactInput } from "../validators/contactValidators";

export async function createContactMessage(data: ContactInput) {
  return prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
    },
  });
}
